import { notices } from '@/lib/catalog';

/** README 8-11: pinned notices first, then newest first. Dates are "2026.10.01", so they sort as strings. */
export const sortedNotices = [...notices].sort(
  (a, b) => Number(b.pinned) - Number(a.pinned) || (b.date ?? '').localeCompare(a.date ?? ''),
);
