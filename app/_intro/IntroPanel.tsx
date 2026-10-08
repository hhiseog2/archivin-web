'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { ExitDoorIcon } from '@/components/ExitDoorIcon/ExitDoorIcon';
import styles from './intro.module.css';

// Arrow 0–0.42s, figure 0.04–0.66s, door 0.547–0.807s, panel lifts 0.847–1.167s, then /shop (README 8-1, 9).
const GO_AT_MS = 1187;

/** sessionStorage key: the intro shows once per browser-tab session (README 8-1). */
export const INTRO_SEEN_KEY = 'archivin:intro-seen';

/**
 * Runs before the panel is painted on a full page load (page.tsx inlines it): a second visit in the same
 * session hides the panel straight away, so it never flashes before the move to /shop.
 */
export const INTRO_SEEN_SCRIPT = `try{if(sessionStorage.getItem('${INTRO_SEEN_KEY}')==='1')document.documentElement.setAttribute('data-intro-seen','')}catch(e){}`;

function seenBefore() {
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Intro panel (A_IntroNavy / A_DIntroNavy, v5 layout). Client request: all black on white — logo, line, icon and
 * "love you all." in ink instead of the design's navy.
 * Logo + line + icon are one link ("ARCHIVIN, enter the shop"). Hover / focus only
 * nudges the arrow 2px — it never navigates. Click / tap / Enter adds `is-go` and the CSS plays the run-in;
 * reduced motion goes straight to /shop.
 */
export function IntroPanel() {
  const router = useRouter();
  const [go, setGo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [skip, setSkip] = useState(false);
  // This panel already counted itself as shown (Strict Mode re-runs effects on the same instance).
  const shown = useRef(false);

  // Once per session: shown → remember; seen already → straight to /shop without drawing the panel.
  useLayoutEffect(() => {
    if (shown.current) return;
    if (seenBefore()) {
      setSkip(true);
      router.replace('/shop');
      return;
    }
    shown.current = true;
    try {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      // storage blocked: the intro just shows every time
    }
  }, [router]);

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

  if (skip) return null;

  // The band · designer · rap · skate · archive list is gone; "love you all." stays (v5).
  const love = (
    <div className={styles.bottom}>
      <p className={styles.love}>love you all.</p>
    </div>
  );

  return (
    <div className={`ipanel ${go ? 'is-go' : ''} ${styles.panel}`}>
      {/* Mobile: logo, then the line with the icon at its right end, centred; "love you all." at the bottom right (client request: lower than the v5 board's 92px). */}
      <div className={`m-only ${styles.mobile}`}>
        <h1 className={styles.h1}>
          <Link href="/shop" className={`ienter ${styles.enter} ${styles.enterMobile}`} aria-label="ARCHIVIN, enter the shop" onClick={enter}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/archivin-stitch-black.svg" alt="" width={330} height={77} className={styles.logoMobile} />
            <span className={styles.lineMobile}>
              <span className={styles.tagline}>selected vintage clothing.</span>
              <ExitDoorIcon size="mobile" />
            </span>
          </Link>
        </h1>
        <div className={styles.listMobile}>{love}</div>
      </div>

      {/* Desktop: logo with the icon 28px to its right (bottoms aligned), the line 40px below; "love you all." at the bottom. */}
      <div className={`d-only ${styles.desktop}`}>
        <div aria-hidden="true" className={styles.spaceTop} />
        <h1 className={styles.h1}>
          <Link href="/shop" className={`ienter ${styles.enter} ${styles.enterDesktop}`} aria-label="ARCHIVIN, enter the shop" onClick={enter}>
            <span className={styles.logoRow}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo/archivin-stitch-black.svg" alt="" width={800} height={186} className={styles.logoDesktop} />
              <ExitDoorIcon size="desktop" />
            </span>
            <span className={styles.taglineDesktop}>selected vintage clothing.</span>
          </Link>
        </h1>
        <div aria-hidden="true" className={styles.spaceMid} />
        {love}
      </div>
    </div>
  );
}
