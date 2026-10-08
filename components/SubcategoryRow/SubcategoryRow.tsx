'use client';

import popup from '../Popup/Popup.module.css';
import type { SubDef } from '@/lib/shop';
import styles from './SubcategoryRow.module.css';

/**
 * Subcategory row (README 8-2, `.subrow`): `all` + the view's subs as 13px text buttons, one pick.
 * Picked = ink + 1px underline, the rest ink-2. Mobile scrolls sideways (6+ items fade at the right);
 * desktop wraps on the left of the size · sort row.
 */
export function SubcategoryRow({
  subs,
  value,
  label,
  variant,
  onPick,
}: {
  subs: SubDef[];
  /** Picked sub id, null = "all". */
  value: string | null;
  /** View name for the group's aria-label (`tops`, `levi's` …). */
  label: string;
  variant: 'mobile' | 'desktop';
  onPick: (id: string | null) => void;
}) {
  if (!subs.length) return null;
  const items = [{ id: null, label: 'all' }, ...subs];
  const long = variant === 'mobile' && items.length > 5;
  return (
    <div
      role="group"
      aria-label={label}
      className={`${variant === 'mobile' ? styles.mobile : styles.desktop} ${long ? styles.isLong : ''}`}
    >
      {items.map((s) => {
        const on = value === s.id;
        return (
          <button
            key={s.id ?? 'all'}
            type="button"
            aria-pressed={on}
            className={`${popup.trigger} ${styles.item} ${on ? styles.on : ''}`}
            onClick={() => onPick(s.id)}
          >
            <span className={popup.ulbl}>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
