import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';
import { CopyAccount } from './CopyAccount';
import ui from '@/components/ui.module.css';
import parked from '@/components/parked.module.css';
import styles from './complete.module.css';

export const metadata: Metadata = { title: 'Order placed' };

/**
 * Parked: UI shell only. TODO: load the real order (number, amount, deadline) from the order API
 * and the shop's bank account from settings instead of the placeholders below.
 */
export default async function OrderCompletePage({ searchParams }: { searchParams: Promise<{ method?: string }> }) {
  const { method = 'bank' } = await searchParams;
  const isBank = method !== 'card';

  return (
    <SiteChrome>
      <main className={parked.column}>
        <div className={styles.head}>
          <h1 className={styles.title}>Order placed.</h1>
          <p className={styles.lead}>Order no. [ORDER NO.]. We emailed the details to you.</p>
        </div>

        {isBank ? (
          <section aria-labelledby="pay-title" className={styles.box}>
            <h2 id="pay-title" className={styles.boxTitle}>
              Pay by bank transfer
            </h2>
            <p className={styles.boxNote}>
              Your order is confirmed once the payment arrives. Orders not paid by the deadline are cancelled.
            </p>
            <CopyAccount />
          </section>
        ) : (
          <section aria-labelledby="paid-title" className={styles.box}>
            <h2 id="paid-title" className={styles.boxTitle}>
              Payment complete
            </h2>
            <p className={styles.paid}>₩ 000,000 paid by card.</p>
          </section>
        )}

        <section aria-labelledby="next-title" className={styles.next}>
          <h2 id="next-title" className={parked.sectionTitle}>
            What happens next
          </h2>
          <p className={styles.body}>
            Your order arrives 3–7 business days after payment. We send the tracking number when it ships.
          </p>
        </section>

        <div className={styles.actions}>
          <Link href="/shop" className={ui.btnPrimary}>
            Continue shopping
          </Link>
          <Link href="/mypage" className={ui.textLinkCenter}>
            View order
          </Link>
        </div>

        <section aria-labelledby="acc-title" className={styles.account}>
          <h2 id="acc-title" className={parked.sectionTitle}>
            Save this order to an account
          </h2>
          <p className={styles.accountNote}>
            Track orders and keep your address for next time. It takes one step: we already have your name, mobile
            number and email.
          </p>
          {/* TODO: account creation */}
          <Link href="/signin" className={`${ui.btnSecondary} ${styles.create}`}>
            Create account
          </Link>
          <Link href="/" className={styles.notNow}>
            Not now
          </Link>
        </section>
      </main>
    </SiteChrome>
  );
}
