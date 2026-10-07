'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { addToBag, removeFromBag, useBag } from '@/lib/cart';
import { catalog, getProduct } from '@/lib/catalog';
import { formatPrice, sumPrices } from '@/lib/format';
import { pieces } from '@/lib/shop';
import styles from './bag.module.css';

/**
 * A21_Bag. Remove leaves "… was removed. / undo" in place (no confirm). Sold pieces stay listed
 * but drop out of the totals. Pieces aren't held until checkout.
 */
export function BagView() {
  const bag = useBag();
  // Row order for this visit, so removed rows (and undone ones) keep their place.
  const [order, setOrder] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [proto, setProto] = useState(false);
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
    <>
      {proto && (
        <div role="status" className={styles.proto}>
          <span>prototype — payment isn&apos;t connected.</span>
          <button type="button" className={styles.protoClose} onClick={() => setProto(false)}>
            close
          </button>
        </div>
      )}

      {/* TODO(design): desktop bag has no design (README 8-5) — the mobile column, 560px wide, centred. */}
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
              <p>ships in 2–3 business days · no exchanges or refunds, except defects.</p>
              <p lang="ko" className={styles.policyKo}>
                영업일 2–3일 내 발송 · 하자 외 교환·환불 불가
              </p>
            </div>

            <button
              type="button"
              disabled={buyable.length === 0}
              className={`${styles.checkout} ${buyable.length ? '' : styles.checkoutOff}`}
              onClick={() => {
                // TODO: payment isn't connected yet. Once a PG is in, send buyers to /checkout and
                // re-check stock there (pieces aren't held until payment).
                if (buyable.length) {
                  setProto(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              checkout
            </button>
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
    </>
  );
}
