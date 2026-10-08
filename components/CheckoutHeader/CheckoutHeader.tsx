import Link from 'next/link';
import { Logo } from '../Header/Logo';
import styles from './CheckoutHeader.module.css';

/**
 * Checkout header (README 5): logo (/shop) + `back to bag` only — no menu, no bag preview.
 * Mobile (A21_Checkout): 56px, logo left 15px, `back to bag` right.
 * Desktop (A21_DCheckout): the DHeader grid with `back to bag` on the left.
 */
export function CheckoutHeader() {
  return (
    <>
      <header className={`m-only ${styles.mobile}`}>
        <Logo size="mobile" />
        <Link href="/bag" className={styles.back}>
          back to bag
        </Link>
      </header>
      <header className={`d-only ${styles.desktop}`}>
        <div className={styles.dLeft}>
          <Link href="/bag" className={styles.back}>
            back to bag
          </Link>
        </div>
        <Logo size="desktop" />
        <div />
      </header>
    </>
  );
}
