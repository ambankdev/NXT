/**
 * POST /api/contact — contact form.
 *
 * Body (JSON): { fullName, mobile, subject, message, companyWebsite }
 */
import {
  type ApiRequest,
  type ApiResponse,
  asString,
  clientIp,
  fail,
  isBot,
  methodGuard,
  requireLength,
  requireMobile,
  requireName,
  supabaseAdmin,
  userAgent,
} from './_lib/shared.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res)) return;

  try {
    const body = (typeof req.body === 'object' && req.body ? req.body : {}) as Record<string, unknown>;

    if (isBot(body)) {
      res.status(200).json({ ok: true });
      return;
    }

    const fullName = requireName(asString(body.fullName));
    const mobile = requireMobile(asString(body.mobile));
    const subject = requireLength(asString(body.subject), 2, 150, 'Subject');
    const message = requireLength(asString(body.message), 10, 5000, 'Message');

    const { error } = await supabaseAdmin().from('contact_messages').insert({
      full_name: fullName,
      mobile,
      subject,
      message,
      source_ip: clientIp(req),
      user_agent: userAgent(req),
    });

    if (error) {
      console.error('Contact insert failed:', error);
      throw new Error('insert failed');
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    fail(res, err);
  }
}
