import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { inputClass, Field } from '@/components/FormControls';
import { adminFetch, BRAND_GRADIENT, json, Unauthorized } from '@/components/admin/client';
import { GhostButton, Modal, PrimaryButton } from '@/components/admin/Modal';
import { LoadingBlock, Spinner } from '@/components/admin/Spinner';
import { SubmissionsPanel } from '@/components/admin/SubmissionsPanel';
import { AwardsPanel } from '@/components/admin/AwardsPanel';
import { UsersPanel } from '@/components/admin/UsersPanel';
import { RolesPanel, type PageOption } from '@/components/admin/RolesPanel';

interface Me {
  user: {
    id: string;
    email: string;
    fullName: string;
    roleName: string;
    isBreakGlass: boolean;
  };
  pages: string[];
  allPages: PageOption[];
}

/* ------------------------------------------------------------------ */

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // The shared password predates named accounts and still works, so that the
  // first account can be created and a bad role edit can be undone.
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shared ? { password } : { email: email.trim(), password }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b.error ?? 'Sign in failed.');
        setBusy(false);
        return;
      }
      onSuccess();
    } catch {
      setError('Sign in failed. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form onSubmit={submit} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
        <img src="/assets/images/logo-color.png" alt="NXT" className="h-10 w-auto mb-6" />
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#182C64' }}>Admin</h1>
        <p className="text-sm text-slate-500 mb-6">
          {shared ? 'Enter the shared owner password.' : 'Sign in with your account.'}
        </p>

        {!shared && (
          <div className="mb-3">
            <label htmlFor="login-email" className="block text-xs font-medium mb-1 text-slate-600">Email</label>
            <input
              id="login-email" type="email" value={email} disabled={busy} autoFocus
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
              className={inputClass} style={{ borderColor: error ? '#dc2626' : '#cbd5e1' }}
            />
          </div>
        )}

        <label htmlFor="login-password" className="block text-xs font-medium mb-1 text-slate-600">Password</label>
        <input
          id="login-password" type="password" value={password} disabled={busy}
          autoFocus={shared}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass} style={{ borderColor: error ? '#dc2626' : '#cbd5e1' }}
        />
        {error && <p className="text-xs text-red-600 mt-2" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={busy || !password || (!shared && !email)}
          className="w-full mt-5 text-white font-bold text-sm py-2.5 rounded-lg shadow-md
                     disabled:opacity-60 disabled:cursor-not-allowed transition-all
                     inline-flex items-center justify-center gap-2"
          style={{ background: BRAND_GRADIENT }}
        >
          {busy && <Spinner variant="onBrand" className="h-4 w-4 border-2" />}
          {busy ? 'Checking…' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={() => { setShared(!shared); setError(''); setPassword(''); }}
          className="w-full mt-3 text-xs text-slate-500 hover:text-[#2E74EA] transition-colors"
        >
          {shared ? 'Sign in with an account instead' : 'Use the shared owner password'}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (newPassword.length < 10) return setError('New password must be at least 10 characters.');
    if (newPassword !== confirm) return setError('The two new passwords do not match.');
    setBusy(true);
    setError('');
    try {
      await adminFetch('/api/admin/me', {
        method: 'POST',
        body: json({ currentPassword, newPassword }),
      });
      toast.success('Password changed.');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change your password.');
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Change password"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={busy}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Change password'}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Current password" htmlFor="cur-pw">
        <input id="cur-pw" type="password" value={currentPassword} disabled={busy}
          autoComplete="current-password"
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={inputClass} style={{ borderColor: '#cbd5e1' }} />
      </Field>
      <Field label="New password" htmlFor="new-pw" hint="At least 10 characters.">
        <input id="new-pw" type="password" value={newPassword} disabled={busy}
          autoComplete="new-password"
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputClass} style={{ borderColor: '#cbd5e1' }} />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm-pw">
        <input id="confirm-pw" type="password" value={confirm} disabled={busy}
          autoComplete="new-password"
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass} style={{ borderColor: '#cbd5e1' }} />
      </Field>
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */

export default function Admin() {
  const [me, setMe] = useState<Me | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const loadMe = useCallback(async () => {
    try {
      const body = await adminFetch<Me>('/api/admin/me');
      setMe(body);
      // Keep the current tab if it is still permitted, else fall to the first.
      setTab((prev) => (prev && body.pages.includes(prev) ? prev : body.pages[0] ?? null));
    } catch {
      setMe(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { void loadMe(); }, [loadMe]);

  const onUnauthorized = useCallback(() => {
    setMe(null);
    toast.error('Your session has expired. Please sign in again.');
  }, []);

  const signOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    setMe(null);
    setTab(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingBlock label="Loading…" />
      </div>
    );
  }

  if (!me) {
    return <LoginScreen onSuccess={() => { setChecking(true); void loadMe(); }} />;
  }

  const visible = me.allPages.filter((p) => me.pages.includes(p.key));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <img src="/assets/images/logo-color.png" alt="NXT" className="h-8 w-auto" />
          <div className="flex items-center gap-3 text-sm min-w-0">
            <span className="text-slate-500 truncate hidden sm:inline">
              {me.user.fullName} · {me.user.roleName}
            </span>
            {!me.user.isBreakGlass && (
              <button
                onClick={() => setChangingPassword(true)}
                className="text-slate-500 hover:text-[#2E74EA] transition-colors whitespace-nowrap"
              >
                Change password
              </button>
            )}
            <button onClick={signOut} className="text-slate-500 hover:text-[#2E74EA] transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {me.user.isBreakGlass && (
          <div className="mb-5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            You're signed in with the shared owner password. Create a personal account under{' '}
            <strong>Users</strong> and sign in with that instead — shared passwords can't be traced
            to a person.
          </div>
        )}

        {visible.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
            Your role has no pages assigned yet. Ask an administrator to grant you access.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              {visible.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setTab(p.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    tab === p.key ? 'text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                  style={tab === p.key ? { background: BRAND_GRADIENT } : undefined}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* key={tab} remounts on switch so each panel starts from a clean state. */}
            {tab === 'applications' && (
              <SubmissionsPanel key="applications" type="applications" onUnauthorized={onUnauthorized} />
            )}
            {tab === 'messages' && (
              <SubmissionsPanel key="messages" type="messages" onUnauthorized={onUnauthorized} />
            )}
            {tab === 'awards' && <AwardsPanel onUnauthorized={onUnauthorized} />}
            {tab === 'users' && <UsersPanel onUnauthorized={onUnauthorized} />}
            {tab === 'roles' && (
              <RolesPanel
                allPages={me.allPages}
                onUnauthorized={onUnauthorized}
                // A role edit can change what the signed-in user may see.
                onRolesChanged={() => void loadMe()}
              />
            )}
          </>
        )}
      </div>

      {changingPassword && <ChangePasswordDialog onClose={() => setChangingPassword(false)} />}
    </div>
  );
}
