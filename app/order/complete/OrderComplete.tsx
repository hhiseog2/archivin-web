'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { signInHref, useSignedIn } from '@/lib/auth';
import { checkoutConfig } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import { getOrder, useMyOrders } from '@/lib/orders';
import { OrderSummary, orderTotals } from '@/app/checkout/OrderSummary';
import { CopyAccount } from './CopyAccount';
import styles from './complete.module.css';

/**
 * Order complete (README 8-8): bank transfer → A21_OrderDone `almost yours.` (waiting for payment),
 * card → A21_OrderPaid `it's yours.`. Loaded by order number; the design samples work without checking out.
 */
export function OrderComplete({ id }: { id: string }) {
  const mine = useMyOrders();
  const signedIn = useSignedIn();
  // Orders placed on this device live in localStorage; wait for them before saying "not found".
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const order = id ? getOrder(id, mine) : undefined;

  if (!order) {
    if (!ready) return <main className={styles.main} />;
    // TODO(design): unknown order number has no design.
    return (
      <main className={styles.main}>
        <h1 className={styles.title}>we couldn&apos;t find this order.</h1>
        <p className={styles.lead}>check the order number, or see your orders in my page.</p>
        <div className={styles.actions}>
          <Link href="/shop" className={styles.primary}>
            continue shopping
          </Link>
          <Link href="/mypage" className={styles.textLink}>
            my page
          </Link>
        </div>
      </main>
    );
  }

  const bank = order.method === 'bank';
  const total = formatPrice(orderTotals(order.items, order.privatePay).total);
  const payBy = order.payBy ?? '';
  const depositor = order.depositor ?? order.shipTo?.name;

  return (
    <main className={styles.main}>
      <p className={styles.number}>order {order.id}</p>
      <h1 className={styles.title}>{bank ? 'almost yours.' : "it's yours."}</h1>

      {bank ? (
        <>
          <p className={styles.lead}>
            send {total} to the account below by {payBy} 23:59. we confirm the order when the payment arrives.
          </p>
          <p lang="ko" className={styles.ko}>
            아래 계좌로 {payBy} 23:59까지 입금해 주세요. 입금이 확인되면 주문이 확정돼요.
          </p>
          <CopyAccount amount={total} payBy={payBy} depositor={depositor} />
        </>
      ) : (
        <p className={styles.lead}>
          we got {total} by card. the receipt is on its way to {order.email ?? 'your email'}.
        </p>
      )}

      <section aria-labelledby="od-h-next" className={styles.next}>
        <h2 id="od-h-next" className={styles.h2}>
          what&apos;s next
        </h2>
        {bank ? (
          <p className={styles.body}>
            once the payment arrives, it ships in 2–3 business days. we text you the tracking number.
          </p>
        ) : (
          <>
            <p className={styles.body}>it ships in 2–3 business days. we text you the tracking number.</p>
            <p lang="ko" className={styles.ko}>
              영업일 2–3일 안에 발송하고, 송장 번호를 문자로 보내 드려요.
            </p>
          </>
        )}
      </section>

      <div className={styles.items}>
        <OrderSummary headingId="od-h-items" ids={order.items} privatePay={order.privatePay}>
          {order.shipTo && (
            <p className={styles.shipTo}>
              shipping to {order.shipTo.name} · {order.shipTo.phone}
              <br />
              {order.shipTo.address}
            </p>
          )}
        </OrderSummary>
      </div>

      <div className={styles.actions}>
        <Link href="/shop" className={styles.primary}>
          continue shopping
        </Link>
        <Link href="/mypage" className={styles.textLink}>
          view order
        </Link>
      </div>

      {checkoutConfig.guestCheckout && !signedIn && (
        <p className={styles.guest}>
          ordered as a guest? keep the order number, or <Link href={signInHref('/mypage')}>create an account</Link> to
          see it anytime.
        </p>
      )}
    </main>
  );
}
