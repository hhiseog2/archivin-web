import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from '@/components/Icons';
import { SiteChrome } from '@/components/SiteChrome';
import ui from '@/components/ui.module.css';
import parked from '@/components/parked.module.css';
import styles from './mypage.module.css';

export const metadata: Metadata = { title: 'My page' };

// TODO: require sign-in and load the member's name, order counts and recent order from the account API.
const STATUS = [
  { label: 'Awaiting payment', count: 1 },
  { label: 'Paid', count: 0 },
  { label: 'Shipping', count: 0 },
  { label: 'Delivered', count: 0 },
];

const LINKS = [
  { label: 'Orders', href: '#' },
  { label: 'Wishlist', href: '#' },
  { label: 'My reviews', href: '/reviews' },
  { label: 'Addresses', href: '#' },
  { label: 'Account details', href: '#' },
];

/** Parked: UI shell only. */
export default function MyPage() {
  return (
    <SiteChrome>
      <main className={parked.column}>
        <div className={styles.head}>
          <h1 className={ui.pageTitle}>My page</h1>
          <p className={parked.lead}>Signed in as [NAME]</p>
        </div>

        <section aria-label="Order status" className={styles.status}>
          {STATUS.map((s, i) => (
            <a key={s.label} href="#" className={`${styles.statusTile} ${i === 0 ? styles.statusOn : ''}`}>
              <span className={styles.statusCount}>{s.count}</span>
              <span className={styles.statusLabel}>{s.label}</span>
            </a>
          ))}
        </section>

        <section aria-labelledby="recent" className={styles.recentWrap}>
          <h2 id="recent" className={`${parked.sectionTitle} ${styles.recentTitle}`}>
            Recent order
          </h2>
          <article className={styles.order}>
            <div className={styles.orderTop}>
              <span className={styles.orderNo}>[ORDER NO.]</span>
              <span className={`${ui.tag} ${styles.orderTag}`}>Awaiting payment</span>
            </div>
            <p className={styles.orderMeta}>[DATE] · 2 pieces</p>
            <div className={styles.orderThumbs}>
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </div>
            <p className={styles.orderItems}>80&apos;s Iggy Pop, 80&apos;s Pet Shop Boys</p>
            <div className={styles.orderFoot}>
              <span className={styles.orderPrice}>₩ 000,000</span>
              <Link href="/order/complete?method=bank" className={ui.textLink}>
                See account to pay
              </Link>
            </div>
          </article>
        </section>

        <nav aria-label="Account" className={styles.nav}>
          {LINKS.map((l) =>
            l.href.startsWith('/') ? (
              <Link key={l.label} href={l.href} className={styles.navLink}>
                {l.label}
                <ChevronRight />
              </Link>
            ) : (
              <a key={l.label} href={l.href} className={styles.navLink}>
                {l.label}
                <ChevronRight />
              </a>
            ),
          )}
        </nav>
        <div className={styles.signOut}>
          {/* TODO: sign out */}
          <Link href="/">Sign out</Link>
        </div>
      </main>
    </SiteChrome>
  );
}
