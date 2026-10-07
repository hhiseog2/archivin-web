'use client';

import { useId, useState, type ReactNode } from 'react';
import styles from './InfoRow.module.css';

/**
 * Product info row (README 8-3): the whole 48px row is the button, 14px title left, 10×10 + right.
 * Opens with height 0fr → 1fr (0.4s), content from 8px above, + turns to − (vertical stroke scaleY(0), 0.2s).
 * Hidden 0.4s after closing. Several can be open at once.
 */
export function InfoRow({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <>
      <h2 className={styles.heading}>
        <button type="button" aria-expanded={open} aria-controls={panelId} className={styles.button} onClick={() => setOpen((v) => !v)}>
          {title}
          <svg className={styles.pm} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M0.6 5h8.8" />
            <path className={styles.v} d="M5 0.6v8.8" />
          </svg>
        </button>
      </h2>
      <div id={panelId} aria-hidden={!open} className={`${styles.panel} ${open ? styles.open : ''}`}>
        <div className={styles.clip}>
          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </>
  );
}
