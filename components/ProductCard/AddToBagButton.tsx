'use client';

import { addToBag, useBag } from '@/lib/cart';
import { CheckIcon, PlusIcon } from '../Icons';
import styles from './AddToBagButton.module.css';

/** The "+" on a shop tile. Adds the piece to the bag; shows a check once it's in. */
export function AddToBagButton({ id, name, onAdded }: { id: string; name: string; onAdded?: (name: string) => void }) {
  const bag = useBag();
  const added = bag.includes(id);
  return (
    <button
      type="button"
      className={styles.btn}
      aria-label={added ? `${name} is in your bag` : `Add ${name} to bag`}
      onClick={() => {
        if (added) return;
        addToBag(id);
        onAdded?.(name);
      }}
    >
      <span className={`${styles.box} ${added ? styles.added : ''}`}>{added ? <CheckIcon /> : <PlusIcon />}</span>
    </button>
  );
}
