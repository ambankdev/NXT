/**
 * GET /api/admin/cv-batch?q=&from=&to=
 *
 * Signed download links for every CV matching the admin page's current
 * filters, for zipping in the browser.
 *
 * The ZIP is built client-side on purpose: Vercel caps a function response at
 * about 4.5 MB, which a batch of CVs would exceed quickly. The browser fetches
 * each file straight from Supabase instead, so nothing large passes through
 * this function.
 *
 * The row selection is re-run here from the filters rather than taking a list
 * of paths from the browser, so a caller can only ever sign CVs that belong to
 * real applications.
 */
import {
  type ApiRequest,
  type ApiResponse,
  HttpError,
  fail,
  supabaseAdmin,
} from '../_lib/shared.js';
import { requireAdmin } from '../_lib/adminAuth.js';
import { APPLICATION_SEARCH_COLUMNS, applyFilters } from '../_lib/adminQuery.js';

/** CVs are up to 3 MB each and all held in browser memory while zipping. */
const MAX_BATCH = 200;
/** Long enough to fetch a full batch a few at a time on a slow connection. */
const LINK_TTL_SECONDS = 600;
const BUCKET = process.env.SUPABASE_CV_BUCKET || 'cvs';

interface Row {
  created_at: string;
  full_name: string;
  cv_path: string;
  cv_filename: string;
  cv_size_bytes: number;
}

/** Characters Windows, macOS or ZIP tools reject in a file name. */
function safePart(s: string): string {
  return s.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 80);
}

/** "2026-09-18 Jane Doe - cv.pdf", made unique within the archive. */
function archiveNames(rows: Row[]): string[] {
  const seen = new Map<string, number>();
  return rows.map((r) => {
    const base = `${r.created_at.slice(0, 10)} ${safePart(r.full_name)} - ${safePart(r.cv_filename)}`;
    const n = seen.get(base.toLowerCase()) ?? 0;
    seen.set(base.toLowerCase(), n + 1);
    if (n === 0) return base;
    const dot = base.lastIndexOf('.');
    return dot > 0 ? `${base.slice(0, dot)} (${n + 1})${base.slice(dot)}` : `${base} (${n + 1})`;
  });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireAdmin(req);
    const supabase = supabaseAdmin();

    // One row over the cap tells us the batch is too big without a separate count.
    const { data, error } = await applyFilters(
      supabase
        .from('job_applications')
        .select('created_at, full_name, cv_path, cv_filename, cv_size_bytes')
        .order('created_at', { ascending: true })
        .limit(MAX_BATCH + 1),
      req,
      APPLICATION_SEARCH_COLUMNS,
    );

    if (error) {
      console.error('CV batch query failed:', error);
      throw new HttpError(502, 'Could not load applications.');
    }

    const rows = (data ?? []) as Row[];
    if (rows.length === 0) {
      res.status(200).json({ files: [] });
      return;
    }
    if (rows.length > MAX_BATCH) {
      throw new HttpError(
        413,
        `More than ${MAX_BATCH} CVs match. Narrow the date range and download in parts.`,
      );
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(rows.map((r) => r.cv_path), LINK_TTL_SECONDS);

    if (signError || !signed) {
      console.error('CV batch signing failed:', signError);
      throw new HttpError(502, 'Could not prepare the downloads.');
    }

    // Matched by path rather than position, so ordering is never assumed.
    const urlByPath = new Map<string, string>();
    for (const s of signed) {
      if (!s.error && s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
    }

    const names = archiveNames(rows);
    const files = rows.map((r, i) => ({
      name: names[i],
      size: r.cv_size_bytes,
      // A missing object (e.g. deleted by hand in the dashboard) comes back
      // without a URL rather than failing the whole batch; the page reports it.
      url: urlByPath.get(r.cv_path) ?? null,
    }));

    res.status(200).json({ files });
  } catch (err) {
    fail(res, err);
  }
}
