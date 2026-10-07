'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CategoryMenu } from '@/components/CategoryMenu/CategoryMenu';
import { FilterPanel } from '@/components/Filter/FilterPanel';
import { ProductCard, ProductGrid } from '@/components/ProductCard/ProductCard';
import { activeFilterCount, displayTotal, filterProducts, LAST_SHOP_KEY, parseShopQuery, shopHref } from '@/lib/shop';
import styles from './shop.module.css';

const PAGE = 12;

/** A21_Shop / A21_DShop. All list state (category, filters, sort) lives in the URL. */
export function ShopView() {
  const params = useSearchParams();
  const router = useRouter();
  const query = parseShopQuery(params);
  const queryKey = shopHref(query);

  const [shown, setShown] = useState(PAGE);
  const [filterOpen, setFilterOpen] = useState(false);

  // New view → back to the first 12. Remember it so a product page's "back" returns here with filters.
  useEffect(() => {
    setShown(PAGE);
    try {
      sessionStorage.setItem(LAST_SHOP_KEY, queryKey);
    } catch {
      // storage blocked: "back" falls back to /shop
    }
  }, [queryKey]);

  const hits = filterProducts(query);
  const total = displayTotal(query, hits.length);
  const list = hits.slice(0, shown);
  const nActive = activeFilterCount(query);
  const filterLabel = nActive ? `filter (${nActive})` : 'filter';

  // Focus returns to whichever filter button opened the panel (useModal).
  const filterButton = (className: string) => (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={filterOpen}
      className={className}
      onClick={() => setFilterOpen(true)}
    >
      {filterLabel}
    </button>
  );

  return (
    <>
      <h1 className="visually-hidden">shop</h1>

      {/* Mobile toolbar: "all ▾" left, filter right. Desktop has the category menu in the header. */}
      <div className={`m-only ${styles.toolbar}`}>
        <CategoryMenu variant="mobile" />
        {filterButton(styles.toolBtn)}
      </div>
      <div className={`d-only ${styles.dFilterRow}`}>{filterButton(`${styles.toolBtn} ${styles.dFilterBtn}`)}</div>

      <main className={styles.main}>
        {list.length > 0 ? (
          <ProductGrid label="Products">
            {list.map((p) => (
              <ProductCard
                key={p.id}
                name={p.name}
                href={`/product/${p.id}`}
                price={p.price}
                sold={p.sold}
                sizeLabel={p.sizeLabel}
                image={p.images[0]?.src}
              />
            ))}
          </ProductGrid>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyText}>no pieces match.</p>
            <button type="button" className={styles.underlined} onClick={() => router.push('/shop', { scroll: false })}>
              clear filters
            </button>
          </div>
        )}

        {list.length > 0 && total > list.length && (
          <div className={styles.more}>
            {/* TODO: page through the real product API; 127 / 300 are display placeholders (README 8-2). */}
            <button type="button" className={styles.moreBtn} onClick={() => setShown((n) => n + PAGE)}>
              <span className={styles.underline}>load more</span>
              <span className={styles.moreCount}>
                {list.length} of {total}
              </span>
            </button>
          </div>
        )}
      </main>

      <p role="status" className="visually-hidden">
        {list.length ? `${list.length} of ${total} pieces shown.` : 'No pieces match.'}
      </p>

      {filterOpen && (
        <FilterPanel
          query={query}
          onClose={() => setFilterOpen(false)}
          onApply={(next) => {
            setFilterOpen(false);
            router.push(shopHref(next), { scroll: false });
          }}
        />
      )}
    </>
  );
}
