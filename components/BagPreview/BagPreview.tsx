'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getProduct } from '@/lib/catalog';
import { formatPrice, sumPrices } from '@/lib/format';
import { pieces } from '@/lib/shop';
import styles from './BagPreview.module.css';

const MAX_ROWS = 3;
/** Props for one drop-in item: BagNav.module.css animates every [data-peekitem] when the preview opens. */
const delay = (s: number) => ({ 'data-peekitem': '', style: { animationDelay: `${s.toFixed(2)}s` } as CSSProperties });

/**
 * Bag preview (README 8-5): opens under `bag` on hover or keyboard focus (CSS in BagNav.module.css),
 * never on tap. Count, up to 3 pieces, "+ n more", subtotal, then view bag / checkout.
 * Items drop in one by one: count 0.04s, piece i 0.10 + 0.08i s, then 0.06s steps.
 */
export function BagPreview({ ids }: { ids: string[] }) {
  const items = ids.map((id) => getProduct(id)).filter((p): p is NonNullable<typeof p> => !!p);
  const shown = items.slice(0, MAX_ROWS);
  const more = items.length - shown.length;
  const after = 0.1 + shown.length * 0.08;
  const subtotal = sumPrices(items.filter((p) => !p.sold).map((p) => p.price));

  return (
    <div className={styles.card}>
      {items.length === 0 ? (
        <>
          <p className={`${styles.item} ${styles.emptyText}`} {...delay(0.04)}>
            your bag is empty.
          </p>
          <Link href="/shop" className={`${styles.item} ${styles.btn} ${styles.btnFill} ${styles.emptyBtn}`} {...delay(0.1)}>
            shop new pieces
          </Link>
        </>
      ) : (
        <>
          <p className={`${styles.item} ${styles.count}`} {...delay(0.04)}>
            {pieces(items.length)}
          </p>
          <ul className={styles.list}>
            {shown.map((p, i) => (
              <li key={p.id} className={`${styles.item} ${styles.row}`} {...delay(0.1 + i * 0.08)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]?.src} alt="" className={styles.thumb} />
                <div className={styles.rowText}>
                  <Link href={`/product/${p.id}`} className={styles.name}>
                    {p.name}
                  </Link>
                  <span className={p.sold ? styles.sold : styles.meta}>
                    {p.sold ? `sold · ${p.sizeLabel}` : `${formatPrice(p.price)} · ${p.sizeLabel}`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {more > 0 && (
            <p className={`${styles.item} ${styles.more}`} {...delay(after)}>
              + {more} more
            </p>
          )}
          <div className={`${styles.item} ${styles.subtotal}`} {...delay(more > 0 ? after + 0.06 : after)}>
            <span>subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className={`${styles.item} ${styles.btns}`} {...delay(more > 0 ? after + 0.12 : after + 0.06)}>
            <Link href="/bag" className={`${styles.btn} ${styles.btnFill}`}>
              view bag
            </Link>
            <Link href="/checkout" className={`${styles.btn} ${styles.btnNavy}`}>
              checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
