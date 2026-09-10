import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import PageShell from '@/components/PageShell';
import { Field, Honeypot, SubmitButton, inputClass } from '@/components/FormControls';
import { validateFullName, validateMessage, validateMobile, validateSubject } from '@/lib/forms';
import { CONTACT_EMAIL } from '@/seo/site';

export default function Contact() {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    const n = validateFullName(fullName); if (n) next.fullName = n;
    const m = validateMobile(mobile); if (m) next.mobile = m;
    const s = validateSubject(subject); if (s) next.subject = s;
    const d = validateMessage(message); if (d) next.message = d;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          subject: subject.trim(),
          message: message.trim(),
          companyWebsite: honeypot,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setDone(true);
    } catch (err) {
      console.error('Contact submit failed:', err);
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
      <PageShell title="Message sent">
        <p className="text-gray-700 mb-6">
          Thanks for getting in touch. Our team has received your message and will come back to you
          as soon as possible.
        </p>
        <Link to="/" className="text-[#2E74EA] hover:underline font-medium">
          ← Back to home
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Contact us"
      intro="Have a question about NXT? Send us a message and our team will get back to you."
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

        <Field label="Subject" htmlFor="subject" error={errors.subject}>
          <input
            id="subject" type="text" value={subject} disabled={submitting}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
            style={{ borderColor: errors.subject ? '#dc2626' : '#cbd5e1' }}
          />
        </Field>

        <Field label="Details" htmlFor="message" error={errors.message}>
          <textarea
            id="message" rows={6} value={message} disabled={submitting}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} resize-y`}
            style={{ borderColor: errors.message ? '#dc2626' : '#cbd5e1' }}
          />
        </Field>

        <Honeypot value={honeypot} onChange={setHoneypot} />

        <div className="pt-2">
          <SubmitButton submitting={submitting}>Send message</SubmitButton>
        </div>

        <p className="text-xs text-slate-500 pt-2">
          You can also reach us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#2E74EA] hover:underline">
            {CONTACT_EMAIL}
          </a>
          . Please don't include passwords, card numbers or account details in this form.
        </p>
      </form>
    </PageShell>
  );
}
