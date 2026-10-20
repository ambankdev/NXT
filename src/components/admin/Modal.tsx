import { useEffect, type ReactNode } from 'react';
import { BRAND_GRADIENT } from './client';

/**
 * Small dialog used by the admin panels. Closes on Escape and on a click
 * outside, and locks body scroll while open.
 */
export function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-white rounded-lg shadow-xl w-full my-auto ${wide ? 'max-w-2xl' : 'max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-lg" style={{ color: '#182C64' }}>{title}</h2>
        </div>
        <div className="px-5 py-4 space-y-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children, onClick, disabled, type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-90
                 disabled:opacity-60 disabled:cursor-not-allowed transition"
      style={{ background: BRAND_GRADIENT }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children, onClick, disabled, danger,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50
        disabled:cursor-not-allowed ${
          danger
            ? 'bg-red-50 text-red-700 hover:bg-red-100'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
    >
      {children}
    </button>
  );
}

/** Confirmation step for an action that cannot be undone. */
export function ConfirmDialog({
  title, message, confirmLabel, busy, onConfirm, onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <GhostButton onClick={onCancel} disabled={busy}>Cancel</GhostButton>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600
                       hover:bg-red-700 disabled:opacity-60 transition"
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
