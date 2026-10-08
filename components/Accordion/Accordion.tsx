'use client';

import { useId, useState, type ReactNode } from 'react';
import styles from './Accordion.module.css';

export type AccordionItem = { title: ReactNode; content: ReactNode };

/**
 * Policy articles (README 8-15, A21_Policy `.arow` `.apanel`): rule above every row and below the list,
 * title button min 52px (14px / 1.5) with the InfoRow `+` / `−`, body 14px / 1.8 with 32px free on the right.
 * One open at a time, the first open to start. Opens with height 0fr → 1fr (0.4s) like InfoRow;
 * the closed panel is aria-hidden and its text hidden 0.4s after closing (README 11).
 */
export function Accordion({
  items,
  initialOpen = 0,
  lang,
  className,
}: {
  items: AccordionItem[];
  /** Index open on first render; -1 for none. */
  initialOpen?: number;
  lang?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(initialOpen);
  const base = useId();
  return (
    <div lang={lang} className={[styles.list, className].filter(Boolean).join(' ')}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${base}-${i}`;
        return (
          <div key={i} className={styles.row}>
            <h2 className={styles.heading}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={styles.button}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                {item.title}
                <svg className={styles.pm} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M0.6 5h8.8" />
                  <path className={styles.v} d="M5 0.6v8.8" />
                </svg>
              </button>
            </h2>
            <div id={panelId} aria-hidden={!isOpen} className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
              <div className={styles.clip}>
                <div className={styles.body}>{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
