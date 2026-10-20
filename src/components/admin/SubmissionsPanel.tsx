import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { inputClass } from '@/components/FormControls';
import { adminFetch, BRAND_GRADIENT, fmtDate, Unauthorized } from './client';

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

interface BatchFile {
  name: string;
  size: number;
  url: string | null;
}

const fmtSize = (b: number) =>
  b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

/** Parallel downloads while zipping; enough to be quick without hammering Supabase. */
const ZIP_CONCURRENCY = 4;

/** Runs `worker` over `items`, at most `limit` at a time. */
async function mapLimited<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let next = 0;
  const run = async () => {
    while (next < items.length) await worker(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick; revoking synchronously can cancel the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function SubmissionsPanel({
  type, onUnauthorized,
}: {
  type: 'applications' | 'messages';
  onUnauthorized: () => void;
}) {
  const [rows, setRows] = useState<(Application | Message)[]>([]);
  const [loading, setLoading] = useState(true);
  const [truncated, setTruncated] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [zipProgress, setZipProgress] = useState<{ done: number; total: number } | null>(null);

  const isApp = type === 'applications';

  const load = useCallback(async (q: string, f: string, t: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type });
      if (q) params.set('q', q);
      if (f) params.set('from', f);
      if (t) params.set('to', t);

      const body = await adminFetch<{ rows: (Application | Message)[]; truncated: boolean }>(
        `/api/admin/data?${params}`,
      );
      setRows(body.rows);
      setTruncated(body.truncated);
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      toast.error(err instanceof Error ? err.message : 'Could not load records.');
    } finally {
      setLoading(false);
    }
  }, [type, onUnauthorized]);

  // Reset filters when switching between the two tabs.
  useEffect(() => {
    setSearch('');
    setFrom('');
    setTo('');
    setExpanded(null);
  }, [type]);

  // Debounce so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => void load(search, from, to), 300);
    return () => clearTimeout(id);
  }, [search, from, to, load]);

  const downloadCv = async (path: string) => {
    try {
      const { url } = await adminFetch<{ url: string }>(
        `/api/admin/cv?path=${encodeURIComponent(path)}`,
      );
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      toast.error(err instanceof Error ? err.message : 'Could not open the CV.');
    }
  };

  /** Downloads every CV matching the current search and dates as one ZIP. */
  const downloadAllCvs = async () => {
    setZipProgress({ done: 0, total: 0 });
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (from) params.set('from', from);
      if (to) params.set('to', to);

      const { files } = await adminFetch<{ files: BatchFile[] }>(`/api/admin/cv-batch?${params}`);
      if (files.length === 0) {
        toast.info('No CVs match these filters.');
        return;
      }

      const contents: Record<string, Uint8Array> = {};
      const missing: string[] = [];
      let done = 0;
      setZipProgress({ done, total: files.length });

      await mapLimited(files, ZIP_CONCURRENCY, async (file) => {
        try {
          if (!file.url) throw new Error('not found');
          const r = await fetch(file.url);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          contents[file.name] = new Uint8Array(await r.arrayBuffer());
        } catch {
          missing.push(file.name);
        }
        setZipProgress({ done: ++done, total: files.length });
      });

      if (Object.keys(contents).length === 0) {
        throw new Error('None of the CVs could be downloaded. Please try again.');
      }
      if (missing.length) {
        contents['_MISSING.txt'] = new TextEncoder().encode(
          `These ${missing.length} CV(s) could not be downloaded:\r\n\r\n${missing.join('\r\n')}\r\n`,
        );
      }

      // Loaded on demand so the zip code only ships to people who use it.
      const { zipSync } = await import('fflate');
      // level 0 = store only: PDF and DOCX are already compressed, so deflating
      // again would cost time for no real saving.
      const zip = zipSync(contents, { level: 0 });

      const range = `${from || 'start'} to ${to || new Date().toISOString().slice(0, 10)}`;
      saveBlob(new Blob([zip], { type: 'application/zip' }), `NXT CVs ${range}.zip`);

      const saved = files.length - missing.length;
      if (missing.length) {
        toast.warning(`Downloaded ${saved} of ${files.length} CVs. See _MISSING.txt in the ZIP.`);
      } else {
        toast.success(`Downloaded ${saved} CV${saved === 1 ? '' : 's'}.`);
      }
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      toast.error(err instanceof Error ? err.message : 'Could not download the CVs.');
    } finally {
      setZipProgress(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <div>
          <label htmlFor="search" className="block text-xs font-medium mb-1 text-slate-600">Search</label>
          <input
            id="search" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={isApp ? 'Name, email or mobile' : 'Name, subject or message'}
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

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="text-sm text-slate-500">
          {loading ? 'Loading…' : `${rows.length} record${rows.length === 1 ? '' : 's'}`}
          {truncated && ' (showing the most recent 200 — narrow the dates to see more)'}
        </p>

        {isApp && (
          <button
            onClick={downloadAllCvs}
            disabled={!!zipProgress || loading || rows.length === 0}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-90
                       disabled:opacity-60 disabled:cursor-not-allowed transition"
            style={{ background: BRAND_GRADIENT }}
            title="Every CV matching the current search and dates, as one ZIP file"
          >
            {zipProgress
              ? zipProgress.total
                ? `Downloading ${zipProgress.done} of ${zipProgress.total}…`
                : 'Preparing…'
              : from || to
                ? 'Download these CVs (ZIP)'
                : 'Download all CVs (ZIP)'}
          </button>
        )}
      </div>

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
                  <th className="text-left font-semibold px-4 py-3">{isApp ? 'Email' : 'Subject'}</th>
                  <th className="text-left font-semibold px-4 py-3">{isApp ? 'CV' : ''}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
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
                            style={{ background: BRAND_GRADIENT }}
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
        download links — they expire after two minutes. Treat downloaded ZIP files the same way:
        store them somewhere access-controlled and delete them once you're done.
      </p>
    </>
  );
}
