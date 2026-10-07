'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BagDot } from '../BagDot/BagDot';
import { BagPreview } from '../BagPreview/BagPreview';
import { useBag } from '@/lib/cart';
import styles from './BagNav.module.css';

/**
 * "bag" + count ring, with the preview underneath (README 5, 8-5).
 * Aria: "Bag, empty" / "Bag, 1 piece" / "Bag, 2 pieces". Text is always "bag".
 */
export function BagNav({ align }: { align: 'mobile' | 'desktop' }) {
  const ids = useBag();
  const n = ids.length;
  // The preview is optional on the bag page itself (README 8-5) — it's off there.
  const preview = usePathname() !== '/bag';
  const aria = n > 0 ? `Bag, ${n} ${n === 1 ? 'piece' : 'pieces'}` : 'Bag, empty';

  return (
    <div className={styles.wrap}>
      <Link href="/bag" aria-label={aria} className={styles.link}>
        bag
        <BagDot count={n} />
      </Link>
      {preview && (
        <div className={`${styles.peek} ${align === 'desktop' ? styles.peekDesktop : styles.peekMobile}`}>
          <BagPreview ids={ids} />
        </div>
      )}
    </div>
  );
}
