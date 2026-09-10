import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { inputClass } from '@/components/FormControls';

type Tab = 'applications' | 'messages';

interface Application {
  id: string;
  created_at: string;
  full_name: string;
  mobile: string;
  email: string;
  cv_path: string;
  cv_filename: string;
  cv_size_bytes: number;
}

interface Message {
  id: string;
  created_at: string;
  full_name: string;
  mobile: string;
  subject: string;
  message: string;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const fmtSize = (b: number) =>
  b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

/* ------------------------------------------------------------------ */

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
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
        body: JSON.stringify({ password }),
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
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#182C64' }}>Submissions</h1>
        <p className="text-sm text-slate-500 mb-6">Enter the access password to continue.</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          autoFocus
          autoComplete="current-password"
          className={inputClass}
          style={{ borderColor: error ? '#dc2626' : '#cbd5e1' }}
        />
        {error && <p className="text-xs text-red-600 mt-2" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={busy || !password}
          className="w-full mt-5 text-white font-bold text-sm py-2.5 rounded-lg shadow-md
                     disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          style={{ background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)' }}
        >
          {busy ? 'Checking…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('applications');
  const [rows, setRows] = useState<(Application | Message)[]>([]);
  const [loading, setLoading] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback(async (which: Tab, q: string, f: string, t: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: which });
      if (q) params.set('q', q);
      if (f) params.set('from', f);
      if (t) params.set('to', t);

      const res = await fetch(`/api/admin/data?${params}`);
      if (res.status === 401) { setAuthed(false); return; }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');

      const body = await res.json();
      setRows(body.rows);
      setTruncated(body.truncated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load records.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Probe once on mount: a valid cookie means we can skip the login screen.
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/data?type=applications&limit=1').catch(() => null);
      const ok = !!res && res.status !== 401;
      setAuthed(ok);
      setChecking(false);
      if (ok) load('applications', '', '', '');
    })();
  }, [load]);

  // Debounce so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    if (!authed) return;
    const id = setTimeout(() => load(tab, search, from, to), 300);
    return () => clearTimeout(id);
  }, [authed, tab, search, from, to, load]);

  const downloadCv = async (path: string) => {
    try {
      const res = await fetch(`/api/admin/cv?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      const { url } = await res.json();
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not open the CV.');
    }
  };

  const signOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    setAuthed(false);
    setRows([]);
  };

  if (checking) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading…</div>;
  }
  if (!authed) {
    return <LoginScreen onSuccess={() => { setAuthed(true); load(tab, search, from, to); }} />;
  }

  const switchTab = (next: Tab) => {
    setTab(next);
    setExpanded(null);
    setRows([]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <img src="/assets/images/logo-color.png" alt="NXT" className="h-8 w-auto" />
          <button onClick={signOut} className="text-sm text-slate-500 hover:text-[#2E74EA] transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-2 mb-5">
          {(['applications', 'messages'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t ? 'text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
              style={tab === t ? { background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)' } : undefined}
            >
              {t === 'applications' ? 'Job applications' : 'Contact messages'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
          <div>
            <label htmlFor="search" className="block text-xs font-medium mb-1 text-slate-600">Search</label>
            <input
              id="search" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === 'applications' ? 'Name, email or mobile' : 'Name, subject or message'}
              className={inputClass} style={{ borderColor: '#cbd5e1' }}
            />
          </div>
          <div>
            <label htmlFor="from" className="block text-xs font-medium mb-1 text-slate-600">From</label>
            <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className={inputClass} style={{ borderColor: '#cbd5e1' }} />
          </div>
          <div>
            <label htmlFor="to" className="block text-xs font-medium mb-1 text-slate-600">To</label>
            <input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className={inputClass} style={{ borderColor: '#cbd5e1' }} />
          </div>
          <button
            onClick={() => { setSearch(''); setFrom(''); setTo(''); }}
            className="px-4 py-2 rounded-lg text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Clear
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-3">
          {loading ? 'Loading…' : `${rows.length} record${rows.length === 1 ? '' : 's'}`}
          {truncated && ' (showing the most recent 200 — narrow the dates to see more)'}
        </p>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {rows.length === 0 && !loading ? (
            <p className="p-8 text-center text-slate-400">Nothing to show.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Received</th>
                    <th className="text-left font-semibold px-4 py-3">Name</th>
                    <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Mobile</th>
                    <th className="text-left font-semibold px-4 py-3">
                      {tab === 'applications' ? 'Email' : 'Subject'}
                    </th>
                    <th className="text-left font-semibold px-4 py-3">
                      {tab === 'applications' ? 'CV' : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isApp = tab === 'applications';
                    const app = row as Application;
                    const msg = row as Message;
                    const open = expanded === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={`border-t border-slate-100 align-top ${!isApp ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                        onClick={!isApp ? () => setExpanded(open ? null : row.id) : undefined}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500">{fmtDate(row.created_at)}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: '#182C64' }}>{row.full_name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <a href={`tel:${row.mobile}`} className="text-[#2E74EA] hover:underline"
                             onClick={(e) => e.stopPropagation()}>{row.mobile}</a>
                        </td>
                        <td className="px-4 py-3">
                          {isApp ? (
                            <a href={`mailto:${app.email}`} className="text-[#2E74EA] hover:underline">{app.email}</a>
                          ) : (
                            <>
                              <div className="font-medium text-slate-700">{msg.subject}</div>
                              <div className={`text-slate-600 mt-1 ${open ? 'whitespace-pre-wrap' : 'truncate max-w-md'}`}>
                                {msg.message}
                              </div>
                              {!open && <span className="text-xs text-[#2E74EA]">click to expand</span>}
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isApp && (
                            <button
                              onClick={() => downloadCv(app.cv_path)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm hover:opacity-90 transition"
                              style={{ background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)' }}
                              title={`${app.cv_filename} (${fmtSize(app.cv_size_bytes)})`}
                            >
                              Download CV
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-6">
          This page contains personal data. Download CVs only when needed, and don't forward the
          download links — they expire after two minutes.
        </p>
      </div>
    </div>
  );
}
