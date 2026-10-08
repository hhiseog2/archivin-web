'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CategoryMenu } from '@/components/CategoryMenu/CategoryMenu';
import { ProductCard, ProductGrid } from '@/components/ProductCard/ProductCard';
import { SearchField } from '@/components/SearchField/SearchField';
import { SizeMenu } from '@/components/SizeMenu/SizeMenu';
import { SortMenu } from '@/components/SortMenu/SortMenu';
import { SubcategoryRow } from '@/components/SubcategoryRow/SubcategoryRow';
import { signInHref, useCanSeePrices } from '@/lib/auth';
import { useBag } from '@/lib/cart';
import {
  currentViewLabel,
  displayTotal,
  EMPTY_SIZE,
  filterProducts,
  goShop,
  hasRelevantSize,
  hasSizeParams,
  LAST_SHOP_KEY,
  parseShopQuery,
  readSizeMemory,
  shopHref,
  subsFor,
  writeSizeMemory,
  type SizePick,
} from '@/lib/shop';
import styles from './shop.module.css';

const PAGE = 12;
const noPush = () => {};

/**
 * A21_Shop / A21_DShop. Category, brand, subcategory, sizes, sort, include sold and the search all live in the URL.
 * `preview` renders it under the intro panel (no side effects, nothing focusable).
 */
export function ShopView({ preview = false }: { preview?: boolean }) {
  const params = useSearchParams();
  const query = parseShopQuery(preview ? new URLSearchParams() : params);
  const key = shopHref(query);
  const bag = useBag();
  const canSeePrices = useCanSeePrices();
  const missingSize = !preview && !hasSizeParams(params);

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

  // No size · waist · shoe in the URL → this device's remembered sizes apply and join the URL (README 8-2 "기억 · URL").
  useEffect(() => {
    if (!missingSize) return;
    const remembered = readSizeMemory();
    if (remembered) goShop(shopHref({ ...parseShopQuery(params), ...remembered }), { onShop: true, replace: true, push: noPush });
  }, [missingSize, params]);

  const go = (href: string, replace = false) => goShop(href, { onShop: true, replace, push: noPush });
  const setSize = (next: SizePick, replace = false) => {
    writeSizeMemory(next);
    go(shopHref({ ...query, ...next }), replace);
  };

  const hits = filterProducts(query);
  const total = displayTotal(query, hits.length);
  const totalCount = Number(total.replace(/,/g, ''));
  const list = hits.slice(0, shown);
  const subs = subsFor(query);
  const viewLabel = currentViewLabel(query);
  const anySize = hasRelevantSize(query);

  const subRow = (variant: 'mobile' | 'desktop') => (
    <SubcategoryRow subs={subs} value={query.sub} label={viewLabel} variant={variant} onPick={(sub) => go(shopHref({ ...query, sub }))} />
  );
  // Chips re-filter in place, so they replace the history entry instead of stacking one per tap.
  const sizeMenu = (variant: 'mobile' | 'desktop') => <SizeMenu query={query} variant={variant} onChange={(next) => setSize(next, true)} />;

  return (
    <>
      <h1 className="visually-hidden">shop</h1>

      {/* Mobile row under the header: "all ▾" + search left, [size][sort] right (z-index 6 so the windows float). */}
      <div className={`m-only ${styles.toolbar}`}>
        <div className={styles.toolLeft}>
          <CategoryMenu variant="mobile" />
          <SearchField variant="mobile" />
        </div>
        <div className={styles.toolRight}>
          {sizeMenu('mobile')}
          <SortMenu />
        </div>
      </div>
      {subs.length > 0 && <div className="m-only">{subRow('mobile')}</div>}

      {/* Desktop: "all ▾" + search are in the header; 40px under it the subcategories wrap on the left, [size][sort] on the right. */}
      <div className={`d-only ${styles.dRow}`}>
        <div className={styles.dSubs}>{subRow('desktop')}</div>
        <div className={styles.dTools}>
          {sizeMenu('desktop')}
          <div className={styles.dSort}>
            <SortMenu />
          </div>
        </div>
      </div>

      <main className={styles.main}>
        {!canSeePrices && (
          <p className={styles.memberNote}>
            prices are shown to members.
            <Link href={signInHref(key)} className={styles.signIn}>
              sign in
            </Link>
          </p>
        )}

        {list.length > 0 ? (
          <div className={styles.list}>
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
                  showPrice={canSeePrices}
                />
              ))}
            </ProductGrid>
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyText}>no pieces match.</p>
            <div className={styles.emptyActions}>
              {anySize && (
                <button type="button" className={styles.underlined} onClick={() => setSize(EMPTY_SIZE)}>
                  clear size
                </button>
              )}
              {/* Back to all: no brand, subcategory, search or sizes; sort / include sold stay. */}
              <button
                type="button"
                className={styles.underlined}
                onClick={() => {
                  writeSizeMemory(EMPTY_SIZE);
                  go(shopHref({ ...query, cat: 'all', brands: [], sub: null, q: '', ...EMPTY_SIZE }));
                }}
              >
                see all pieces
              </button>
            </div>
          </div>
        )}

        {list.length > 0 && totalCount > list.length && (
          <div className={styles.more}>
            {/* TODO(backend): page through the real product API; 338 / 2,713 are archivin.kr's totals on 2026.10.08 (README 8-2). */}
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
