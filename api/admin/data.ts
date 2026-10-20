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
import { requirePage } from '../_lib/adminAuth.js';
import {
  APPLICATION_SEARCH_COLUMNS,
  MESSAGE_SEARCH_COLUMNS,
  applyFilters,
  queryParam,
} from '../_lib/adminQuery.js';

const MAX_LIMIT = 500;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const type = queryParam(req, 'type') || 'applications';
    if (type !== 'applications' && type !== 'messages') {
      throw new HttpError(400, 'Unknown type');
    }
    // The two tabs are separate permissions, so the check follows the type.
    await requirePage(req, type);

    const table = type === 'applications' ? 'job_applications' : 'contact_messages';
    const searchable = type === 'applications' ? APPLICATION_SEARCH_COLUMNS : MESSAGE_SEARCH_COLUMNS;

    const limit = Math.min(Number(queryParam(req, 'limit')) || 200, MAX_LIMIT);

    const query = applyFilters(
      supabaseAdmin()
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit),
      req,
      searchable,
    );

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
