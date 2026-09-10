/**
 * Shared-password session handling for /admin.
 *
 * The password itself never reaches the browser and is never stored in a
 * cookie. Logging in returns a signed, expiring token; every later request is
 * authorised by verifying that signature.
 *
 * The signing key is derived from ADMIN_PASSWORD, which means changing the
 * password immediately invalidates every existing session — useful when
 * someone leaves — and keeps setup to a single environment variable.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { type ApiRequest, type ApiResponse, HttpError } from './shared.js';

const COOKIE_NAME = 'nxt_admin';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // one working day

function adminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD ?? '';
  if (pw.length < 10) {
    // Refuse to run rather than protect applicant data with a weak secret.
    throw new HttpError(503, 'Admin access is not configured.');
  }
  return pw;
}

function signingKey(): Buffer {
  return createHash('sha256').update(`${adminPassword()}|nxt-admin-session-v1`).digest();
}

/** Constant-time compare so response timing can't be used to guess the password. */
export function passwordMatches(candidate: string): boolean {
  const a = createHash('sha256').update(candidate).digest();
  const b = createHash('sha256').update(adminPassword()).digest();
  return timingSafeEqual(a, b);
}

export function issueToken(): string {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  const signature = createHmac('sha256', signingKey()).update(expiresAt).digest('hex');
  return `${expiresAt}.${signature}`;
}

function tokenIsValid(token: string): boolean {
  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature) return false;

  const expected = createHmac('sha256', signingKey()).update(expiresAt).digest('hex');
  const given = Buffer.from(signature, 'hex');
  const want = Buffer.from(expected, 'hex');
  if (given.length !== want.length || !timingSafeEqual(given, want)) return false;

  return Number(expiresAt) > Date.now();
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

/** Throws 401 unless the request carries a valid session. */
export function requireAdmin(req: ApiRequest): void {
  const token = readCookie(req, COOKIE_NAME);
  if (!token || !tokenIsValid(token)) {
    throw new HttpError(401, 'Please sign in again.');
  }
}
