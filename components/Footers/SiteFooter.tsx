import Link from 'next/link';
import { site } from '@/lib/catalog';
import { BusinessInfo } from './BusinessInfo';
import styles from './SiteFooter.module.css';

/** Mobile footer (design/mobile/SiteFooter). */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <nav aria-label="Footer" className={styles.nav}>
        <Link href="/shop">Shop</Link>
        <Link href="/lookbook/1">Lookbook</Link>
        <Link href="/about">About</Link>
        <Link href="/notice">Notice</Link>
        <Link href="/reviews">Reviews</Link>
        {/* TODO: Instagram / Terms / Privacy URLs (data/site.json) */}
        <a href={site.links.instagram}>Instagram</a>
        <a href={site.links.terms}>Terms</a>
        <a href={site.links.privacy}>Privacy</a>
      </nav>
      <div className={styles.store}>
        <div className={styles.storeTitle}>Store</div>
        <div className={styles.storeInfo}>
          {site.store.addressEn}
          <br />
          {site.store.hoursLine}
        </div>
      </div>
      <BusinessInfo className={styles.legal} />
      <div className={styles.copy}>© ARCHIVIN</div>
    </footer>
  );
}
