/**
 * POST /api/careers — job application with CV.
 *
 * Body (JSON): { fullName, mobile, email, cvFilename, cvType, cvBase64, companyWebsite }
 *
 * The CV arrives base64-encoded inside JSON rather than as multipart, so the
 * whole file is in memory here and can be checked before anything is stored.
 * Vercel caps a request body at 4.5 MB and base64 adds ~33%, hence the 3 MB
 * limit on the actual file.
 */
import { randomUUID } from 'node:crypto';
import {
  type ApiRequest,
  type ApiResponse,
  HttpError,
  asString,
  clientIp,
  fail,
  isBot,
  methodGuard,
  requireEmail,
  requireMobile,
  requireName,
  supabaseAdmin,
  userAgent,
} from './_lib/shared.js';

const MAX_CV_BYTES = 3 * 1024 * 1024;
const BUCKET = process.env.SUPABASE_CV_BUCKET || 'cvs';

/**
 * Confirms the bytes really are what the extension claims.
 *
 * Extension and Content-Type are both attacker-controlled — renaming
 * payload.exe to cv.pdf defeats a check that only reads the name. These are the
 * documented leading bytes for each accepted format.
 */
function sniffCvType(buf: Buffer): 'pdf' | 'doc' | 'docx' | null {
  if (buf.length < 8) return null;
  if (buf.subarray(0, 4).toString('latin1') === '%PDF') return 'pdf';
  // DOCX (and every OOXML file) is a ZIP archive: "PK\x03\x04"
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) return 'docx';
  // Legacy .doc is an OLE2 compound file
  const ole = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  if (ole.every((b, i) => buf[i] === b)) return 'doc';
  return null;
}

const CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/** Strips directory traversal and anything unusual out of the stored filename. */
function safeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? 'cv';
  return base.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 120) || 'cv';
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!methodGuard(req, res)) return;

  try {
    const body = (typeof req.body === 'object' && req.body ? req.body : {}) as Record<string, unknown>;

    // Silently accept and discard obvious bots.
    if (isBot(body)) {
      res.status(200).json({ ok: true });
      return;
    }

    const fullName = requireName(asString(body.fullName));
    const mobile = requireMobile(asString(body.mobile));
    const email = requireEmail(asString(body.email));

    const cvBase64 = asString(body.cvBase64);
    if (!cvBase64) throw new HttpError(400, 'Please attach your CV');

    let buf: Buffer;
    try {
      buf = Buffer.from(cvBase64, 'base64');
    } catch {
      throw new HttpError(400, 'Could not read the attached file');
    }
    if (buf.length === 0) throw new HttpError(400, 'The attached file is empty');
    if (buf.length > MAX_CV_BYTES) throw new HttpError(413, 'Your CV must be 3 MB or smaller');

    const kind = sniffCvType(buf);
    if (!kind) throw new HttpError(400, 'Please attach a valid PDF, DOC or DOCX file');

    const filename = safeFilename(asString(body.cvFilename) || `cv.${kind}`);
    const objectPath = `applications/${new Date().getFullYear()}/${randomUUID()}-${filename}`;

    const supabase = supabaseAdmin();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, buf, { contentType: CONTENT_TYPES[kind], upsert: false });

    if (uploadError) {
      console.error('CV upload failed:', uploadError);
      throw new HttpError(502, 'We could not store your CV. Please try again.');
    }

    const { error: insertError } = await supabase.from('job_applications').insert({
      full_name: fullName,
      mobile,
      email,
      cv_path: objectPath,
      cv_filename: filename,
      cv_size_bytes: buf.length,
      source_ip: clientIp(req),
      user_agent: userAgent(req),
    });

    if (insertError) {
      // Don't leave an orphan file behind if the row could not be written.
      await supabase.storage.from(BUCKET).remove([objectPath]);
      console.error('Application insert failed:', insertError);
      throw new HttpError(502, 'We could not save your application. Please try again.');
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    fail(res, err);
  }
}
