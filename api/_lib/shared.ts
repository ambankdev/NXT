/**
 * Shared helpers for the serverless form handlers.
 *
 * Files prefixed with `_` are not exposed as routes by Vercel, so this stays a
 * private module rather than becoming /api/_lib/shared.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/* Minimal shapes of Vercel's Node request/response, declared locally so this
 * directory needs no extra dependency and stays outside the app's tsconfig. */
export interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}
export interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
  end(): void;
}

export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

/**
 * Service-role client. This key bypasses Row Level Security, so it must only
 * ever live in a server-side env var — never one prefixed VITE_, which Vite
 * inlines into the public browser bundle.
 */
export function supabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new HttpError(503, 'This form is not configured yet. Please try again later.');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export function clientIp(req: ApiRequest): string | null {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return raw ? raw.split(',')[0].trim() : null;
}

export function userAgent(req: ApiRequest): string | null {
  const ua = req.headers['user-agent'];
  return (Array.isArray(ua) ? ua[0] : ua) ?? null;
}

export function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/* ---- validation, mirrored from src/lib/forms.ts and re-applied here ---- */

export function requireName(v: string, field = 'Full name'): string {
  if (v.length < 2 || v.length > 100) throw new HttpError(400, `${field} is invalid`);
  return v;
}

export function requireMobile(v: string): string {
  if (!/^[\d+\-()\s]{6,20}$/.test(v)) throw new HttpError(400, 'Mobile number is invalid');
  return v;
}

export function requireEmail(v: string): string {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || v.length > 254) {
    throw new HttpError(400, 'Email address is invalid');
  }
  return v;
}

export function requireLength(v: string, min: number, max: number, field: string): string {
  if (v.length < min || v.length > max) throw new HttpError(400, `${field} is invalid`);
  return v;
}

/**
 * Rejects a submission whose hidden honeypot field was filled.
 *
 * Returns 200 rather than an error on purpose: a bot that sees a rejection can
 * adapt, whereas one that sees success moves on. Nothing is stored either way.
 */
export function isBot(body: Record<string, unknown>): boolean {
  return asString(body.companyWebsite).length > 0;
}

export function methodGuard(req: ApiRequest, res: ApiResponse): boolean {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  return true;
}

export function fail(res: ApiResponse, err: unknown): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  // Never leak internals (connection strings, stack traces) to the browser.
  console.error('Unhandled form error:', err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
