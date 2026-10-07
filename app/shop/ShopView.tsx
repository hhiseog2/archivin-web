'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CategoryMenu } from '@/components/CategoryMenu/CategoryMenu';
import { ProductCard, ProductGrid } from '@/components/ProductCard/ProductCard';
import { SearchField } from '@/components/SearchField/SearchField';
import { SortMenu } from '@/components/SortMenu/SortMenu';
import { useBag } from '@/lib/cart';
import { displayTotal, filterProducts, goShop, LAST_SHOP_KEY, parseShopQuery, shopHref } from '@/lib/shop';
import styles from './shop.module.css';

const PAGE = 12;

/**
 * A21_Shop / A21_DShop. Category, brand, sort, include sold and the search all live in the URL.
 * `preview` renders it under the intro panel (no side effects, nothing focusable).
 */
export function ShopView({ preview = false }: { preview?: boolean }) {
  const params = useSearchParams();
  const query = parseShopQuery(preview ? new URLSearchParams() : params);
  const key = shopHref(query);
  const bag = useBag();

  const [shown, setShown] = useState(PAGE);

  // New view → back to the first 12. Remember it so a product page's "back" returns here.
  useEffect(() => {
    if (preview) return;
    setShown(PAGE);
    try {
      sessionStorage.setItem(LAST_SHOP_KEY, key);
    } catch {
      // storage blocked: "back" falls back to /shop
    }
  }, [key, preview]);

  const hits = filterProducts(query);
  const total = displayTotal(query, hits.length);
  const list = hits.slice(0, shown);

  return (
    <>
      <h1 className="visually-hidden">shop</h1>

      {/* Mobile row under the header: "all ▾" + search left, sort right (z-index 6 so the windows float). */}
      <div className={`m-only ${styles.toolbar}`}>
        <div className={styles.toolLeft}>
          <CategoryMenu variant="mobile" />
          <SearchField variant="mobile" />
        </div>
        <SortMenu />
      </div>
      {/* Desktop: "all ▾" + search are in the header; sort sits 40px under it on the right. */}
      <div className={`d-only ${styles.dSortRow}`}>
        <div className={styles.dSort}>
          <SortMenu />
        </div>
      </div>

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
                hoverImage={p.hoverImage?.src}
                inBag={bag.includes(p.id)}
              />
            ))}
          </ProductGrid>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyText}>no pieces match.</p>
            {/* Back to all, no brand, no search; sort / include sold stay and an open search stays open. */}
            <button
              type="button"
              className={styles.underlined}
              onClick={() => goShop(shopHref({ ...query, cat: 'all', brands: [], q: '' }), { onShop: true, push: () => {} })}
            >
              see all pieces
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

      {!preview && (
        <p role="status" className="visually-hidden">
          {list.length ? `${list.length} of ${total} pieces shown.` : 'No pieces match.'}
        </p>
      )}
    </>
  );
}
