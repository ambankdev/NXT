/**
 * GET  /api/admin/me — who is signed in and which pages they may open.
 * POST /api/admin/me — body { currentPassword, newPassword } to change own password.
 *
 * The page calls GET on load to decide which tabs to render. Every endpoint
 * still checks permission itself; hiding a tab is a convenience, not the guard.
 */
import {
  type ApiRequest,
  type ApiResponse,
  HttpError,
  asString,
  fail,
  supabaseAdmin,
} from '../_lib/shared.js';
import {
  assertPasswordStrength,
  currentAdmin,
  hashPassword,
  verifyPassword,
} from '../_lib/adminAuth.js';
import { PAGES, PAGE_LABELS } from '../_lib/permissions.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    const admin = await currentAdmin(req);

    if (req.method === 'GET') {
      res.status(200).json({
        user: {
          id: admin.id,
          email: admin.email,
          fullName: admin.fullName,
          roleName: admin.roleName,
          isBreakGlass: admin.isBreakGlass,
        },
        pages: admin.pages,
        allPages: PAGES.map((key) => ({ key, label: PAGE_LABELS[key] })),
      });
      return;
    }

    if (req.method === 'POST') {
      if (admin.isBreakGlass) {
        throw new HttpError(
          400,
          'The shared owner password is set in Vercel, not here. Change ADMIN_PASSWORD there.',
        );
      }

      const body = (typeof req.body === 'object' && req.body ? req.body : {}) as Record<string, unknown>;
      const currentPassword = asString(body.currentPassword);
      const newPassword = asString(body.newPassword);
      assertPasswordStrength(newPassword);

      const supabase = supabaseAdmin();
      const { data, error } = await supabase
        .from('admin_users')
        .select('password_hash')
        .eq('id', admin.id)
        .maybeSingle();

      if (error || !data) {
        console.error('Password change lookup failed:', error);
        throw new HttpError(502, 'Could not change your password.');
      }
      if (!verifyPassword(currentPassword, data.password_hash)) {
        throw new HttpError(401, 'Your current password is incorrect.');
      }

      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ password_hash: hashPassword(newPassword) })
        .eq('id', admin.id);

      if (updateError) {
        console.error('Password change failed:', updateError);
        throw new HttpError(502, 'Could not change your password.');
      }

      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    fail(res, err);
  }
}
