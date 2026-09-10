/**
 * GET /api/admin/cv?path=applications/2026/<uuid>-name.pdf
 *
 * Returns a short-lived signed download URL. The bucket stays private, so a
 * link that gets forwarded or ends up in a browser history stops working within
 * minutes rather than granting permanent access to someone's CV.
 */
import {
  type ApiRequest,
  type ApiResponse,
  HttpError,
  fail,
  supabaseAdmin,
} from '../_lib/shared.js';
import { requireAdmin } from '../_lib/adminAuth.js';

const LINK_TTL_SECONDS = 120;
const BUCKET = process.env.SUPABASE_CV_BUCKET || 'cvs';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireAdmin(req);

    const raw = req.query?.path;
    const path = (Array.isArray(raw) ? raw[0] : raw ?? '').trim();

    // Only ever sign paths this app wrote. Without this check, a caller could
    // ask for any object in the bucket by guessing at its key.
    if (!path || path.includes('..') || !/^applications\/\d{4}\/[A-Za-z0-9._-]+$/.test(path)) {
      throw new HttpError(400, 'Invalid file reference');
    }

    const { data, error } = await supabaseAdmin()
      .storage.from(BUCKET)
      .createSignedUrl(path, LINK_TTL_SECONDS, { download: true });

    if (error || !data?.signedUrl) {
      console.error('Signed URL failed:', error);
      throw new HttpError(502, 'Could not prepare the download.');
    }

    res.status(200).json({ url: data.signedUrl, expiresInSeconds: LINK_TTL_SECONDS });
  } catch (err) {
    fail(res, err);
  }
}
