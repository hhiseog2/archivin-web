import Link from 'next/link';
import { Suspense } from 'react';
import { CategoryMenu, CategoryMenuFallback } from '../CategoryMenu/CategoryMenu';
import { BagLink } from './BagLink';
import { MenuButton } from './MenuButton';
import styles from './header.module.css';

function Logo({ width, height }: { width: number; height: number }) {
  // TODO: swap for the vector logo (SVG) once the client sends it (README 6).
  return (
    <Link href="/shop" aria-label="ARCHIVIN, go to Shop" className={styles.logo}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo/archivin-stitch-navy.png" alt="" width={width} height={height} />
    </Link>
  );
}

/** Mobile header (A21_Header): 56px, navy stitch logo left, "menu" and "bag" right. */
export function Header() {
  return (
    <header className={styles.mobile}>
      <Logo width={168} height={39} />
      <nav aria-label="Site" className={styles.right}>
        <MenuButton />
        <BagLink />
      </nav>
    </header>
  );
}

/** Desktop header (from A21_DShop): category menu + search | logo | menu + bag. */
export function DHeader({ onShop = false }: { onShop?: boolean }) {
  return (
    <header className={styles.desktop}>
      <div className={styles.dLeft}>
        <Suspense fallback={<CategoryMenuFallback label={onShop ? 'all' : 'shop'} />}>
          <CategoryMenu variant="desktop" />
        </Suspense>
        <Link href="/search" className={styles.navItem}>
          search
        </Link>
      </div>
      <Logo width={220} height={51} />
      <nav aria-label="Site" className={styles.dRight}>
        <MenuButton />
        <BagLink />
      </nav>
    </header>
  );
}
