'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { AddToBagButton } from '@/components/ProductCard/AddToBagButton';
import { ProductCard, ProductGrid } from '@/components/ProductCard/ProductCard';
import { Pagination } from '@/components/Pagination/Pagination';
import { CheckIcon, FilterIcon } from '@/components/Icons';
import { CATEGORIES, ERAS, SIZES, products, type CategoryKey, type Era } from '@/lib/catalog';
import { FilterSheet } from './FilterSheet';
import { SortMenu, type SortKey } from './SortMenu';
import ui from '@/components/ui.module.css';
import styles from './shop.module.css';

const PAGE_SIZE = 8;

export type Filters = { sizes: string[]; eras: Era[]; hideSold: boolean };
const NO_FILTERS: Filters = { sizes: [], eras: [], hideSold: false };

export function ShopView() {
  const params = useSearchParams();
  const router = useRouter();
  const catParam = params.get('cat') ?? 'all';
  const cat: CategoryKey = CATEGORIES.some((c) => c.key === catParam) ? (catParam as CategoryKey) : 'all';
  const catLabel = CATEGORIES.find((c) => c.key === cat)!.label;
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [sort, setSort] = useState<SortKey>('new');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [announce, setAnnounce] = useState('');

  const nFilters = filters.sizes.length + filters.eras.length + (filters.hideSold ? 1 : 0);

  const list = useMemo(() => {
    const out = products.filter(
      (p) =>
        (cat === 'all' || p.category === cat) &&
        (filters.sizes.length === 0 || (p.size != null && filters.sizes.includes(p.size))) &&
        (filters.eras.length === 0 || filters.eras.includes(p.era)) &&
        (!filters.hideSold || !p.sold),
    );
    const byPrice = (dir: 1 | -1) => (a: (typeof out)[0], b: (typeof out)[0]) => {
      if (a.price == null && b.price == null) return 0;
      if (a.price == null) return 1;
      if (b.price == null) return -1;
      return (a.price - b.price) * dir;
    };
    if (sort === 'new') out.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    if (sort === 'price-asc') out.sort(byPrice(1));
    if (sort === 'price-desc') out.sort(byPrice(-1));
    return out;
  }, [cat, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const shown = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const hrefFor = (c: CategoryKey, n = 1) => {
    const q = new URLSearchParams();
    if (c !== 'all') q.set('cat', c);
    if (n > 1) q.set('page', String(n));
    const s = q.toString();
    return s ? `/shop?${s}` : '/shop';
  };

  const pickCat = (c: CategoryKey) => router.replace(hrefFor(c), { scroll: false });

  // Any filter change goes back to page 1.
  const updateFilters = (next: Filters) => {
    setFilters(next);
    if (current > 1) router.replace(hrefFor(cat), { scroll: false });
  };
  const toggleIn = <K extends 'sizes' | 'eras'>(key: K, v: Filters[K][number]) => {
    const arr = filters[key] as string[];
    updateFilters({ ...filters, [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] });
  };

  const filterProps = {
    filters,
    onToggleSize: (s: string) => toggleIn('sizes', s),
    onToggleEra: (e: Era) => toggleIn('eras', e),
    onToggleHideSold: () => updateFilters({ ...filters, hideSold: !filters.hideSold }),
    onReset: () => updateFilters(NO_FILTERS),
  };

  return (
    <main className={styles.main}>
      <div className={styles.head}>
        <div>
          <h1 className={ui.pageTitle}>{catLabel}</h1>
          <p className={ui.pageIntro}>
            Page {current} of {pageCount} · Every piece is one of one
          </p>
        </div>
        <div className="d-only">
          <SortMenu value={sort} onChange={setSort} variant="desktop" />
        </div>
      </div>

      {/* Mobile: category chips + Filter / Sort row */}
      <nav aria-label="Categories" className={`m-only ${styles.chips}`}>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            className={ui.chip}
            aria-pressed={c.key === cat}
            onClick={() => pickCat(c.key)}
          >
            {c.label}
          </button>
        ))}
      </nav>
      <div className={`m-only ${styles.toolbar}`}>
        <button type="button" className={styles.toolBtn} aria-haspopup="dialog" onClick={() => setSheetOpen(true)}>
          <FilterIcon />
          Filter{nFilters ? ` (${nFilters})` : ''}
        </button>
        <SortMenu value={sort} onChange={setSort} variant="mobile" />
      </div>

      <div className={styles.body}>
        {/* Desktop: left sidebar */}
        <aside aria-label="Filters" className={`d-only ${styles.sidebar}`}>
          <nav aria-labelledby="f-cat">
            <h2 id="f-cat" className={styles.sideTitle}>
              Category
            </h2>
            <ul className={styles.catList}>
              {CATEGORIES.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    className={styles.catBtn}
                    aria-pressed={c.key === cat}
                    onClick={() => pickCat(c.key)}
                  >
                    {c.label}
                    {c.key === cat && <CheckIcon size={14} />}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <FilterFields {...filterProps} columns={3} idPrefix="d" />
          <div className={styles.sideFoot}>
            <HideSold checked={filters.hideSold} onChange={filterProps.onToggleHideSold} />
            {nFilters > 0 && (
              <button type="button" className={ui.textButton} onClick={filterProps.onReset}>
                Clear filters ({nFilters})
              </button>
            )}
          </div>
        </aside>

        <div className={styles.results}>
          {shown.length > 0 ? (
            <ProductGrid label="Products">
              {shown.map((p) => (
                <ProductCard
                  key={p.id}
                  name={p.name}
                  href={`/product/${p.id}`}
                  price={p.price}
                  sold={p.sold}
                  action={
                    p.sold ? null : (
                      <AddToBagButton id={p.id} name={p.name} onAdded={(n) => setAnnounce(`${n} added to your bag.`)} />
                    )
                  }
                />
              ))}
            </ProductGrid>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyLead}>No pieces match these filters.</p>
              <p className={styles.emptySub}>Remove a size or era, or show sold pieces too.</p>
              {nFilters > 0 && (
                <button type="button" className={ui.btnSecondary} onClick={filterProps.onReset}>
                  Clear filters
                </button>
              )}
            </div>
          )}
          <Pagination page={current} pageCount={pageCount} hrefFor={(n) => hrefFor(cat, n)} />
        </div>
      </div>

      <p role="status" className="visually-hidden">
        {announce}
      </p>

      {sheetOpen && (
        <FilterSheet
          {...filterProps}
          resultCount={list.length}
          onClose={() => setSheetOpen(false)}
          renderFields={() => (
            <>
              <FilterFields {...filterProps} columns="auto" idPrefix="m" />
              <HideSold checked={filters.hideSold} onChange={filterProps.onToggleHideSold} spaced />
            </>
          )}
        />
      )}
    </main>
  );
}

