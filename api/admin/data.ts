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

/** Offered in the UI; anything else falls back to the default. */
export const PAGE_SIZES = [25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 25;

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

    const requestedSize = Number(queryParam(req, 'pageSize'));
    const pageSize = (PAGE_SIZES as readonly number[]).includes(requestedSize)
      ? requestedSize
      : DEFAULT_PAGE_SIZE;
    const page = Math.max(1, Math.floor(Number(queryParam(req, 'page')) || 1));
    const offset = (page - 1) * pageSize;

    // count: 'exact' returns the number of rows matching the filters, not just
    // the page, which is what lets the UI show "page 2 of 9".
    const query = applyFilters(
      supabaseAdmin()
        .from(table)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1),
      req,
      searchable,
    );

    const { data, error, count } = await query;
    if (error) {
      // Asking for a page past the end is a client mistake, not a server fault;
      // PostgREST reports it as an unsatisfiable range.
      if (error.code === 'PGRST103') {
        res.status(200).json({ rows: [], total: 0, page, pageSize });
        return;
      }
      console.error('Admin query failed:', error);
      throw new HttpError(502, 'Could not load records.');
    }

    res.status(200).json({ rows: data ?? [], total: count ?? 0, page, pageSize });
  } catch (err) {
    fail(res, err);
  }
}
