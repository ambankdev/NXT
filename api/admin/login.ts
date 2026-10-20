/**
 * POST /api/admin/login — body { email?, password }.
 *
 * With an email, signs in that account. Without one, the password is checked
 * against ADMIN_PASSWORD and grants the break-glass owner session, which is
 * how the first account gets created and how a bad role edit is undone.
 */
import {
  type ApiRequest,
  type ApiResponse,
  asString,
  fail,
  methodGuard,
  supabaseAdmin,
} from '../_lib/shared.js';
import {
  breakGlassMatches,
  breakGlassToken,
  issueToken,
  setSessionCookie,
  verifyPassword,
} from '../_lib/adminAuth.js';

/** Small fixed delay on every attempt, so brute forcing over the network is slow. */
const ATTEMPT_DELAY_MS = 600;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res)) return;

  try {
    const body = (typeof req.body === 'object' && req.body ? req.body : {}) as Record<string, unknown>;
    const email = asString(body.email).toLowerCase();
    const password = asString(body.password);

    await new Promise((r) => setTimeout(r, ATTEMPT_DELAY_MS));

    if (!email) {
      if (!breakGlassMatches(password)) {
        res.status(401).json({ error: 'Incorrect password.' });
        return;
      }
      setSessionCookie(res, breakGlassToken());
      res.status(200).json({ ok: true, breakGlass: true });
      return;
    }

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, password_hash, is_active')
      .ilike('email', email)
      .maybeSingle();

    if (error) {
      console.error('Login lookup failed:', error);
      res.status(502).json({ error: 'Could not sign you in. Please try again.' });
      return;
    }

    // One message for a wrong email, a wrong password and a disabled account:
    // anything more specific confirms which addresses exist.
    if (!data || !data.is_active || !verifyPassword(password, data.password_hash)) {
      res.status(401).json({ error: 'Incorrect email or password.' });
      return;
    }

    // Best effort: a failed timestamp update shouldn't block the sign-in.
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.id);

    setSessionCookie(res, issueToken(data.id));
    res.status(200).json({ ok: true });
  } catch (err) {
    fail(res, err);
  }
}
