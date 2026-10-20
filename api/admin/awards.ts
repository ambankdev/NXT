/**
 * /api/admin/awards — list, create, update and delete awards.
 *
 * GET    ?                 list, newest award first, with signed image URLs
 * POST   body { title, description, awardDate, imageBase64?, imageFilename? }
 * PATCH  body { id, ...same fields, removeImage? }
 * DELETE body { id }
 *
 * Images arrive base64-encoded inside JSON rather than as multipart, so the
 * whole file is in memory here and can be checked before anything is stored.
 * Vercel caps a request body at 4.5 MB and base64 adds ~33%, hence the 3 MB
 * limit on the actual file.
 *
 * Nothing on the public site reads this yet.
 */
import { randomUUID } from 'node:crypto';
import {
  type ApiRequest,
  type ApiResponse,
  HttpError,
  asString,
  fail,
  supabaseAdmin,
} from '../_lib/shared.js';
import { requirePage } from '../_lib/adminAuth.js';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const BUCKET = process.env.SUPABASE_AWARDS_BUCKET || 'awards';
const LINK_TTL_SECONDS = 3600;

/**
 * Confirms the bytes really are an image.
 *
 * Extension and Content-Type are both caller-controlled, so this reads the
 * documented leading bytes instead. SVG is deliberately not accepted: it can
 * carry script, and these images are shown back in the admin page.
 */
function sniffImage(buf: Buffer): { ext: string; contentType: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', contentType: 'image/jpeg' };
  }
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: 'png', contentType: 'image/png' };
  }
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') {
    return { ext: 'webp', contentType: 'image/webp' };
  }
  if (buf.subarray(0, 6).toString('latin1') === 'GIF89a' || buf.subarray(0, 6).toString('latin1') === 'GIF87a') {
    return { ext: 'gif', contentType: 'image/gif' };
  }
  return null;
}

function requireTitle(v: string): string {
  if (v.length < 2 || v.length > 150) throw new HttpError(400, 'Title must be 2–150 characters.');
  return v;
}

function requireDescription(v: string): string {
  if (v.length > 2000) throw new HttpError(400, 'Description must be 2000 characters or fewer.');
  return v;
}

/** YYYY-MM-DD, or null when left blank. */
function parseAwardDate(v: unknown): string | null {
  const s = asString(v);
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) {
    throw new HttpError(400, 'Award date must be a valid date.');
  }
  return s;
}

/** Decodes, verifies and stores an image; returns its object key. */
async function storeImage(
  supabase: ReturnType<typeof supabaseAdmin>,
  base64: string,
): Promise<string> {
  let buf: Buffer;
  try {
    buf = Buffer.from(base64, 'base64');
  } catch {
    throw new HttpError(400, 'Could not read the image.');
  }
  if (buf.length === 0) throw new HttpError(400, 'The image is empty.');
  if (buf.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'Image must be 3 MB or smaller.');

  const kind = sniffImage(buf);
  if (!kind) throw new HttpError(400, 'Please attach a JPG, PNG, WEBP or GIF image.');

  const path = `awards/${new Date().getFullYear()}/${randomUUID()}.${kind.ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: kind.contentType, upsert: false });

  if (error) {
    console.error('Award image upload failed:', error);
    throw new HttpError(502, 'Could not store the image. Please try again.');
  }
  return path;
}

/** Best effort: a failed cleanup must not fail the request that triggered it. */
async function removeImage(supabase: ReturnType<typeof supabaseAdmin>, path: string | null) {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error('Award image cleanup failed:', error);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    await requirePage(req, 'awards');
    const supabase = supabaseAdmin();
    const body = (typeof req.body === 'object' && req.body ? req.body : {}) as Record<string, unknown>;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('awards')
        .select('id, title, description, award_date, image_path, created_at, updated_at')
        .order('award_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Award list failed:', error);
        throw new HttpError(502, 'Could not load awards.');
      }

      const rows = data ?? [];
      // The bucket is private, so thumbnails need signed URLs. One call for all.
      const paths = rows.map((r) => r.image_path).filter((p): p is string => !!p);
      const urlByPath = new Map<string, string>();
      if (paths.length) {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrls(paths, LINK_TTL_SECONDS);
        for (const s of signed ?? []) {
          if (!s.error && s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
        }
      }

      res.status(200).json({
        awards: rows.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          awardDate: r.award_date,
          hasImage: !!r.image_path,
          imageUrl: r.image_path ? urlByPath.get(r.image_path) ?? null : null,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })),
      });
      return;
    }

    if (req.method === 'POST') {
      const title = requireTitle(asString(body.title));
      const description = requireDescription(asString(body.description));
      const awardDate = parseAwardDate(body.awardDate);

      const imageBase64 = asString(body.imageBase64);
      const imagePath = imageBase64 ? await storeImage(supabase, imageBase64) : null;

      const { data, error } = await supabase
        .from('awards')
        .insert({ title, description, award_date: awardDate, image_path: imagePath })
        .select('id')
        .single();

      if (error) {
        // Don't leave an orphan image behind if the row could not be written.
        await removeImage(supabase, imagePath);
        console.error('Award create failed:', error);
        throw new HttpError(502, 'Could not save the award.');
      }
      res.status(201).json({ id: data.id });
      return;
    }

    if (req.method === 'PATCH') {
      const id = asString(body.id);
      if (!id) throw new HttpError(400, 'Missing award id.');

      const { data: existing, error: loadError } = await supabase
        .from('awards')
        .select('image_path')
        .eq('id', id)
        .maybeSingle();

      if (loadError) {
        console.error('Award load failed:', loadError);
        throw new HttpError(502, 'Could not update the award.');
      }
      if (!existing) throw new HttpError(404, 'That award no longer exists.');

      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.title !== undefined) patch.title = requireTitle(asString(body.title));
      if (body.description !== undefined) patch.description = requireDescription(asString(body.description));
      if (body.awardDate !== undefined) patch.award_date = parseAwardDate(body.awardDate);

      // A new upload replaces the old file; removeImage clears it entirely.
      let newPath: string | null = null;
      const imageBase64 = asString(body.imageBase64);
      if (imageBase64) {
        newPath = await storeImage(supabase, imageBase64);
        patch.image_path = newPath;
      } else if (body.removeImage) {
        patch.image_path = null;
      }

      const { error } = await supabase.from('awards').update(patch).eq('id', id);
      if (error) {
        await removeImage(supabase, newPath);
        console.error('Award update failed:', error);
        throw new HttpError(502, 'Could not update the award.');
      }

      // Only once the row points elsewhere, so a failure never orphans the row.
      if (patch.image_path !== undefined && existing.image_path) {
        await removeImage(supabase, existing.image_path);
      }

      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      const id = asString(body.id);
      if (!id) throw new HttpError(400, 'Missing award id.');

      const { data: existing } = await supabase
        .from('awards')
        .select('image_path')
        .eq('id', id)
        .maybeSingle();

      if (!existing) throw new HttpError(404, 'That award no longer exists.');

      const { error } = await supabase.from('awards').delete().eq('id', id);
      if (error) {
        console.error('Award delete failed:', error);
        throw new HttpError(502, 'Could not delete the award.');
      }
      await removeImage(supabase, existing.image_path);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    fail(res, err);
  }
}
