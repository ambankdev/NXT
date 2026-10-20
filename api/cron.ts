/**
 * GET /api/cron — keeps the Supabase project from auto-pausing.
 *
 * A free-tier Supabase project pauses after about a week without activity, and
 * a paused project stops resolving in DNS: that is the ENOTFOUND that took the
 * careers form down. One trivial query a day counts as activity.
 *
 * This is a workaround, not a fix. Upgrading the project to Supabase Pro
 * removes auto-pausing altogether and is the right answer if these forms
 * matter; keep this cron only while the project stays on the free plan.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
 * It is verified when present, so nobody else can trigger this.
 */
import { type ApiRequest, type ApiResponse, supabaseAdmin } from './_lib/shared.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = req.headers.authorization;
    const given = Array.isArray(header) ? header[0] : header;
    if (given !== `Bearer ${secret}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  try {
    // Cheapest possible read: a count, no rows returned. Enough to register as
    // activity on both the database and the API gateway.
    const { error } = await supabaseAdmin()
      .from('job_applications')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Keep-alive query failed:', error);
      res.status(502).json({ ok: false, error: error.message });
      return;
    }

    res.status(200).json({ ok: true, at: new Date().toISOString() });
  } catch (err) {
    // Logged rather than thrown: a failed ping should show up in the cron run,
    // not take anything else down.
    console.error('Keep-alive failed:', err);
    res.status(500).json({ ok: false });
  }
}
