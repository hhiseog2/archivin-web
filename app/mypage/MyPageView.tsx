'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from '@/components/Icons';
import { SAMPLE_ORDERS, useMyOrders, type Order } from '@/lib/orders';
import { MemberGate, signOutAndLeave } from './MemberGate';
import { orderPhotos, piecesLabel, statusLine } from './orderText';
import styles from './mypage.module.css';

const ROWS = [
  { label: 'addresses', href: '/mypage/addresses' },
  { label: 'my reviews', href: '/reviews' },
  { label: 'account details', href: '/mypage/account' },
];

/** Card link by status (README 8-9). Waiting → the bank account on the order page, delivered → write a review. */
function orderLink(o: Order) {
  const view = `/order/complete?id=${encodeURIComponent(o.id)}`;
  if (o.status === 'waiting for payment') return { href: view, label: 'see the account to pay' };
  if (o.status === 'delivered') return { href: '/reviews/write', label: 'write a review' };
  // Not in the design: paid / shipped orders open the order page too.
  if (o.status === 'paid' || o.status === 'shipped') return { href: view, label: 'view order' };
  return null;
}

/** my page (README 8-9, A21_MyPage · A21_DMyPage). */
export function MyPageView() {
  const router = useRouter();
  const mine = useMyOrders();
  // This device's orders first, then the design samples. TODO(backend): load the member's orders.
  const orders = [...mine, ...SAMPLE_ORDERS.filter((s) => !mine.some((m) => m.id === s.id))];

  return (
    <MemberGate path="/mypage">
      {(session) => (
        <main className={styles.main}>
          <h1 className={styles.title}>my page</h1>
          <p className={styles.lead}>
            {session.email} ·{' '}
            <Link
              href="/shop"
              className={styles.signOut}
              onClick={(e) => {
                e.preventDefault();
                // TODO(backend): end the member session.
                signOutAndLeave(router);
              }}
            >
              sign out
            </Link>
          </p>

          <section aria-labelledby="mp-h-orders" className={styles.orders}>
            <h2 id="mp-h-orders" className={styles.h2}>
              orders
            </h2>
            <ul className={styles.list}>
              {orders.map((o) => {
                const link = orderLink(o);
                return (
                  <li key={o.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <p className={styles.meta}>
                        {o.id} · {o.date}
                      </p>
                      <p className={styles.meta}>{piecesLabel(o)}</p>
                    </div>
                    <p className={styles.status}>{statusLine(o)}</p>
                    <div className={styles.thumbs}>
                      {orderPhotos(o).map((p) =>
                        p.src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={p.id} src={p.src} alt="" className={styles.thumb} />
                        ) : (
                          <span key={p.id} aria-hidden="true" className={styles.thumb} />
                        ),
                      )}
                    </div>
                    {link && (
                      <Link href={link.href} className={styles.cardLink}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <nav aria-label="Account" className={styles.rows}>
            {ROWS.map((r) => (
              <Link key={r.href} href={r.href} className={styles.row}>
                {r.label}
                <ChevronRight size={11} />
              </Link>
            ))}
          </nav>
        </main>
      )}
    </MemberGate>
  );
}
