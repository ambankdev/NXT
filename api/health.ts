/**
 * GET /api/health — TEMPORARY diagnostic for the form setup.
 *
 * Reports only whether each environment variable is PRESENT and whether the
 * database objects exist. It never returns a variable's value, and never echoes
 * any part of the service-role key.
 *
 * DELETE THIS FILE once the forms are confirmed working — a bank's site should
 * not expose configuration state to anonymous callers, however harmless.
 */
import { createClient } from '@supabase/supabase-js';
import type { ApiRequest, ApiResponse } from './_lib/shared.js';

export default async function handler(_req: ApiRequest, res: ApiResponse) {
  const url = process.env.SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const bucket = process.env.SUPABASE_CV_BUCKET || 'cvs';

  const report: Record<string, unknown> = {
    SUPABASE_URL: {
      present: url.length > 0,
      looksLikeSupabaseUrl: /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url),
      hasTrailingSlash: url.endsWith('/'),
      hasWhitespace: url !== url.trim(),
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      present: key.length > 0,
      length: key.length, // a real key is long; a truncated paste shows up here
      hasWhitespace: key !== key.trim(),
      looksLikeAnonKeyByMistake: key.includes('"role":"anon"'),
    },
    SUPABASE_CV_BUCKET: bucket,
  };

  if (url && key) {
    try {
      const supabase = createClient(url.trim(), key.trim(), { auth: { persistSession: false } });

      const jobs = await supabase.from('job_applications').select('id', { count: 'exact', head: true });
      const msgs = await supabase.from('contact_messages').select('id', { count: 'exact', head: true });
      const buckets = await supabase.storage.listBuckets();

      report.database = {
        job_applications: jobs.error ? `ERROR: ${jobs.error.message}` : 'ok',
        contact_messages: msgs.error ? `ERROR: ${msgs.error.message}` : 'ok',
        cvsBucketExists: buckets.error
          ? `ERROR: ${buckets.error.message}`
          : buckets.data.some((b) => b.name === bucket),
      };
    } catch (err) {
      report.database = `connection failed: ${err instanceof Error ? err.message : 'unknown'}`;
    }
  } else {
    report.database = 'skipped — credentials missing';
  }

  res.status(200).json(report);
}
