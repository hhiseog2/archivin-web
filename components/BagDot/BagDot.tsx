'use client';

import { useEffect, useRef, useState } from 'react';
import { useAddSeq } from '@/lib/cart';
import styles from './BagDot.module.css';

/**
 * Bag count ring (stitch ②, README 5). 22×22 SVG dashed circle with the count inside (empty when 0).
 * Hover / focus on the bag link turns it into a filled rounded square — those rules live on the parent
 * (BagNav.module.css, via the data attributes). When a piece is added in this tab the ring re-sews once from 12 o'clock
 * (stitch ③): `sew1` / `sew2` alternate so the animation replays every time.
 */
export function BagDot({ count }: { count: number }) {
  const adds = useAddSeq();
  const [sew, setSew] = useState<0 | 1 | 2>(0);
  const seen = useRef(adds);

  useEffect(() => {
    if (adds > seen.current) setSew((s) => (s === 1 ? 2 : 1));
    seen.current = adds;
  }, [adds]);

  return (
    <span className={`${styles.dot} ${sew ? styles[`sew${sew}`] : ''}`} data-bagdot="" aria-hidden="true">
      <svg className={styles.ring} data-bagring="" viewBox="0 0 22 22" aria-hidden="true">
        <circle className={styles.rs} cx="11" cy="11" r="10.375" />
        <circle className={styles.rc} cx="11" cy="11" r="10.375" pathLength={100} />
      </svg>
      <b className={styles.num}>{count > 0 ? count : ''}</b>
    </span>
  );
}
