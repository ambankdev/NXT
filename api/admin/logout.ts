/** POST /api/admin/logout — clears the session cookie. */
import { type ApiRequest, type ApiResponse, fail, methodGuard } from '../_lib/shared.js';
import { clearSessionCookie } from '../_lib/adminAuth.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res)) return;
  try {
    clearSessionCookie(res);
    res.status(200).json({ ok: true });
  } catch (err) {
    fail(res, err);
  }
}
