'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { addToBag, useBag } from '@/lib/cart';
import styles from './AddToBagButton.module.css';

/** Loop centred at (14, 11), r 9: 8 o'clock → clockwise (large arc) → 6 o'clock, then a 26-unit tail to the right. */
const LOOP = 'M6.21 15.5 A9 9 0 1 1 14 20 L40 20';
/** Stitch time (0.64s, `sewloop` in the CSS) plus a beat to see the finished loop. */
const SEW_MS = 760;

/**
 * "add to bag" (README 8-3). Tapping it hides the label and sews a small white thread loop in the middle
 * of the pill, one stitch at a time ("adding to bag", aria-busy); then it becomes "it's yours · view bag",
 * the header count goes up and the bag ring re-sews. One of one, so it can't be added twice.
 * Reduced motion skips the stitch.
 *
 * The loading stitch is a client request on top of v4, which had dropped v3's loading (CHANGES_v3_to_v4 5).
 * It uses the bag ring's trick: a dashed path plus a navy cover that sweeps off it in steps.
 * TODO: when adding goes through a server, wait for the request here as well as the stitch,
 * and on failure go back to "add to bag" and say why (e.g. the piece just sold).
 *
 * Sold pieces get a disabled "sold" pill instead — TODO(design): sold product page has no design (README 8-6).
 */
export function AddToBagButton({ id, sold }: { id: string; sold: boolean }) {
  const inBag = useBag().includes(id);
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

  return (
    <>
      {sold ? (
        <button type="button" disabled className={`${styles.pill} ${styles.off}`}>
          sold
        </button>
      ) : inBag && !adding ? (
        <Link href="/bag" aria-label="it's yours. view bag" className={`${styles.pill} ${styles.fill}`}>
          it&apos;s yours · view bag
        </Link>
      ) : (
        <button
          type="button"
          aria-busy={adding}
          aria-disabled={adding}
          className={`${styles.pill} ${styles.navy} ${adding ? styles.adding : ''}`}
          onClick={add}
        >
          {/* Thread loop sewn stitch by stitch: from 8 o'clock, clockwise over the top, round to 6 o'clock,
              then the thread trails off to the right (client sketch). */}
          <svg className={styles.stitch} width="44" height="26" viewBox="0 0 44 26" aria-hidden="true">
            <path className={styles.thread} d={LOOP} />
            <path className={styles.cover} d={LOOP} pathLength={100} />
          </svg>
          <span className={styles.label}>{adding ? <span className="visually-hidden">adding to bag</span> : 'add to bag'}</span>
        </button>
      )}
      <p role="status" className="visually-hidden">
        {status}
      </p>
    </>
  );
}
