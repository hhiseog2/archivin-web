'use client';

import Link from 'next/link';
import { useBag } from '@/lib/cart';
import styles from './header.module.css';

/** "bag" / "bag 2" (README 5). Aria: "Bag, empty" / "Bag, 1 piece" / "Bag, 2 pieces". */
export function BagLink() {
  const n = useBag().length;
  const aria = n > 0 ? `Bag, ${n} ${n === 1 ? 'piece' : 'pieces'}` : 'Bag, empty';
  return (
    <Link href="/bag" aria-label={aria} className={styles.navItem}>
      {n > 0 ? `bag ${n}` : 'bag'}
    </Link>
  );
}
