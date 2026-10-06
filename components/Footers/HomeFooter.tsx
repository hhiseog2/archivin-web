import Link from 'next/link';
import { site } from '@/lib/catalog';
import styles from './HomeFooter.module.css';

/** Home's own short footer on mobile (design/mobile/Main). */
export function HomeFooter() {
  return (
    <footer className={styles.footer}>
      <nav aria-label="Footer" className={styles.nav}>
        <Link href="/shop">Shop</Link>
        <Link href="/lookbook/1">Lookbook</Link>
        {/* TODO: Posters page/link */}
        <a href="#">Posters</a>
        <Link href="/about">Stores</Link>
        {/* TODO: Instagram / Terms / Privacy URLs (data/site.json) */}
        <a href={site.links.instagram}>Instagram</a>
        <a href={site.links.terms}>Terms</a>
        <a href={site.links.privacy}>Privacy</a>
        <Link href="/about">Contact</Link>
      </nav>
      <div className={styles.copy}>© ARCHIVIN</div>
    </footer>
  );
}
