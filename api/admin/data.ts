/**
 * GET /api/admin/data?type=applications|messages&q=&from=&to=&limit=
 *
 * Search and date filtering run in Postgres rather than the browser, so a
 * viewer only ever receives the rows they asked for.
 */
import {
  type ApiRequest,
  type ApiResponse,
  HttpError,
  fail,
  supabaseAdmin,
} from '../_lib/shared.js';
import { requireAdmin } from '../_lib/adminAuth.js';

const MAX_LIMIT = 500;

function q(req: ApiRequest, key: string): string {
  const v = req.query?.[key];
  const s = Array.isArray(v) ? v[0] : v;
  return (s ?? '').trim();
}

/** Escapes the wildcards PostgREST's ilike filter would otherwise interpret. */
function escapeLike(term: string): string {
  return term.replace(/[%_,()]/g, '');
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireAdmin(req);

    const type = q(req, 'type') || 'applications';
    if (type !== 'applications' && type !== 'messages') {
      throw new HttpError(400, 'Unknown type');
    }

    const table = type === 'applications' ? 'job_applications' : 'contact_messages';
    const searchable =
      type === 'applications'
        ? ['full_name', 'email', 'mobile']
        : ['full_name', 'mobile', 'subject', 'message'];

    const limit = Math.min(Number(q(req, 'limit')) || 200, MAX_LIMIT);

    let query = supabaseAdmin()
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    const term = escapeLike(q(req, 'q'));
    if (term) {
      query = query.or(searchable.map((col) => `${col}.ilike.%${term}%`).join(','));
    }

    const from = q(req, 'from');
    if (from) query = query.gte('created_at', `${from}T00:00:00.000Z`);

    const to = q(req, 'to');
    if (to) query = query.lte('created_at', `${to}T23:59:59.999Z`);

    const { data, error } = await query;
    if (error) {
      console.error('Admin query failed:', error);
      throw new HttpError(502, 'Could not load records.');
    }

    res.status(200).json({ rows: data ?? [], truncated: (data?.length ?? 0) >= limit });
  } catch (err) {
    fail(res, err);
  }
}
