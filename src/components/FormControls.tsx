import type { ReactNode } from 'react';

export const inputClass =
  'w-full px-3 py-2 border rounded-lg bg-white text-[#182C64] placeholder:text-slate-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-[#2E74EA] focus:border-transparent transition ' +
  'disabled:opacity-60';

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium mb-1.5" style={{ color: '#182C64' }}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {/* role=alert so screen readers announce the error when it appears */}
      {error && (
        <p className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({ submitting, children }: { submitting: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="text-white font-bold text-sm px-8 py-2.5 rounded-lg transition-all duration-300 shadow-md
                 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.03]"
      style={{ background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)' }}
    >
      {submitting ? 'Sending…' : children}
    </button>
  );
}

/**
 * Off-screen field that real users never see and never fill.
 * A bot that fills every input trips it and the submission is dropped server-side.
 * This is cheap first-line spam defence, not a substitute for a real CAPTCHA.
 */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="hidden" aria-hidden="true">
      <label htmlFor="company-website">Do not fill this in</label>
      <input
        id="company-website"
        name="company-website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
