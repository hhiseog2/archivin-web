'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Placeholder } from '@/components/Placeholder';
import { addToBag, removeFromBag, useBag } from '@/lib/cart';
import { getProduct, site } from '@/lib/catalog';
import { formatPrice, sizeLabel, sumPrices } from '@/lib/format';
import ui from '@/components/ui.module.css';
import styles from './bag.module.css';

/**
 * Bag. Removing a piece leaves a "was removed. / Undo" row in its place (no confirm dialog).
 * Undo puts it back in the same spot.
 */
export function BagView() {
  const bag = useBag();
  // Row order for this visit, so removed rows (and undone ones) keep their place.
  const [order, setOrder] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  // The bag lives in localStorage; wait for it before deciding between "empty" and the list.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  useEffect(() => {
    setOrder((prev) => {
      const missing = bag.filter((id) => !prev.includes(id));
      return missing.length ? [...prev, ...missing] : prev;
    });
  }, [bag]);

  const ids = [...order, ...bag.filter((id) => !order.includes(id))];
  const rows = ids.filter((id) => bag.includes(id) || removed.includes(id)).map((id) => ({ id, p: getProduct(id) }));
  const kept = bag.map(getProduct).filter((p): p is NonNullable<typeof p> => !!p);
  const count = kept.length;
  const subtotal = sumPrices(kept.map((p) => p.price));
  const total = subtotal == null ? null : subtotal + site.shippingFee;

  return (
    <main className={styles.main}>
      <div className={styles.head}>
        <h1 className={ui.pageTitle}>{ready ? `Bag (${count})` : 'Bag'}</h1>
      </div>

      {!ready ? null : rows.length > 0 ? (
        <div className={styles.layout}>
          <ul aria-label="Items in your bag" className={styles.list}>
            {rows.map(({ id, p }) => {
              const name = p?.name ?? id;
              const href = `/product/${id}`;
              return (
                <li key={id} className={styles.row}>
                  {bag.includes(id) ? (
                    <div className={styles.item}>
                      <Link href={href} aria-label={name} className={styles.thumb}>
                        <Placeholder label="[FRONT]" ratio="4 / 5" className={styles.thumbWell} />
                      </Link>
                      <div className={styles.itemBody}>
                        <div className={styles.itemText}>
                          <Link href={href} className={styles.itemName}>
                            {name}
                          </Link>
                          <span className={ui.meta}>Size {sizeLabel(p?.size)} · 1 of 1</span>
                          <span className={`${styles.itemPrice} m-only`}>{formatPrice(p?.price)}</span>
                          <button
                            type="button"
                            className={styles.remove}
                            onClick={() => {
                              removeFromBag(id);
                              setRemoved((r) => [...r, id]);
                            }}
                          >
                            Remove<span className="visually-hidden"> {name}</span>
                          </button>
                        </div>
                        <span className={`${styles.itemPrice} d-only`}>{formatPrice(p?.price)}</span>
                      </div>
                    </div>
                  ) : (
                    <div role="status" className={styles.removed}>
                      <span>{name} was removed.</span>
                      <button
                        type="button"
                        className={styles.undo}
                        onClick={() => {
                          addToBag(id);
                          setRemoved((r) => r.filter((x) => x !== id));
                        }}
                      >
                        Undo
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <section aria-labelledby="sum-h" className={styles.summary}>
            <h2 id="sum-h" className={`${styles.sumTitle} d-only`}>
              Order summary
            </h2>
            <dl className={styles.sumList}>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{formatPrice(site.shippingFee)}</dd>
              </div>
              <div className={styles.total}>
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <p className={styles.sumNote}>Remote and island areas cost extra. Pay by card, bank transfer or easy pay at checkout.</p>
            <div className={styles.sumActions}>
              {count > 0 ? (
                <Link href="/checkout" className={ui.btnPrimary}>
                  Checkout
                </Link>
              ) : (
                <button type="button" aria-disabled="true" className={ui.btnDisabled}>
                  Checkout
                </button>
              )}
              <Link href="/shop" className={ui.textLinkCenter}>
                Continue shopping
              </Link>
            </div>
          </section>
        </div>
      ) : (
        <section className={styles.empty}>
          <p className={styles.emptyLead}>Your bag is empty.</p>
          <p className={styles.emptySub}>Every piece in the shop is one of one.</p>
          <Link href="/shop" className={`${ui.btnPrimary} ${styles.emptyBtn}`}>
            Shop new in
          </Link>
        </section>
      )}
    </main>
  );
}
