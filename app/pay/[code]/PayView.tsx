'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { checkoutConfig, site } from '@/lib/catalog';
import { formatDate, formatPrice } from '@/lib/format';
import { useMyOrders } from '@/lib/orders';
import styles from './pay.module.css';

export type PayState = 'open' | 'paid' | 'expired';

/** "₩ 000,000" with a no-break space, as in the design. */
const price = (n: number | null) => formatPrice(n).replace(' ', ' ');

/**
 * Private payment link (A21_Pay · A21_DPay, README 8-16): one line made for one customer. No sign-in needed —
 * `pay` opens the normal checkout with just this line (`/checkout?pay=<code>`).
 */
export function PayView({ code, preview }: { code: string; preview?: PayState }) {
  // TODO(backend): private payment links create/lookup — the prototype shows the one sample for any code.
  const link = checkoutConfig.privatePayment.sample;
  const amount = link.amount as number | null;

  // Paid on this device → the link shows `paid` with the order date.
  const mine = useMyOrders();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const paidOrder = ready ? mine.find((o) => o.privatePay?.code === code) : undefined;
  const state: PayState = preview ?? (paidOrder ? 'paid' : (link.state as PayState));
  const paidOn = paidOrder?.date ?? formatDate(new Date());

  return (
    <main className={styles.main}>
      <p className={styles.kicker}>
        private payment
        <span lang="ko" className={styles.kickerKo}>
          개인 결제
        </span>
      </p>
      <h1 className={styles.title}>{link.title}</h1>
      <p className={styles.amount}>{price(amount)}</p>
      <p className={styles.note}>{link.note}</p>
      <dl className={styles.kv}>
        <div>
          <dt>for</dt>
          <dd>{link.customerName}</dd>
        </div>
        <div>
          <dt>pay by</dt>
          <dd>{formatDate(link.payBy)}</dd>
        </div>
        <div>
          <dt>shipping</dt>
          <dd>{link.shippingIncluded ? 'included' : 'not needed'}</dd>
        </div>
      </dl>

      {state === 'open' && (
        <>
          <Link href={`/checkout?pay=${encodeURIComponent(code)}`} className={styles.pay}>
            pay {price(amount)}
          </Link>
          <p className={styles.private}>
            this link is only for you. please don&apos;t share it.
            <span lang="ko" className={styles.privateKo}>
              나만 쓰는 결제 링크예요. 다른 분과 공유하지 말아 주세요.
            </span>
          </p>
        </>
      )}
      {state === 'paid' && (
        <>
          <button type="button" disabled className={styles.paid}>
            paid · {paidOn}
          </button>
          <Link href="/mypage" className={styles.textLink}>
            see your order
          </Link>
        </>
      )}
      {state === 'expired' && (
        <>
          <p role="status" className={styles.expired}>
            this link has expired. message us and we&apos;ll send a new one.
          </p>
          <a href={`mailto:${site.contact.email}`} className={styles.textLink}>
            {site.contact.email}
          </a>
        </>
      )}
    </main>
  );
}
