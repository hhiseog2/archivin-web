import type { ReactNode } from 'react';
import { catalog, getProduct, type Product } from '@/lib/catalog';
import { formatPrice, sumPrices } from '@/lib/format';
import type { Order } from '@/lib/orders';
import { pieces } from '@/lib/shop';
import styles from './summary.module.css';

type PrivatePay = NonNullable<Order['privatePay']>;

/**
 * Lines and totals for an order: bag pieces, or the one line of a private payment link (README 8-16 —
 * its amount already covers shipping, so the shipping row reads `included` / `not needed`).
 */
export function orderTotals(ids: string[], privatePay?: PrivatePay) {
  const items = ids.map(getProduct).filter((p): p is Product => !!p);
  if (privatePay) {
    return {
      items,
      count: 1,
      subtotal: privatePay.amount,
      shipping: privatePay.shippingIncluded ? 'included' : 'not needed',
      total: privatePay.amount,
    };
  }
  const subtotal = sumPrices(items.map((p) => p.price));
  return {
    items,
    count: items.length,
    subtotal,
    shipping: formatPrice(catalog.shippingFee),
    total: subtotal == null ? null : subtotal + catalog.shippingFee,
  };
}

/** `your order` (A21_Checkout · A21_OrderDone): title + count, rows (photo 56×75), subtotal · shipping · total. */
export function OrderSummary({
  headingId,
  ids,
  privatePay,
  children,
}: {
  headingId: string;
  ids: string[];
  privatePay?: PrivatePay;
  /** Shown under the totals (order complete: `shipping to …`). */
  children?: ReactNode;
}) {
  const t = orderTotals(ids, privatePay);
  return (
    <section aria-labelledby={headingId} className={styles.summary}>
      <div className={styles.head}>
        <h2 id={headingId} className={styles.title}>
          your order
        </h2>
        <p className={styles.count}>{pieces(t.count)}</p>
      </div>
      <ul className={styles.list}>
        {privatePay ? (
          <li className={styles.row}>
            <span aria-hidden="true" className={styles.thumbBlank} />
            <div className={styles.text}>
              <span>{privatePay.title}</span>
              <span className={styles.size}>private payment</span>
            </div>
            <span className={styles.price}>{formatPrice(privatePay.amount)}</span>
          </li>
        ) : (
          t.items.map((p) => (
            <li key={p.id} className={styles.row}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[0]?.src} alt="" className={styles.thumb} />
              <div className={styles.text}>
                <span>{p.name}</span>
                <span className={styles.size}>{p.sizeLabel}</span>
              </div>
              <span className={styles.price}>{formatPrice(p.price)}</span>
            </li>
          ))
        )}
      </ul>
      <dl className={styles.sums}>
        <div>
          <dt>subtotal</dt>
          <dd>{formatPrice(t.subtotal)}</dd>
        </div>
        <div>
          <dt>shipping</dt>
          <dd>{t.shipping}</dd>
        </div>
        <div>
          <dt>total</dt>
          <dd>{formatPrice(t.total)}</dd>
        </div>
      </dl>
      {children}
    </section>
  );
}
