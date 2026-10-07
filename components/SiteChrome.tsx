import type { ReactNode } from 'react';
import { Footer } from './Footer/Footer';
import { DHeader, Header } from './Header/Header';
import styles from './SiteChrome.module.css';

type Props = {
  children: ReactNode;
  /** Product, bag and intro have no footer (README 5). */
  footer?: boolean;
  /** Mobile screens that bring their own top bar (search, checkout). Desktop always keeps the header. */
  mobileHeader?: boolean;
  /** /shop: the desktop header's category menu shows the current view. */
  onShop?: boolean;
  /**
   * Pages redesigned in v2 (shop, product, bag) set their own 48px desktop gutters.
   * The kept pages (about, notice, …) still use 24px inside, so they get 24px more here to line up with the header.
   */
  fullWidth?: boolean;
};

/** Page shell for every page except the intro: Header (mobile) / DHeader (desktop) → page → Footer. */
export function SiteChrome({ children, footer = true, mobileHeader = true, onShop = false, fullWidth = false }: Props) {
  return (
    <div className={styles.page}>
      <a href="#content" className={styles.skip}>
        skip to content
      </a>
      {mobileHeader && (
        <div className="m-only">
          <Header />
        </div>
      )}
      <div className="d-only">
        <DHeader onShop={onShop} />
      </div>

      <div id="content" className={`${styles.content} ${fullWidth ? '' : styles.inset}`}>
        {children}
      </div>

      {footer && (
        <>
          <div className={styles.spacer} />
          <Footer />
        </>
      )}
    </div>
  );
}
