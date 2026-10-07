import { Suspense } from 'react';
import { CategoryMenu, CategoryMenuFallback } from '../CategoryMenu/CategoryMenu';
import { SearchField } from '../SearchField/SearchField';
import { BagNav } from './BagNav';
import { Logo } from './Logo';
import { MenuButton } from './MenuButton';
import styles from './header.module.css';

/** Mobile header (A21_Header): 56px, logo left, "menu" and "bag ○" right. z-index 10 so the bag preview floats. */
export function Header() {
  return (
    <header className={styles.mobile}>
      <Logo size="mobile" />
      <nav aria-label="Site" className={styles.right}>
        <MenuButton />
        <BagNav align="mobile" />
      </nav>
    </header>
  );
}

/** Desktop header (from A21_DShop): "all ▾" + search | logo | menu + bag. 3-column grid, 20px top, 48px sides. */
export function DHeader({ onShop = false }: { onShop?: boolean }) {
  return (
    <header className={styles.desktop}>
      <div className={styles.dLeft}>
        <Suspense
          fallback={
            <>
              <CategoryMenuFallback label={onShop ? 'all' : 'shop'} />
              <span className={styles.searchStandIn}>search</span>
            </>
          }
        >
          <CategoryMenu variant="desktop" />
          <SearchField variant="desktop" />
        </Suspense>
      </div>
      <Logo size="desktop" />
      <nav aria-label="Site" className={styles.dRight}>
        <MenuButton />
        <BagNav align="desktop" />
      </nav>
    </header>
  );
}
