'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ExitDoorIcon } from '@/components/ExitDoorIcon/ExitDoorIcon';
import { catalog } from '@/lib/catalog';
import styles from './intro.module.css';

// Arrow 0–0.42s, figure 0.04–0.66s, door 0.547–0.807s, panel lifts 0.847–1.167s, then /shop (README 8-1, 9).
const GO_AT_MS = 1187;

/**
 * Navy intro panel. Logo + line + icon are one link ("ARCHIVIN, enter the shop"). Hover / focus only
 * nudges the arrow 2px — it never navigates. Click / tap / Enter adds `is-go` and the CSS plays the run-in;
 * reduced motion goes straight to /shop.
 */
export function IntroPanel() {
  const router = useRouter();
  const [go, setGo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    router.prefetch('/shop');
    return () => clearTimeout(timer.current);
  }, [router]);

  const enter = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new tab / window: let the browser do it
    e.preventDefault();
    if (go) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push('/shop');
      return;
    }
    setGo(true);
    timer.current = setTimeout(() => router.push('/shop'), GO_AT_MS);
  };

  const list = (
    <div className={styles.bottom}>
      {/* Plain text, not links (README 8-1). TODO(design): may become shop filters once products are tagged. */}
      <ul aria-label="What we carry" className={styles.list}>
        {catalog.introCategories.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <p className={styles.love}>love you all.</p>
    </div>
  );

  return (
    <div className={`ipanel ${go ? 'is-go' : ''} ${styles.panel}`}>
      {/* Mobile: logo, then the line with the icon at its right end; the list 92px below. */}
      <div className={`m-only ${styles.mobile}`}>
        <h1 className={styles.h1}>
          <Link href="/shop" className={`ienter ${styles.enter} ${styles.enterMobile}`} aria-label="ARCHIVIN, enter the shop" onClick={enter}>
            {/* TODO: client to confirm white for the logo and copy — the original thread is cream (README 12). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/archivin-stitch-white.png" alt="" width={330} height={77} className={styles.logoMobile} />
            <span className={styles.lineMobile}>
              <span className={styles.tagline}>selected vintage clothing.</span>
              <ExitDoorIcon size="mobile" />
            </span>
          </Link>
        </h1>
        <div className={styles.listMobile}>{list}</div>
      </div>

      {/* Desktop: logo with the icon 28px to its right (bottoms aligned), the line 40px below; list at the bottom. */}
      <div className={`d-only ${styles.desktop}`}>
        <div aria-hidden="true" className={styles.spaceTop} />
        <h1 className={styles.h1}>
          <Link href="/shop" className={`ienter ${styles.enter} ${styles.enterDesktop}`} aria-label="ARCHIVIN, enter the shop" onClick={enter}>
            <span className={styles.logoRow}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo/archivin-stitch-white.png" alt="" width={800} height={186} className={styles.logoDesktop} />
              <ExitDoorIcon size="desktop" />
            </span>
            <span className={styles.taglineDesktop}>selected vintage clothing.</span>
          </Link>
        </h1>
        <div aria-hidden="true" className={styles.spaceMid} />
        {list}
      </div>
    </div>
  );
}