type FieldProps = {
  filters: Filters;
  onToggleSize: (s: string) => void;
  onToggleEra: (e: Era) => void;
  columns: 3 | 'auto';
  idPrefix: string;
};

/** Size + Era chip groups (shared by the mobile sheet and the desktop sidebar). */
function FilterFields({ filters, onToggleSize, onToggleEra, columns }: FieldProps) {
  const grid = columns === 3 ? styles.grid3 : '';
  return (
    <>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Size</legend>
        <div className={`${styles.chipGrid} ${grid || styles.grid6}`}>
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className={styles.sq}
              aria-pressed={filters.sizes.includes(s)}
              onClick={() => onToggleSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Era</legend>
        <div className={`${styles.chipGrid} ${grid || styles.grid5}`}>
          {ERAS.map((e) => (
            <button
              key={e}
              type="button"
              className={styles.sq}
              aria-pressed={filters.eras.includes(e)}
              onClick={() => onToggleEra(e)}
            >
              {e}
            </button>
          ))}
        </div>
      </fieldset>
    </>
  );
}

function HideSold({ checked, onChange, spaced }: { checked: boolean; onChange: () => void; spaced?: boolean }) {
  return (
    <label className={`${ui.checkRow} ${spaced ? styles.hideSoldSpaced : ''}`}>
      <input type="checkbox" className={ui.checkbox} checked={checked} onChange={onChange} />
      Hide sold pieces
    </label>
  );
}
