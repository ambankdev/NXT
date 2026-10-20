/**
 * The admin pages a role can be granted.
 *
 * This list is the source of truth. Roles live in the database, but the page
 * keys do not: a role row holding a key that is not here simply grants nothing,
 * so a stale or hand-edited row can never widen access.
 */
export const PAGES = ['applications', 'messages', 'awards', 'users', 'roles'] as const;

export type Page = (typeof PAGES)[number];

export const PAGE_LABELS: Record<Page, string> = {
  applications: 'Job applications',
  messages: 'Contact messages',
  awards: 'Awards',
  users: 'Users',
  roles: 'Roles',
};

/**
 * Granting `users` or `roles` is effectively granting everything: both let the
 * holder give themselves any other page. The UI says so where they are ticked.
 */
export const ESCALATING_PAGES: Page[] = ['users', 'roles'];

export function isPage(value: unknown): value is Page {
  return typeof value === 'string' && (PAGES as readonly string[]).includes(value);
}

/** Drops unknown keys and duplicates, keeping PAGES order. */
export function normalisePages(value: unknown): Page[] {
  if (!Array.isArray(value)) return [];
  const set = new Set(value.filter(isPage));
  return PAGES.filter((p) => set.has(p));
}
