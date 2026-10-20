import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { inputClass, Field } from '@/components/FormControls';
import { fileToBase64 } from '@/lib/forms';
import { adminFetch, fmtDay, json, Unauthorized } from './client';
import { ConfirmDialog, GhostButton, Modal, PrimaryButton } from './Modal';
import { InlineLoading, LoadingBlock } from './Spinner';

interface Award {
  id: string;
  title: string;
  description: string;
  awardDate: string | null;
  hasImage: boolean;
  imageUrl: string | null;
}

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Add/edit form. `award` null means a new one. */
function AwardForm({
  award, onClose, onSaved, onUnauthorized,
}: {
  award: Award | null;
  onClose: () => void;
  onSaved: () => void;
  onUnauthorized: () => void;
}) {
  const [title, setTitle] = useState(award?.title ?? '');
  const [description, setDescription] = useState(award?.description ?? '');
  const [awardDate, setAwardDate] = useState(award?.awardDate ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(award?.imageUrl ?? null);
  const [clearImage, setClearImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Object URLs for the local preview must be released or they leak.
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) {
      setError('Please choose a JPG, PNG, WEBP or GIF image.');
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      setError('Image must be 3 MB or smaller.');
      return;
    }
    setError('');
    setClearImage(false);
    setFile(f);
  };

  const save = async () => {
    if (title.trim().length < 2) {
      setError('Please enter a title.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        awardDate: awardDate || '',
      };
      if (file) {
        payload.imageBase64 = await fileToBase64(file);
        payload.imageFilename = file.name;
      } else if (clearImage) {
        payload.removeImage = true;
      }

      if (award) {
        await adminFetch('/api/admin/awards', {
          method: 'PATCH',
          body: json({ id: award.id, ...payload }),
        });
      } else {
        await adminFetch('/api/admin/awards', { method: 'POST', body: json(payload) });
      }
      toast.success(award ? 'Award updated.' : 'Award added.');
      onSaved();
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      setError(err instanceof Error ? err.message : 'Could not save the award.');
      setSaving(false);
    }
  };

  const showImage = preview && !clearImage;

  return (
    <Modal
      title={award ? 'Edit award' : 'Add award'}
      onClose={onClose}
      wide
      footer={
        <>
          <GhostButton onClick={onClose} disabled={saving}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={saving}>
            {saving ? 'Saving…' : award ? 'Save changes' : 'Add award'}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Title" htmlFor="award-title">
        <input
          id="award-title" type="text" value={title} maxLength={150} disabled={saving}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass} style={{ borderColor: '#cbd5e1' }}
        />
      </Field>

      <Field label="Date" htmlFor="award-date" hint="Optional. Used to order the list.">
        <input
          id="award-date" type="date" value={awardDate} disabled={saving}
          onChange={(e) => setAwardDate(e.target.value)}
          className={inputClass} style={{ borderColor: '#cbd5e1' }}
        />
      </Field>

      <Field label="Description" htmlFor="award-description">
        <textarea
          id="award-description" value={description} rows={4} maxLength={2000} disabled={saving}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass} style={{ borderColor: '#cbd5e1' }}
        />
      </Field>

      <div>
        <span className="block text-sm font-medium mb-1.5" style={{ color: '#182C64' }}>Image</span>
        <div className="flex items-start gap-4">
          <div className="w-32 h-24 rounded-lg border border-slate-200 bg-slate-50 flex items-center
                          justify-center overflow-hidden shrink-0">
            {showImage ? (
              <img src={preview} alt="" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-xs text-slate-400">No image</span>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef} type="file" accept={IMAGE_TYPES.join(',')} disabled={saving}
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              className="block text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg
                         file:border-0 file:text-xs file:font-semibold file:bg-slate-100
                         file:text-slate-700 hover:file:bg-slate-200"
            />
            <p className="text-xs text-slate-500">JPG, PNG, WEBP or GIF, up to 3 MB.</p>
            {showImage && (
              <GhostButton
                danger
                disabled={saving}
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setClearImage(true);
                  if (fileRef.current) fileRef.current.value = '';
                }}
              >
                Remove image
              </GhostButton>
            )}
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </Modal>
  );
}

export function AwardsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  /** False until the first response lands, which is what picks the spinner. */
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<Award | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Award | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const body = await adminFetch<{ awards: Award[] }>('/api/admin/awards');
      setAwards(body.awards);
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      toast.error(err instanceof Error ? err.message : 'Could not load awards.');
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [onUnauthorized]);

  useEffect(() => { void load(); }, [load]);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminFetch('/api/admin/awards', { method: 'DELETE', body: json({ id: deleting.id }) });
      toast.success('Award deleted.');
      setDeleting(null);
      await load();
    } catch (err) {
      if (err instanceof Unauthorized) return onUnauthorized();
      toast.error(err instanceof Error ? err.message : 'Could not delete the award.');
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
            {`${awards.length} award${awards.length === 1 ? '' : 's'}`}
          </p>
        )}
        <PrimaryButton onClick={() => setAdding(true)}>Add award</PrimaryButton>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {!loaded ? (
          <LoadingBlock />
        ) : awards.length === 0 ? (
          <p className="p-8 text-center text-slate-400">
            No awards yet. Use “Add award” to create the first one.
          </p>
        ) : (
          // Dimmed rather than replaced while reloading after a save or delete.
          <ul className={`divide-y divide-slate-100 transition-opacity ${loading ? 'opacity-50' : ''}`}>
            {awards.map((a) => (
              <li key={a.id} className="flex items-start gap-4 p-4">
                <div className="w-20 h-16 rounded border border-slate-200 bg-slate-50 flex items-center
                                justify-center overflow-hidden shrink-0">
                  {a.imageUrl ? (
                    <img src={a.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400">No image</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-semibold" style={{ color: '#182C64' }}>{a.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{fmtDay(a.awardDate)}</div>
                  {a.description && (
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{a.description}</p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <GhostButton onClick={() => setEditing(a)}>Edit</GhostButton>
                  <GhostButton danger onClick={() => setDeleting(a)}>Delete</GhostButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-6">
        Awards are stored for the admin area only — nothing here appears on the public site yet.
      </p>

      {(adding || editing) && (
        <AwardForm
          award={editing}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSaved={afterSave}
          onUnauthorized={onUnauthorized}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete award"
          message={`“${deleting.title}” and its image will be permanently deleted.`}
          confirmLabel="Delete"
          busy={busy}
          onConfirm={guard(remove)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
