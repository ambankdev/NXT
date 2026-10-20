import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { inputClass, Field } from '@/components/FormControls';
import { adminFetch, json, Unauthorized } from './client';
import { ConfirmDialog, GhostButton, Modal, PrimaryButton } from './Modal';

export interface PageOption {
  key: string;
  label: string;
}

interface Role {
  id: string;
  name: string;
  pages: string[];
  isSystem: boolean;
  userCount: number;
}

/** Granting either of these lets the holder give themselves everything else. */
const ESCALATING = ['users', 'roles'];

function RoleForm({
  role, allPages, onClose, onSaved, onUnauthorized,
}: {
  role: Role | null;
  allPages: PageOption[];
  onClose: () => void;
  onSaved: () => void;
  onUnauthorized: () => void;
}) {
  const [name, setName] = useState(role?.name ?? '');
  const [pages, setPages] = useState<string[]>(role?.pages ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (key: string) =>
    setPages((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));

  const save = async () => {
    if (name.trim().length < 2) {
      setError('Please enter a role name.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (role) {
        await adminFetch('/api/admin/roles', {
          method: 'PATCH',
          // The Owner role keeps every page, so only its name may change.
          body: json(role.isSystem
            ? { id: role.id, name: name.trim() }
            : { id: role.id, name: name.trim(), pages }),
        });
      } else {
        await adminFetch('/api/admin/roles', { method: 'POST', body: json({ name: name.trim(), pages }) });
      }
      toast.success(role ? 'Role updated.' : 'Role created.');
      onSaved();
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      setError(err instanceof Error ? err.message : 'Could not save the role.');
      setSaving(false);
    }
  };

  return (
    <Modal
      title={role ? 'Edit role' : 'New role'}
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={saving}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={saving}>
            {saving ? 'Saving…' : role ? 'Save changes' : 'Create role'}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Role name" htmlFor="role-name">
        <input
          id="role-name" type="text" value={name} maxLength={40} disabled={saving}
          onChange={(e) => setName(e.target.value)}
          className={inputClass} style={{ borderColor: '#cbd5e1' }}
        />
      </Field>

      <div>
        <span className="block text-sm font-medium mb-2" style={{ color: '#182C64' }}>
          Pages this role can open
        </span>

        {role?.isSystem ? (
          <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
            Owner always has every page. This is what stops a change here from locking
            everyone out, so it can't be edited.
          </p>
        ) : (
          <div className="space-y-2">
            {allPages.map((p) => (
              <label key={p.key} className="flex items-start gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pages.includes(p.key)}
                  disabled={saving}
                  onChange={() => toggle(p.key)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#2E74EA]"
                />
                <span>
                  {p.label}
                  {ESCALATING.includes(p.key) && (
                    <span className="block text-xs text-amber-700">
                      Full control — anyone with this can grant themselves every other page.
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </Modal>
  );
}

export function RolesPanel({
  allPages, onUnauthorized, onRolesChanged,
}: {
  allPages: PageOption[];
  onUnauthorized: () => void;
  onRolesChanged?: () => void;
}) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Role | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const [busy, setBusy] = useState(false);

  const labelFor = (key: string) => allPages.find((p) => p.key === key)?.label ?? key;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const body = await adminFetch<{ roles: Role[] }>('/api/admin/roles');
      setRoles(body.roles);
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      toast.error(err instanceof Error ? err.message : 'Could not load roles.');
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => { void load(); }, [load]);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminFetch('/api/admin/roles', { method: 'DELETE', body: json({ id: deleting.id }) });
      toast.success('Role deleted.');
      setDeleting(null);
      await load();
      onRolesChanged?.();
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      toast.error(err instanceof Error ? err.message : 'Could not delete the role.');
    } finally {
      setBusy(false);
    }
  };

  const afterSave = () => {
    setAdding(false);
    setEditing(null);
    void load();
    onRolesChanged?.();
  };

  const guard = (fn: () => Promise<void>) => () => {
    fn().catch((err) => {
      if (err instanceof Unauthorized) onUnauthorized();
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="text-sm text-slate-500">
          {loading ? 'Loading…' : `${roles.length} role${roles.length === 1 ? '' : 's'}`}
        </p>
        <PrimaryButton onClick={() => setAdding(true)}>New role</PrimaryButton>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {roles.map((r) => (
            <li key={r.id} className="flex items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold flex items-center gap-2" style={{ color: '#182C64' }}>
                  {r.name}
                  {r.isSystem && (
                    <span className="text-[10px] uppercase tracking-wide bg-slate-100 text-slate-500
                                     px-1.5 py-0.5 rounded">Built-in</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {r.userCount} user{r.userCount === 1 ? '' : 's'}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {r.pages.length === 0 ? (
                    <span className="text-xs text-slate-400">No pages — can sign in but sees nothing</span>
                  ) : (
                    r.pages.map((p) => (
                      <span key={p} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {labelFor(p)}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <GhostButton onClick={() => setEditing(r)}>Edit</GhostButton>
                <GhostButton
                  danger
                  disabled={r.isSystem || r.userCount > 0}
                  onClick={() => setDeleting(r)}
                >
                  Delete
                </GhostButton>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-slate-400 mt-6">
        A role can only be deleted once no users are on it. Move them to another role first.
      </p>

      {(adding || editing) && (
        <RoleForm
          role={editing}
          allPages={allPages}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSaved={afterSave}
          onUnauthorized={onUnauthorized}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete role"
          message={`The role “${deleting.name}” will be permanently deleted.`}
          confirmLabel="Delete"
          busy={busy}
          onConfirm={guard(remove)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
