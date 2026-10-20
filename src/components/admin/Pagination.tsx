/** Kept in step with PAGE_SIZES in api/admin/data.ts, which rejects anything else. */
const PAGE_SIZES = [25, 50, 100];

/**
 * Page controls for the admin tables.
 *
 * Deliberately Prev/Next plus a page count rather than numbered page links:
 * the tables are sorted newest-first and filtered by date, so people jump
 * around with the filters and only ever step a page at a time.
 */
export function Pagination({
  page, pageSize, total, disabled, onPageChange, onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  const step = (delta: number) => onPageChange(Math.min(pageCount, Math.max(1, page + delta)));

  const arrow =
    'px-3 py-1.5 rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-600 ' +
    'hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
      <p className="text-sm text-slate-500" aria-live="polite">
        {total === 0 ? 'No records' : `Showing ${first}–${last} of ${total}`}
      </p>

      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-500 flex items-center gap-2">
          <span className="hidden sm:inline">Per page</span>
          <select
            value={pageSize}
            disabled={disabled}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700
                       focus:outline-none focus:ring-2 focus:ring-[#2E74EA] disabled:opacity-60"
          >
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button" className={arrow}
            onClick={() => step(-1)}
            disabled={disabled || page <= 1}
            aria-label="Previous page"
          >
            ‹ Prev
          </button>
          <span className="text-sm text-slate-500 whitespace-nowrap">
            Page {Math.min(page, pageCount)} of {pageCount}
          </span>
          <button
            type="button" className={arrow}
            onClick={() => step(1)}
            disabled={disabled || page >= pageCount}
            aria-label="Next page"
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}
