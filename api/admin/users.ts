/**
 * /api/admin/users — list, create, update and delete admin accounts.
 *
 * GET    ?                 list users with their role
 * POST   body { email, fullName, password, roleId }
 * PATCH  body { id, fullName?, roleId?, isActive?, password? }
 * DELETE body { id }
 *
 * Anyone with this page can grant any role, including one holding this page.
 * There is no lower-privileged form of it, which the UI says plainly.
 */
import {
  type ApiRequest,
  type ApiResponse,
  HttpError,
  asString,
  fail,
  requireEmail,
  requireName,
  supabaseAdmin,
} from '../_lib/shared.js';
import {
  assertAccessManagerRemains,
  assertPasswordStrength,
  hashPassword,
  requirePage,
} from '../_lib/adminAuth.js';
import { normalisePages } from '../_lib/permissions.js';

interface RoleRef {
  id: string;
  name: string;
  pages: unknown;
}

function roleOf(row: { admin_roles?: unknown }): RoleRef | null {
  const r = Array.isArray(row.admin_roles) ? row.admin_roles[0] : row.admin_roles;
  return (r as RoleRef) ?? null;
}

async function assertRoleExists(roleId: string): Promise<void> {
  const { data } = await supabaseAdmin()
    .from('admin_roles')
    .select('id')
    .eq('id', roleId)
    .maybeSingle();
  if (!data) throw new HttpError(400, 'That role no longer exists.');
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    const admin = await requirePage(req, 'users');
    const supabase = supabaseAdmin();
    const body = (typeof req.body === 'object' && req.body ? req.body : {}) as Record<string, unknown>;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, full_name, is_active, created_at, last_login_at, admin_roles ( id, name, pages )')
        .order('full_name');

      if (error) {
        console.error('User list failed:', error);
        throw new HttpError(502, 'Could not load users.');
      }

      const users = (data ?? []).map((u) => {
        const role = roleOf(u);
        return {
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          isActive: u.is_active,
          createdAt: u.created_at,
          lastLoginAt: u.last_login_at,
          roleId: role?.id ?? null,
          roleName: role?.name ?? 'No role',
          pages: normalisePages(role?.pages),
          // Lets the UI stop someone locking themselves out mid-session.
          isSelf: u.id === admin.id,
        };
      });
      res.status(200).json({ users });
      return;
    }

    if (req.method === 'POST') {
      const email = requireEmail(asString(body.email)).toLowerCase();
      const fullName = requireName(asString(body.fullName));
      const password = asString(body.password);
      const roleId = asString(body.roleId);
      assertPasswordStrength(password);
      if (!roleId) throw new HttpError(400, 'Please choose a role.');
      await assertRoleExists(roleId);

      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          email,
          full_name: fullName,
          password_hash: hashPassword(password),
          role_id: roleId,
          is_active: true,
        })
        .select('id')
        .single();

      if (error?.code === '23505') throw new HttpError(409, 'An account with that email already exists.');
      if (error) {
        console.error('User create failed:', error);
        throw new HttpError(502, 'Could not create the user.');
      }
      res.status(201).json({ id: data.id });
      return;
    }

    if (req.method === 'PATCH') {
      const id = asString(body.id);
      if (!id) throw new HttpError(400, 'Missing user id.');

      const patch: Record<string, unknown> = {};
      if (body.fullName !== undefined) patch.full_name = requireName(asString(body.fullName));
      if (body.roleId !== undefined) {
        const roleId = asString(body.roleId);
        if (!roleId) throw new HttpError(400, 'Please choose a role.');
        await assertRoleExists(roleId);
        patch.role_id = roleId;
      }
      if (body.isActive !== undefined) patch.is_active = !!body.isActive;
      if (body.password !== undefined) {
        const password = asString(body.password);
        assertPasswordStrength(password);
        patch.password_hash = hashPassword(password);
      }
      if (Object.keys(patch).length === 0) {
        res.status(200).json({ ok: true });
        return;
      }

      const touchesAccess = patch.is_active === false || patch.role_id !== undefined;

      // Captured so the change can be undone if it turns out to strand access.
      const { data: before } = touchesAccess
        ? await supabase.from('admin_users').select('role_id, is_active').eq('id', id).maybeSingle()
        : { data: null };

      const { error } = await supabase.from('admin_users').update(patch).eq('id', id);
      if (error) {
        console.error('User update failed:', error);
        throw new HttpError(502, 'Could not update the user.');
      }

      // Checked against the resulting state rather than guessed beforehand, so
      // moving between two roles that both grant Users is allowed. PostgREST
      // has no transactions, hence the manual restore.
      if (touchesAccess && before) {
        try {
          await assertAccessManagerRemains();
        } catch (err) {
          await supabase
            .from('admin_users')
            .update({ role_id: before.role_id, is_active: before.is_active })
            .eq('id', id);
          throw err;
        }
      }

      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      const id = asString(body.id);
      if (!id) throw new HttpError(400, 'Missing user id.');
      if (id === admin.id) throw new HttpError(400, 'You cannot delete your own account.');
      await assertAccessManagerRemains(id);

      const { error } = await supabase.from('admin_users').delete().eq('id', id);
      if (error) {
        console.error('User delete failed:', error);
        throw new HttpError(502, 'Could not delete the user.');
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
