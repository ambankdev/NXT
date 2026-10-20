/**
 * Loading indicators for the admin panels.
 *
 * Two shapes on purpose: a panel waiting on its first load has nothing to show
 * yet and gets the large one, while a panel that already has rows on screen
 * keeps them and shows the small one instead. Replacing a populated table with
 * a spinner on every filter keystroke would be worse than leaving it up.
 */

/**
 * `onBrand` is for use on the gradient button, where the default slate ring
 * would be invisible. A prop rather than an override because two conflicting
 * Tailwind colour utilities resolve by stylesheet order, not string order.
 */
export function Spinner({
  className = '',
  variant = 'brand',
}: {
  className?: string;
  variant?: 'brand' | 'onBrand';
}) {
  const colours =
    variant === 'onBrand'
      ? 'border-white/40 border-t-white'
      : 'border-slate-200 border-t-[#2E74EA]';
  return (
    <span aria-hidden="true" className={`inline-block rounded-full animate-spin ${colours} ${className}`} />
  );
}

/** Fills the content area while a panel loads for the first time. */
export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-3 p-12">
      <Spinner className="h-7 w-7 border-[3px]" />
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}

/** Sits beside the record count while already-visible rows are refreshed. */
export function InlineLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2 text-sm text-slate-500">
      <Spinner className="h-3.5 w-3.5 border-2" />
      {label}
    </span>
  );
}
