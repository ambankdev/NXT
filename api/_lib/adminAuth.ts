/**
 * Named admin accounts with database-defined roles.
 *
 * Signing in returns a signed, expiring token naming the user; the password
 * itself never reaches the browser and is never stored in a cookie. The role
 * is re-read from the database on every request rather than carried in the
 * token, so changing or deactivating an account takes effect immediately
 * instead of when the session happens to expire.
 *
 * ADMIN_PASSWORD still works as a break-glass owner login. Roles are editable
 * in the UI, so without it a bad edit could leave nobody able to fix access.
 */
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { type ApiRequest, type ApiResponse, HttpError, supabaseAdmin } from './shared.js';
import { PAGES, type Page, normalisePages } from './permissions.js';

const COOKIE_NAME = 'nxt_admin';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // one working day
/** Identifies the break-glass session; never a real admin_users.id (a uuid). */
const BREAK_GLASS_ID = '__owner__';

export interface AdminIdentity {
  id: string;
  email: string;
  fullName: string;
  roleName: string;
  pages: Page[];
  isBreakGlass: boolean;
}

/* ---------------------------------------------------------------- passwords */

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT.keylen, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  try {
    const expected = Buffer.from(hashB64, 'base64');
    const actual = scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** Rules mirrored in the UI; re-applied here because the browser can be bypassed. */
export function assertPasswordStrength(password: string): void {
  if (password.length < 10) {
    throw new HttpError(400, 'Password must be at least 10 characters.');
  }
  if (password.length > 200) {
    throw new HttpError(400, 'Password must be 200 characters or fewer.');
  }
}

/* ----------------------------------------------------------------- sessions */

/**
 * Key for session signatures. A dedicated secret is preferred; without one it
 * is derived from the service role key, which is already required for the app
 * to work at all. Either way it never leaves the server.
 */
function signingKey(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new HttpError(503, 'Admin access is not configured.');
  return createHash('sha256').update(`${secret}|nxt-admin-session-v2`).digest();
}

export function issueToken(userId: string): string {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${createHmac('sha256', signingKey()).update(payload).digest('hex')}`;
}

function parseToken(token: string): { userId: string } | null {
  const idx = token.lastIndexOf('.');
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const signature = token.slice(idx + 1);

  const expected = createHmac('sha256', signingKey()).update(payload).digest('hex');
  const given = Buffer.from(signature, 'hex');
  const want = Buffer.from(expected, 'hex');
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;

  const dot = payload.lastIndexOf('.');
  if (dot < 0) return null;
  const userId = payload.slice(0, dot);
  if (Number(payload.slice(dot + 1)) <= Date.now()) return null;

  return { userId };
}

function readCookie(req: ApiRequest, name: string): string | null {
  const header = req.headers.cookie;
  const raw = Array.isArray(header) ? header[0] : header;
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

export function setSessionCookie(res: ApiResponse, token: string): void {
  // HttpOnly keeps the token out of reach of any script on the page, so an XSS
  // bug can't lift the session. Secure + SameSite=Strict block interception and
  // cross-site submission.
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`
  );
}

export function clearSessionCookie(res: ApiResponse): void {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`);
}

/* -------------------------------------------------------------- break glass */

export function breakGlassPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD ?? '';
  return pw.length >= 10 ? pw : null;
}

export function breakGlassMatches(candidate: string): boolean {
  const pw = breakGlassPassword();
  if (!pw) return false;
  // Hash both sides first so the compare is over equal-length buffers.
  const a = createHash('sha256').update(candidate).digest();
  const b = createHash('sha256').update(pw).digest();
  return timingSafeEqual(a, b);
}

export function breakGlassToken(): string {
  return issueToken(BREAK_GLASS_ID);
}

const BREAK_GLASS_IDENTITY: AdminIdentity = {
  id: BREAK_GLASS_ID,
  email: '',
  fullName: 'Owner (shared password)',
  roleName: 'Owner',
  pages: [...PAGES],
  isBreakGlass: true,
};

/* ------------------------------------------------------------ authorisation */

/** Resolves the caller, or throws 401. Re-reads the role on every request. */
export async function currentAdmin(req: ApiRequest): Promise<AdminIdentity> {
  const token = readCookie(req, COOKIE_NAME);
  const parsed = token ? parseToken(token) : null;
  if (!parsed) throw new HttpError(401, 'Please sign in again.');

  if (parsed.userId === BREAK_GLASS_ID) {
    // Only valid while the shared password is still configured.
    if (!breakGlassPassword()) throw new HttpError(401, 'Please sign in again.');
    return BREAK_GLASS_IDENTITY;
  }

  const { data, error } = await supabaseAdmin()
    .from('admin_users')
    .select('id, email, full_name, is_active, admin_roles ( name, pages )')
    .eq('id', parsed.userId)
    .maybeSingle();

  if (error) {
    console.error('Admin lookup failed:', error);
    throw new HttpError(502, 'Could not verify your account.');
  }
  if (!data || !data.is_active) throw new HttpError(401, 'Please sign in again.');

  // PostgREST types an embedded one-to-one as an array.
  const role = (Array.isArray(data.admin_roles) ? data.admin_roles[0] : data.admin_roles) as
    | { name: string; pages: unknown }
    | null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    roleName: role?.name ?? 'No role',
    pages: normalisePages(role?.pages),
    isBreakGlass: false,
  };
}

/** Resolves the caller and throws 403 unless they may open `page`. */
export async function requirePage(req: ApiRequest, page: Page): Promise<AdminIdentity> {
  const admin = await currentAdmin(req);
  if (!admin.pages.includes(page)) {
    throw new HttpError(403, 'You do not have access to this section.');
  }
  return admin;
}

/**
 * Guards against an edit that would leave nobody able to manage access.
 *
 * The break-glass password means a real lockout is impossible, but falling back
 * to it is unpleasant, so edits that would strand everyone are refused.
 * `excludeUserId` ignores the user being deleted or deactivated.
 */
export async function assertAccessManagerRemains(excludeUserId?: string): Promise<void> {
  const { data, error } = await supabaseAdmin()
    .from('admin_users')
    .select('id, admin_roles ( pages )')
    .eq('is_active', true);

  if (error) {
    console.error('Access-manager check failed:', error);
    throw new HttpError(502, 'Could not verify remaining access.');
  }

  const stillThere = (data ?? []).some((row) => {
    if (excludeUserId && row.id === excludeUserId) return false;
    const role = (Array.isArray(row.admin_roles) ? row.admin_roles[0] : row.admin_roles) as
      | { pages: unknown }
      | null;
    return normalisePages(role?.pages).includes('users');
  });

  if (!stillThere) {
    throw new HttpError(
      409,
      'This would leave no active user able to manage Users. Give someone else that access first.',
    );
  }
}
