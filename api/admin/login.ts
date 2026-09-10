/** POST /api/admin/login — body { password }. Sets the session cookie. */
import {
  type ApiRequest,
  type ApiResponse,
  asString,
  fail,
  methodGuard,
} from '../_lib/shared.js';
import { issueToken, passwordMatches, setSessionCookie } from '../_lib/adminAuth.js';

/** Small fixed delay on every attempt, so brute forcing over the network is slow. */
const ATTEMPT_DELAY_MS = 600;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res)) return;

  try {
    const body = (typeof req.body === 'object' && req.body ? req.body : {}) as Record<string, unknown>;
    await new Promise((r) => setTimeout(r, ATTEMPT_DELAY_MS));

    if (!passwordMatches(asString(body.password))) {
      res.status(401).json({ error: 'Incorrect password.' });
      return;
    }

    setSessionCookie(res, issueToken());
    res.status(200).json({ ok: true });
  } catch (err) {
    fail(res, err);
  }
}
