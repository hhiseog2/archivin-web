'use client';

import Link from 'next/link';
import { useState } from 'react';
import { addToBag, useBag } from '@/lib/cart';
import styles from './AddToBagButton.module.css';

/**
 * "add to bag" (README 8-3). No loading state: tapping swaps straight to "it's yours · view bag",
 * the header count goes up and the bag ring re-sews. One of one, so it can't be added twice.
 * Sold pieces get a disabled "sold" pill instead — TODO(design): sold product page has no design (README 8-6).
 */
export function AddToBagButton({ id, sold }: { id: string; sold: boolean }) {
  const inBag = useBag().includes(id);
  const [status, setStatus] = useState('');

  return (
    <>
      {sold ? (
        <button type="button" disabled className={`${styles.pill} ${styles.off}`}>
          sold
        </button>
      ) : inBag ? (
        <Link href="/bag" aria-label="it's yours. view bag" className={`${styles.pill} ${styles.fill}`}>
          it&apos;s yours · view bag
        </Link>
      ) : (
        <button
          type="button"
          className={`${styles.pill} ${styles.navy}`}
          onClick={() => {
            addToBag(id);
            setStatus("added to bag. it's yours.");
          }}
        >
          add to bag
        </button>
      )}
      <p role="status" className="visually-hidden">
        {status}
      </p>
    </>
  );
}
