'use client';

import { useRef, useState } from 'react';
import { catalog } from '@/lib/catalog';
import { chipLabel, displayTotal, filterProducts, pieces, type ShopQuery, type SortId } from '@/lib/shop';
import { useModal } from '@/lib/useModal';
import styles from './FilterPanel.module.css';

type Props = {
  /** The applied query. The panel edits a copy (draft) and only applies on "show n pieces". */
  query: ShopQuery;
  onApply: (next: ShopQuery) => void;
  onClose: () => void;
};

const EMPTY_DRAFT = { sold: false, brands: [] as string[], sizes: [] as string[], eras: [] as string[], sort: 'new' as SortId };

/** Mobile: full-screen sheet. Desktop: 400px panel on the right with a scrim (README 8-2). */
export function FilterPanel({ query, onApply, onClose }: Props) {
  const [draft, setDraft] = useState(() => ({
    sold: query.sold,
    brands: [...query.brands],
    sizes: [...query.sizes],
    eras: [...query.eras],
    sort: query.sort,
  }));
  const dialog = useRef<HTMLDivElement>(null);
  useModal(dialog, onClose);

  const next: ShopQuery = { ...query, ...draft };
  const count = displayTotal(next, filterProducts(next).length);

  const toggle = (key: 'brands' | 'sizes' | 'eras', v: string) =>
    setDraft((d) => ({ ...d, [key]: d[key].includes(v) ? d[key].filter((x) => x !== v) : [...d[key], v] }));
  const titled = (t: string, n: number) => (n ? `${t} (${n})` : t);

  return (
    <div className={styles.layer}>
      <button type="button" tabIndex={-1} aria-label="Close filter without applying" className={styles.scrim} onClick={onClose} />
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="filter-title" className={styles.panel}>
        <div className={styles.head}>
          <h2 id="filter-title" className={styles.title}>
            filter
          </h2>
          <button type="button" className={styles.close} onClick={onClose}>
            close
          </button>
        </div>

        <div className={styles.body}>
          <Group legend="sort">
            {catalog.filters.sort.map((o) => (
              <Chip key={o.id} on={draft.sort === o.id} onClick={() => setDraft((d) => ({ ...d, sort: o.id as SortId }))}>
                {o.label}
              </Chip>
            ))}
          </Group>
          <Group legend="availability">
            <Chip on={!draft.sold} onClick={() => setDraft((d) => ({ ...d, sold: false }))}>
              available
            </Chip>
            <Chip on={draft.sold} onClick={() => setDraft((d) => ({ ...d, sold: true }))}>
              include sold
            </Chip>
          </Group>
          <Group legend={titled('brand', draft.brands.length)}>
            {catalog.filters.brands.map((v) => (
              <Chip key={v} on={draft.brands.includes(v)} onClick={() => toggle('brands', v)}>
                {chipLabel(v)}
              </Chip>
            ))}
          </Group>
          <Group legend={titled('size', draft.sizes.length)}>
            {catalog.filters.sizes.map((v) => (
              <Chip key={v} square on={draft.sizes.includes(v)} onClick={() => toggle('sizes', v)}>
                {v === 'One size' ? 'one size' : v}
              </Chip>
            ))}
          </Group>
          <Group legend={titled('era', draft.eras.length)}>
            {catalog.filters.eras.map((v) => (
              <Chip key={v} square on={draft.eras.includes(v)} onClick={() => toggle('eras', v)}>
                {v}
              </Chip>
            ))}
          </Group>
        </div>

        <div className={styles.foot}>
          <button type="button" className={styles.clear} onClick={() => setDraft(EMPTY_DRAFT)}>
            clear all
          </button>
          <button
            type="button"
            disabled={count === 0}
            className={`${styles.apply} ${count === 0 ? styles.applyOff : ''}`}
            onClick={() => count && onApply(next)}
          >
            {count ? `show ${pieces(count)}` : 'no pieces match'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Group({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.chips}>{children}</div>
    </fieldset>
  );
}

/** 36px pill inside a 44px tap target. Navy + white when on, fill + ink when off. */
function Chip({ on, square, onClick, children }: { on: boolean; square?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} className={styles.chip} onClick={onClick}>
      <span className={`${styles.pill} ${square ? styles.pillShort : ''}`}>{children}</span>
    </button>
  );
}
