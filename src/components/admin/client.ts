/** Shared fetch helper for the admin panels. */

/** Thrown when the session has expired, so the page can show the login screen. */
export class Unauthorized extends Error {}

export async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body
      ? { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }
      : init?.headers,
  });

  if (res.status === 401) throw new Unauthorized('Your session has expired. Please sign in again.');
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export const json = (body: unknown): RequestInit['body'] => JSON.stringify(body);

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

/** Date only, for an award date that carries no time. */
export const fmtDay = (ymd: string | null) =>
  ymd
    ? new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
      })
    : '—';

export const BRAND_GRADIENT = 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)';
