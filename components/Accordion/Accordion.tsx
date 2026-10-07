'use client';

import { useId, useState, type ReactNode } from 'react';
import { DownArrow } from '../Icons';
import styles from './Accordion.module.css';

/**
 * Product info row (README 8-3): 48px, 14px title with a ↓ right beside it.
 * Starts closed; the arrow turns to ↑ over 0.2s. Rows open independently.
 */
export function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <>
      <h2 className={styles.heading}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          className={styles.button}
          onClick={() => setOpen((v) => !v)}
        >
          {title}
          <DownArrow className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`} />
        </button>
      </h2>
      <div id={panelId} hidden={!open} className={styles.panel}>
        {children}
      </div>
    </>
  );
}
