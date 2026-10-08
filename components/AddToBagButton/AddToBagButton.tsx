'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { signInHref, useCanSeePrices } from '@/lib/auth';
import { addToBag, useBag } from '@/lib/cart';
import { site } from '@/lib/catalog';
import styles from './AddToBagButton.module.css';

/**
 * Loop centred at (11, 11), r 9: from 8 o'clock clockwise almost all the way round (330°) to 7 o'clock,
 * where an arrowhead finishes the last stitch (client sketch).
 */
const LOOP = 'M3.21 15.5 A9 9 0 1 1 6.5 18.79';
/** Chevron on the loop's end, pointing along the stitching direction (tip at the end point). */
const ARROW = 'M8.19 22.42 L6.5 18.79 L10.48 18.44';
/** Stitch time (0.64s, `sewloop` in the CSS) plus a beat to see the finished loop and its arrow. */
const SEW_MS = 760;

type Props = {
  id: string;
  sold: boolean;
  /** Signed out: the sign-in pill comes back here ("/product/3608"). */
  returnTo: string;
  /** Href of the "more like this" list (sold pieces). */
  moreHref: string;
  /** Desktop scrolls the list 32px from the top; without it the link is a plain jump. */
  onMore?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * "add to bag" (README 8-3). Tapping it hides the label and sews a small white thread loop in the middle
 * of the pill, one stitch at a time, finishing in an arrowhead ("adding to bag", aria-busy); then it becomes "it's yours · view bag",
 * the header count goes up and the bag ring re-sews. One of one, so it can't be added twice.
 * Reduced motion skips the stitch.
 *
 * The loading stitch is a client request on top of v4, which had dropped v3's loading (CHANGES_v3_to_v4 5).
 * It uses the bag ring's trick: a dashed path plus a navy cover that sweeps off it in steps.
 * TODO(backend): when adding goes through a server, wait for the request here as well as the stitch,
 * and on failure go back to "add to bag" and say why (e.g. the piece just sold).
 *
 * Sold (v5): a disabled fill "sold" pill + a "more like this" text link to the list below.
 * Signed out with members-only prices (v5): "sign in to see the price" pill → /signin?next=<this page>
 * + "new here? …" — signed-out visitors can't add. Sold wins over signed out.
 */
export function AddToBagButton({ id, sold, returnTo, moreHref, onMore }: Props) {
  const inBag = useBag().includes(id);
  const canSeePrices = useCanSeePrices();
  const [adding, setAdding] = useState(false);
  const [status, setStatus] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const add = () => {
    if (adding) return;
    const done = () => {
      addToBag(id);
      setAdding(false);
      setStatus("added to bag. it's yours.");
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      done();
      return;
    }
    setAdding(true);
    setStatus('adding to bag.');
    timer.current = setTimeout(done, SEW_MS);
  };

  let control;
  if (sold) {
    control = (
      <>
        <button type="button" disabled className={`${styles.pill} ${styles.off}`}>
          sold
        </button>
        <a href={moreHref} className={styles.more} onClick={onMore}>
          more like this
        </a>
      </>
    );
  } else if (!canSeePrices) {
    control = (
      <>
        <Link href={signInHref(returnTo)} className={`${styles.pill} ${styles.navy}`}>
          {site.pricing.signedOutButton}
        </Link>
        <p className={styles.help}>{site.pricing.signedOutHelp}</p>
      </>
    );
  } else if (inBag && !adding) {
    control = (
      <Link href="/bag" aria-label="it's yours. view bag" className={`${styles.pill} ${styles.fill}`}>
        it&apos;s yours · view bag
      </Link>
    );
  } else {
    control = (
      <button
        type="button"
        aria-busy={adding}
        aria-disabled={adding}
        className={`${styles.pill} ${styles.navy} ${adding ? styles.adding : ''}`}
        onClick={add}
      >
        {/* Thread loop sewn stitch by stitch, clockwise from 8 o'clock all the way round; the end becomes an arrow. */}
        <svg className={styles.stitch} width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
          <path className={styles.thread} d={LOOP} />
          <path className={styles.cover} d={LOOP} pathLength={100} />
          <path className={styles.arrow} d={ARROW} />
        </svg>
        <span className={styles.label}>{adding ? <span className="visually-hidden">adding to bag</span> : 'add to bag'}</span>
      </button>
    );
  }

  return (
    <>
      {control}
      <p role="status" className="visually-hidden">
        {status}
      </p>
    </>
  );
}
