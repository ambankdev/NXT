import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import PageShell from '@/components/PageShell';
import { Field, Honeypot, SubmitButton, inputClass } from '@/components/FormControls';
import {
  ALLOWED_CV_EXTENSIONS,
  fileToBase64,
  formatBytes,
  validateCvFile,
  validateEmail,
  validateFullName,
  validateMobile,
} from '@/lib/forms';

export default function Careers() {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [cv, setCv] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const next: Record<string, string> = {};
    const n = validateFullName(fullName); if (n) next.fullName = n;
    const m = validateMobile(mobile); if (m) next.mobile = m;
    const e = validateEmail(email); if (e) next.email = e;
    const c = validateCvFile(cv); if (c) next.cv = c;
    if (!consent) next.consent = 'Please confirm before submitting';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !cv) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          cvFilename: cv.name,
          cvType: cv.type,
          cvBase64: await fileToBase64(cv),
          companyWebsite: honeypot,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setDone(true);
    } catch (err) {
      console.error('Job application submit failed:', err);
      toast.error(
        err instanceof Error && err.message !== 'Failed to fetch'
          ? err.message
          : 'Something went wrong. Please try again.'
      );
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <PageShell title="Application received">
        <p className="text-gray-700 mb-6">
          Thank you for your interest in NXT. We've received your application and our team will
          review it. If your profile matches an opening, we'll be in touch.
        </p>
        <Link to="/" className="text-[#2E74EA] hover:underline font-medium">
          ← Back to home
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Work with us"
      intro="Send us your details and your CV. We keep applications on file and get in touch when a role fits."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
          <input
            id="fullName" type="text" value={fullName} autoComplete="name" disabled={submitting}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            style={{ borderColor: errors.fullName ? '#dc2626' : '#cbd5e1' }}
          />
        </Field>

        <Field label="Mobile number" htmlFor="mobile" error={errors.mobile}>
          <input
            id="mobile" type="tel" value={mobile} autoComplete="tel" disabled={submitting}
            onChange={(e) => setMobile(e.target.value)}
            className={inputClass}
            style={{ borderColor: errors.mobile ? '#dc2626' : '#cbd5e1' }}
          />
        </Field>

        <Field label="E-mail address" htmlFor="email" error={errors.email}>
          <input
            id="email" type="email" value={email} autoComplete="email" disabled={submitting}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            style={{ borderColor: errors.email ? '#dc2626' : '#cbd5e1' }}
          />
        </Field>

        <Field
          label="Attach your CV"
          htmlFor="cv"
          error={errors.cv}
          hint="PDF, DOC or DOCX · up to 3 MB"
        >
          <input
            ref={fileInputRef}
            id="cv"
            type="file"
            accept={ALLOWED_CV_EXTENSIONS.join(',')}
            disabled={submitting}
            onChange={(e) => {
              setCv(e.target.files?.[0] ?? null);
              setErrors((prev) => ({ ...prev, cv: '' }));
            }}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg
                       file:border-0 file:text-sm file:font-semibold file:text-white file:cursor-pointer
                       hover:file:opacity-90 disabled:opacity-60"
            style={{ ['--tw-file-bg' as string]: '#182C64' }}
          />
          {cv && (
            <p className="text-xs text-slate-600 mt-1.5">
              Selected: <span className="font-medium">{cv.name}</span> ({formatBytes(cv.size)})
            </p>
          )}
        </Field>

        <Honeypot value={honeypot} onChange={setHoneypot} />

        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox" checked={consent} disabled={submitting}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#2E74EA]"
            />
            <span className="text-sm text-gray-700">
              I agree that NXT may store and process my personal data and CV for recruitment
              purposes, as described in the{' '}
              <Link to="/privacy-policy" className="text-[#2E74EA] hover:underline">
                Privacy and Cookies Policy
              </Link>
              .
            </span>
          </label>
          {errors.consent && (
            <p className="text-xs text-red-600 mt-1" role="alert">{errors.consent}</p>
          )}
        </div>

        <div className="pt-2">
          <SubmitButton submitting={submitting}>Submit application</SubmitButton>
        </div>
      </form>
    </PageShell>
  );
}
