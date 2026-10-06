import type { ReactNode } from 'react';
import { DHeader, type NavKey } from './DHeader/DHeader';
import { DFooter } from './Footers/DFooter';
import { SiteFooter } from './Footers/SiteFooter';
import { SiteHeader } from './SiteHeader/SiteHeader';
import { TopBar } from './TopBar/TopBar';
import styles from './SiteChrome.module.css';

type Props = {
  children: ReactNode;
  /** Desktop nav item to underline. */
  active?: NavKey;
  /** Mobile screens that drop the shared chrome (Search, Checkout). Desktop always keeps it. */
  mobileTopBar?: boolean;
  mobileHeader?: boolean;
  mobileFooter?: boolean;
  /** Min space above the mobile footer (px). Desktop always keeps 80px. */
  mobileFooterGap?: number;
  desktopSearchOpen?: boolean;
  desktopQuery?: string;
  /** Rendered after the footer, e.g. the product page's sticky purchase bar. */
  after?: ReactNode;
};

/**
 * Page shell for every page except home:
 * TopBar → SiteHeader (mobile) / DHeader (desktop) → page → SiteFooter (mobile) / DFooter (desktop).
 */
export function SiteChrome({
  children,
  active,
  mobileTopBar = true,
  mobileHeader = true,
  mobileFooter = true,
  mobileFooterGap = 0,
  desktopSearchOpen = false,
  desktopQuery,
  after,
}: Props) {
  return (
    <div className={styles.page}>
      <a href="#content" className={styles.skip}>
        Skip to content
      </a>
      <div className={mobileTopBar ? undefined : 'd-only'}>
        <TopBar />
      </div>
      {mobileHeader && (
        <div className="m-only">
          <SiteHeader />
        </div>
      )}
      <div className="d-only">
        <DHeader active={active} initialSearchOpen={desktopSearchOpen} initialQuery={desktopQuery} />
      </div>

      <div id="content" className={styles.content}>
        {children}
      </div>

      <div className={styles.spacer} style={{ ['--m-gap' as string]: `${mobileFooterGap}px` }} />
      {mobileFooter && (
        <div className="m-only">
          <SiteFooter />
        </div>
      )}
      <div className="d-only">
        <DFooter />
      </div>
      {after}
    </div>
  );
}
