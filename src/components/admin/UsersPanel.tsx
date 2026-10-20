import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { inputClass, Field } from '@/components/FormControls';
import { validateEmail } from '@/lib/forms';
import { adminFetch, fmtDate, json, Unauthorized } from './client';
import { ConfirmDialog, GhostButton, Modal, PrimaryButton } from './Modal';
import { InlineLoading, LoadingBlock } from './Spinner';

interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  roleId: string | null;
  roleName: string;
  isSelf: boolean;
}

interface RoleOption {
  id: string;
  name: string;
}

const MIN_PASSWORD = 10;

function UserForm({
  user, roles, onClose, onSaved, onUnauthorized,
}: {
  user: User | null;
  roles: RoleOption[];
  onClose: () => void;
  onSaved: () => void;
  onUnauthorized: () => void;
}) {
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [roleId, setRoleId] = useState(user?.roleId ?? roles[0]?.id ?? '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (fullName.trim().length < 2) return setError('Please enter a name.');
    if (!user) {
      const emailError = validateEmail(email);
      if (emailError) return setError(emailError);
    }
    if (!roleId) return setError('Please choose a role.');
    // On edit the password field is optional: blank means leave it unchanged.
    if ((!user || password) && password.length < MIN_PASSWORD) {
      return setError(`Password must be at least ${MIN_PASSWORD} characters.`);
    }

    setSaving(true);
    setError('');
    try {
      if (user) {
        const patch: Record<string, unknown> = { id: user.id, fullName: fullName.trim(), roleId };
        if (password) patch.password = password;
        await adminFetch('/api/admin/users', { method: 'PATCH', body: json(patch) });
      } else {
        await adminFetch('/api/admin/users', {
          method: 'POST',
          body: json({ fullName: fullName.trim(), email: email.trim(), roleId, password }),
        });
      }
      toast.success(user ? 'User updated.' : 'User created.');
      onSaved();
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      setError(err instanceof Error ? err.message : 'Could not save the user.');
      setSaving(false);
    }
  };

  return (
    <Modal
      title={user ? 'Edit user' : 'New user'}
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={saving}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={saving}>
            {saving ? 'Saving…' : user ? 'Save changes' : 'Create user'}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Full name" htmlFor="user-name">
        <input
          id="user-name" type="text" value={fullName} maxLength={100} disabled={saving}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass} style={{ borderColor: '#cbd5e1' }}
        />
      </Field>

      <Field
        label="Email"
        htmlFor="user-email"
        hint={user ? 'The sign-in address cannot be changed.' : 'Used to sign in.'}
      >
        <input
          id="user-email" type="email" value={email} maxLength={254}
          disabled={saving || !!user}
          onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
          className={inputClass} style={{ borderColor: '#cbd5e1' }}
        />
      </Field>

      <Field label="Role" htmlFor="user-role">
        <select
          id="user-role" value={roleId} disabled={saving}
          onChange={(e) => setRoleId(e.target.value)}
          className={inputClass} style={{ borderColor: '#cbd5e1' }}
        >
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </Field>

      <Field
        label={user ? 'New password' : 'Password'}
        htmlFor="user-password"
        hint={user
          ? 'Leave blank to keep the current password.'
          : `At least ${MIN_PASSWORD} characters. Share it with them directly.`}
      >
        <input
          id="user-password" type="text" value={password} maxLength={200} disabled={saving}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass} style={{ borderColor: '#cbd5e1' }}
        />
      </Field>

      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </Modal>
  );
}

export function UsersPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  /** False until the first response lands, which is what picks the spinner. */
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Roles come from the same endpoint the Roles page uses; a user who can
      // manage users but not roles still needs the list to assign one.
      const [u, r] = await Promise.all([
        adminFetch<{ users: User[] }>('/api/admin/users'),
        adminFetch<{ roles: RoleOption[] }>('/api/admin/roles').catch(() => ({ roles: [] })),
      ]);
      setUsers(u.users);
      setRoles(r.roles);
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      toast.error(err instanceof Error ? err.message : 'Could not load users.');
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [onUnauthorized]);

  useEffect(() => { void load(); }, [load]);

  const setActive = async (user: User, isActive: boolean) => {
    try {
      await adminFetch('/api/admin/users', {
        method: 'PATCH',
        body: json({ id: user.id, isActive }),
      });
      toast.success(isActive ? 'User enabled.' : 'User disabled.');
      await load();
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      toast.error(err instanceof Error ? err.message : 'Could not update the user.');
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminFetch('/api/admin/users', { method: 'DELETE', body: json({ id: deleting.id }) });
      toast.success('User deleted.');
      setDeleting(null);
      await load();
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      toast.error(err instanceof Error ? err.message : 'Could not delete the user.');
    } finally {
      setBusy(false);
    }
  };

  const afterSave = () => {
    setAdding(false);
    setEditing(null);
    void load();
  };

  const guard = (fn: () => Promise<void>) => () => {
    fn().catch((err) => {
      if (err instanceof Unauthorized) onUnauthorized();
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        {loading ? (
          <InlineLoading />
        ) : (
          <p className="text-sm text-slate-500">
            {`${users.length} user${users.length === 1 ? '' : 's'}`}
          </p>
        )}
        <PrimaryButton onClick={() => setAdding(true)} disabled={roles.length === 0}>
          New user
        </PrimaryButton>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {!loaded ? (
          <LoadingBlock />
        ) : users.length === 0 ? (
          <p className="p-8 text-center text-slate-400">
            No accounts yet. Create one so you can stop using the shared password.
          </p>
        ) : (
          // Dimmed rather than replaced while reloading after a change.
          <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-50' : ''}`}>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Name</th>
                  <th className="text-left font-semibold px-4 py-3">Email</th>
                  <th className="text-left font-semibold px-4 py-3">Role</th>
                  <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Last signed in</th>
                  <th className="text-left font-semibold px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 align-middle">
                    <td className="px-4 py-3 font-medium" style={{ color: '#182C64' }}>
                      {u.fullName}
                      {u.isSelf && <span className="text-xs text-slate-400 font-normal"> (you)</span>}
                      {!u.isActive && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide bg-amber-100
                                         text-amber-700 px-1.5 py-0.5 rounded">Disabled</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-slate-600">{u.roleName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {u.lastLoginAt ? fmtDate(u.lastLoginAt) : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <GhostButton onClick={() => setEditing(u)}>Edit</GhostButton>
                        {/* Disabling yourself would end your own session. */}
                        <GhostButton
                          disabled={u.isSelf}
                          onClick={guard(() => setActive(u, !u.isActive))}
                        >
                          {u.isActive ? 'Disable' : 'Enable'}
                        </GhostButton>
                        <GhostButton danger disabled={u.isSelf} onClick={() => setDeleting(u)}>
                          Delete
                        </GhostButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-6">
        Anyone with access to this page can grant any role, including this one. Passwords are
        stored hashed and cannot be read back — to help someone who is locked out, set a new one.
      </p>

      {(adding || editing) && (
        <UserForm
          user={editing}
          roles={roles}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSaved={afterSave}
          onUnauthorized={onUnauthorized}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete user"
          message={`${deleting.fullName} will lose access immediately. This cannot be undone.`}
          confirmLabel="Delete"
          busy={busy}
          onConfirm={guard(remove)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
