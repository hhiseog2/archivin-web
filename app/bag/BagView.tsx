'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCanSeePrices } from '@/lib/auth';
import { addToBag, removeFromBag, useBag } from '@/lib/cart';
import { catalog, getProduct, site } from '@/lib/catalog';
import { formatPrice, sumPrices } from '@/lib/format';
import { pieces } from '@/lib/shop';
import styles from './bag.module.css';

const EMPTY: string[] = [];

/**
 * A21_Bag · A21_DBag (README 8-4). Remove leaves "… was removed. / undo" in place (no confirm). Sold pieces
 * stay listed but drop out of the totals. Pieces aren't held until checkout — not even during it (8-7).
 */
export function BagView() {
  const saved = useBag();
  // Members-only prices: signed-out visitors can't add or check out, so their bag is empty (README 8-2).
  const canBuy = useCanSeePrices();
  const bag = canBuy ? saved : EMPTY;
  // Row order for this visit, so removed rows (and undone ones) keep their place.
  const [order, setOrder] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  // The bag lives in localStorage; wait for it before choosing between "empty" and the list.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  useEffect(() => {
    setOrder((prev) => {
      const missing = bag.filter((id) => !prev.includes(id));
      return missing.length ? [...prev, ...missing] : prev;
    });
  }, [bag]);

  const ids = [...order, ...bag.filter((id) => !order.includes(id))];
  const rows = ids
    .filter((id) => bag.includes(id) || removed.includes(id))
    .map((id) => ({ id, p: getProduct(id)!, kept: bag.includes(id) }))
    .filter((r) => r.p);
  const kept = rows.filter((r) => r.kept);
  const buyable = kept.filter((r) => !r.p.sold);
  const anySold = kept.some((r) => r.p.sold);
  const subtotal = sumPrices(buyable.map((r) => r.p.price));
  const total = subtotal == null ? null : subtotal + catalog.shippingFee;
  const hasRows = rows.length > 0;

  return (
    <main className={styles.main}>
      <div className={styles.head}>
        <h1 className={styles.title}>bag</h1>
        <p className={styles.count}>{ready && kept.length ? pieces(kept.length) : ''}</p>
      </div>

      {!ready ? null : hasRows ? (
        <>
          <ul aria-label="Pieces in your bag" className={styles.list}>
            {rows.map(({ id, p, kept: isKept }) => (
              <li key={id}>
                {isKept ? (
                  <div className={styles.row}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]?.src} alt="" className={styles.thumb} />
                    <div className={styles.rowText}>
                      <Link href={`/product/${id}`} className={styles.rowName}>
                        {p.name}
                      </Link>
                      <span>{p.sold ? `size ${p.sizeLabel}` : `${formatPrice(p.price)} · ${p.sizeLabel}`}</span>
                      {p.sold && <span className={styles.sold}>sold — no longer available.</span>}
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${p.name}`}
                      className={styles.remove}
                      onClick={() => {
                        removeFromBag(id);
                        setRemoved((r) => [...r, id]);
                      }}
                    >
                      remove
                    </button>
                  </div>
                ) : (
                  <div role="status" className={styles.removed}>
                    <span>{p.name} was removed.</span>
                    <button
                      type="button"
                      className={styles.undo}
                      onClick={() => {
                        addToBag(id);
                        setRemoved((r) => r.filter((x) => x !== id));
                      }}
                    >
                      undo
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <dl className={styles.sums}>
            <div>
              <dt>subtotal ({pieces(buyable.length)})</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>shipping</dt>
              <dd>{formatPrice(catalog.shippingFee)}</dd>
            </div>
            <div>
              <dt>total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          <div className={styles.policy}>
            <p className={styles.policyTitle}>shipping &amp; returns</p>
            <p>orders placed by 3 pm ship in 2–3 business days · returns within 7 days of delivery.</p>
            <p lang="ko" className={styles.policyKo}>
              오후 3시 전 주문은 영업일 2–3일 안에 발송 · 받은 날부터 7일 안에 반품 가능
            </p>
            <Link href={site.links.guide} className={styles.guide}>
              shipping &amp; returns guide
            </Link>
          </div>

          {buyable.length > 0 ? (
            <Link href="/checkout" className={styles.checkout}>
              checkout
            </Link>
          ) : (
            <button type="button" disabled className={`${styles.checkout} ${styles.checkoutOff}`}>
              checkout
            </button>
          )}
          <p className={styles.note}>
            {anySold ? "sold pieces aren't in the total. " : ''}pieces aren&apos;t held until you check out.
          </p>
          <p lang="ko" className={styles.noteKo}>
            결제 전까지 상품을 잡아두지 않아요.
          </p>
        </>
      ) : (
        <div className={styles.empty}>
          <p>your bag is empty.</p>
          <Link href="/shop" className={styles.emptyLink}>
            shop new pieces
          </Link>
        </div>
      )}
    </main>
  );
}
