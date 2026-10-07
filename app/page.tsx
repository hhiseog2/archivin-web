import { Suspense } from 'react';
import { SiteChrome } from '@/components/SiteChrome';
import { ShopView } from './shop/ShopView';
import { IntroPanel } from './_intro/IntroPanel';
import styles from './_intro/intro.module.css';

/**
 * Intro (A_Intro / A_DIntro). The shop's first screen is drawn underneath (inert, hidden from assistive tech)
 * so when the navy panel lifts the shop is already there; then the URL moves to /shop (README 8-1).
 * TODO(design): show the intro on every visit or once per session — every visit for now (README 12).
 */
export default function IntroPage() {
  return (
    <div className={styles.stage}>
      <div className={styles.under} inert aria-hidden="true">
        <SiteChrome onShop fullWidth>
          <Suspense>
            <ShopView preview />
          </Suspense>
        </SiteChrome>
      </div>
      <IntroPanel />
    </div>
  );
}
