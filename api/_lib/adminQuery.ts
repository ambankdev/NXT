/**
 * Search and date filters shared by the admin endpoints, so the table and the
 * batch CV download always select exactly the same rows.
 */
import type { ApiRequest } from './shared.js';

export function queryParam(req: ApiRequest, key: string): string {
  const v = req.query?.[key];
  const s = Array.isArray(v) ? v[0] : v;
  return (s ?? '').trim();
}

/** Escapes the wildcards PostgREST's ilike filter would otherwise interpret. */
function escapeLike(term: string): string {
  return term.replace(/[%_,()]/g, '');
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The subset of the PostgREST builder these filters use. */
interface Filterable<T> {
  or(filters: string): T;
  gte(column: string, value: string): T;
  lte(column: string, value: string): T;
}

/**
 * Applies ?q=, ?from= and ?to= (YYYY-MM-DD, inclusive, UTC day boundaries).
 * Malformed dates are ignored rather than passed through to Postgres.
 */
export function applyFilters<T extends Filterable<T>>(
  query: T,
  req: ApiRequest,
  searchable: string[],
): T {
  const term = escapeLike(queryParam(req, 'q'));
  if (term) {
    query = query.or(searchable.map((col) => `${col}.ilike.%${term}%`).join(','));
  }

  const from = queryParam(req, 'from');
  if (DATE.test(from)) query = query.gte('created_at', `${from}T00:00:00.000Z`);

  const to = queryParam(req, 'to');
  if (DATE.test(to)) query = query.lte('created_at', `${to}T23:59:59.999Z`);

  return query;
}

export const APPLICATION_SEARCH_COLUMNS = ['full_name', 'email', 'mobile'];
export const MESSAGE_SEARCH_COLUMNS = ['full_name', 'mobile', 'subject', 'message'];
