/**
 * /api/admin/roles — list, create, update and delete roles.
 *
 * GET    ?                 list roles with how many users hold each
 * POST   body { name, pages }
 * PATCH  body { id, name?, pages? }
 * DELETE body { id }
 *
 * The Owner role is built in: its pages are fixed and it cannot be deleted, so
 * there is always one role that can reach every page.
 */
import {
  type ApiRequest,
  type ApiResponse,
  HttpError,
  asString,
  fail,
  supabaseAdmin,
} from '../_lib/shared.js';
import { assertAccessManagerRemains, requirePage } from '../_lib/adminAuth.js';
import { normalisePages } from '../_lib/permissions.js';

function requireRoleName(v: string): string {
  if (v.length < 2 || v.length > 40) throw new HttpError(400, 'Role name must be 2–40 characters.');
  return v;
}

/** Postgres unique-violation; the role name index is case-insensitive. */
function isDuplicate(error: { code?: string } | null): boolean {
  return error?.code === '23505';
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    await requirePage(req, 'roles');
    const supabase = supabaseAdmin();
    const body = (typeof req.body === 'object' && req.body ? req.body : {}) as Record<string, unknown>;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('id, name, pages, is_system, admin_users ( count )')
        .order('is_system', { ascending: false })
        .order('name');

      if (error) {
        console.error('Role list failed:', error);
        throw new HttpError(502, 'Could not load roles.');
      }

      const roles = (data ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        pages: normalisePages(r.pages),
        isSystem: r.is_system,
        userCount: (r.admin_users as { count: number }[] | null)?.[0]?.count ?? 0,
      }));
      res.status(200).json({ roles });
      return;
    }

    if (req.method === 'POST') {
      const name = requireRoleName(asString(body.name));
      const pages = normalisePages(body.pages);

      const { data, error } = await supabase
        .from('admin_roles')
        .insert({ name, pages, is_system: false })
        .select('id')
        .single();

      if (isDuplicate(error)) throw new HttpError(409, 'A role with that name already exists.');
      if (error) {
        console.error('Role create failed:', error);
        throw new HttpError(502, 'Could not create the role.');
      }
      res.status(201).json({ id: data.id });
      return;
    }

    if (req.method === 'PATCH') {
      const id = asString(body.id);
      if (!id) throw new HttpError(400, 'Missing role id.');

      const { data: existing, error: loadError } = await supabase
        .from('admin_roles')
        .select('is_system, pages')
        .eq('id', id)
        .maybeSingle();

      if (loadError) {
        console.error('Role load failed:', loadError);
        throw new HttpError(502, 'Could not update the role.');
      }
      if (!existing) throw new HttpError(404, 'That role no longer exists.');

      const patch: Record<string, unknown> = {};
      if (body.name !== undefined) patch.name = requireRoleName(asString(body.name));
      if (body.pages !== undefined) {
        if (existing.is_system) {
          throw new HttpError(400, 'The Owner role always has every page.');
        }
        patch.pages = normalisePages(body.pages);
      }
      if (Object.keys(patch).length === 0) {
        res.status(200).json({ ok: true });
        return;
      }

      const { error } = await supabase.from('admin_roles').update(patch).eq('id', id);
      if (isDuplicate(error)) throw new HttpError(409, 'A role with that name already exists.');
      if (error) {
        console.error('Role update failed:', error);
        throw new HttpError(502, 'Could not update the role.');
      }

      // Checked after the write, because the rule is about the resulting state:
      // dropping `users` from this role may have stranded everyone. There are no
      // transactions over PostgREST, so restore the previous pages on failure.
      if (patch.pages !== undefined) {
        try {
          await assertAccessManagerRemains();
        } catch (err) {
          await supabase
            .from('admin_roles')
            .update({ pages: normalisePages(existing.pages) })
            .eq('id', id);
          throw err;
        }
      }

      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      const id = asString(body.id);
      if (!id) throw new HttpError(400, 'Missing role id.');

      const { data: existing } = await supabase
        .from('admin_roles')
        .select('is_system')
        .eq('id', id)
        .maybeSingle();

      if (!existing) throw new HttpError(404, 'That role no longer exists.');
      if (existing.is_system) throw new HttpError(400, 'The Owner role cannot be deleted.');

      const { error } = await supabase.from('admin_roles').delete().eq('id', id);
      // on delete restrict: the role still has users attached.
      if (error?.code === '23503') {
        throw new HttpError(409, 'Move the users on this role to another role first.');
      }
      if (error) {
        console.error('Role delete failed:', error);
        throw new HttpError(502, 'Could not delete the role.');
      }
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    fail(res, err);
  }
}
