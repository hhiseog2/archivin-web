import { Suspense } from 'react';
import { SiteChrome } from '@/components/SiteChrome';
import { ShopView } from './shop/ShopView';
import { INTRO_SEEN_SCRIPT, IntroPanel } from './_intro/IntroPanel';
import styles from './_intro/intro.module.css';

/**
 * Intro (A_IntroNavy / A_DIntroNavy). The shop's first screen is drawn underneath (inert, hidden from assistive tech)
 * so when the panel lifts the shop is already there; then the URL moves to /shop (README 8-1).
 * Once per session: the inline script hides the panel before paint when this tab has seen it.
 */
export default function IntroPage() {
  return (
    <div className={styles.stage}>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SEEN_SCRIPT }} />
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
