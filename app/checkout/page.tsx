import type { Metadata } from 'next';
import { CheckoutHeader } from '@/components/CheckoutHeader/CheckoutHeader';
import { CheckoutView } from './CheckoutView';
import styles from './checkout.module.css';

export const metadata: Metadata = { title: 'Checkout' };

/**
 * A21_Checkout · A21_DCheckout (README 8-7). Its own shell: CheckoutHeader only (no site header, menu or
 * bag preview) and no footer. `?pay=<code>` checks out a private payment link (8-16) instead of the bag.
 */
export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ pay?: string | string[] }> }) {
  const { pay } = await searchParams;
  const payCode = typeof pay === 'string' && pay ? pay : undefined;
  return (
    <div className={styles.page}>
      <CheckoutHeader />
      <CheckoutView payCode={payCode} />
    </div>
  );
}
