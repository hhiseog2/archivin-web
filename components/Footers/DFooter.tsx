import Link from 'next/link';
import { CATEGORIES, shopHref, site } from '@/lib/catalog';
import { BusinessInfo } from './BusinessInfo';
import styles from './DFooter.module.css';

/** Desktop footer, multi-column (design/desktop/DFooter). */
export function DFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.cols}>
        <div className={styles.brand}>
          <Link href="/" aria-label="ARCHIVIN home" className={styles.wordmark}>
            ARCHIVIN
          </Link>
          <p className={styles.blurb}>Vintage shop in Haebangchon, Seoul. Every piece is one of one.</p>
        </div>

        <nav aria-labelledby="df-shop" className={styles.col}>
          <h2 id="df-shop" className={styles.colTitle}>Shop</h2>
          <ul className={styles.links}>
            {CATEGORIES.map((c) => (
              <li key={c.key}>
                <Link href={shopHref(c.key)}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="df-info" className={styles.col}>
          <h2 id="df-info" className={styles.colTitle}>Info</h2>
          <ul className={styles.links}>
            <li><Link href="/lookbook/1">Lookbook</Link></li>
            <li><Link href="/about">About us</Link></li>
            <li><Link href="/notice">Notice</Link></li>
            <li><Link href="/reviews">Reviews</Link></li>
            {/* TODO: Instagram URL */}
            <li><a href={site.links.instagram}>Instagram</a></li>
          </ul>
        </nav>

        <div className={styles.storeCol}>
          <h2 className={styles.colTitle}>Store</h2>
          <p className={styles.addr}>{site.store.addressEn}</p>
          <p lang="ko" className={styles.addrKo}>{site.store.addressKo}</p>
          <dl className={styles.hours}>
            {site.store.hours.map(([d, h]) => (
              <div key={d}>
                <dt>{d}</dt>
                <dd>{h}</dd>
              </div>
            ))}
          </dl>
          <Link href="/about" className={styles.directions}>
            Directions
          </Link>
        </div>
      </div>

      <div className={styles.bottom}>
        <BusinessInfo oneLine className={styles.legal} />
        <div className={styles.meta}>
          {/* TODO: Terms / Privacy URLs */}
          <a href={site.links.terms}>Terms</a>
          <a href={site.links.privacy}>Privacy</a>
          <span className={styles.copy}>© ARCHIVIN</span>
        </div>
      </div>
    </footer>
  );
}
