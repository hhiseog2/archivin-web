'use client';

import { useState, type ReactNode } from 'react';
import { MinusIcon, PlusIcon } from '@/components/Icons';
import ui from '@/components/ui.module.css';
import styles from './notice.module.css';

type Item = { id: string; title: string; lang: string; pinned: boolean; date: string; body: ReactNode };

/** Desktop notice list: each row opens in place. Several can be open at once. */
export function NoticeAccordion({ items, initialOpen, className }: { items: Item[]; initialOpen?: string; className?: string }) {
  const [open, setOpen] = useState<string[]>(initialOpen ? [initialOpen] : []);
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  return (
    <ul className={`${styles.list} ${className ?? ''}`}>
      {items.map((n) => {
        const isOpen = open.includes(n.id);
        return (
          <li key={n.id} className={styles.item}>
            <h2 className={styles.accH}>
              <button
                type="button"
                className={styles.accBtn}
                aria-expanded={isOpen}
                aria-controls={`n-${n.id}`}
                onClick={() => toggle(n.id)}
              >
                {n.pinned && <span className={ui.tag}>PINNED</span>}
                <span lang={n.lang} className={`${styles.accTitle} ${n.pinned ? styles.bold : ''} ${n.lang === 'ko' ? styles.ko : ''}`}>
                  {n.title}
                </span>
                <span className={styles.date}>{n.date}</span>
                <span aria-hidden="true" className={styles.accIcon}>
                  {isOpen ? <MinusIcon /> : <PlusIcon />}
                </span>
              </button>
            </h2>
            <div id={`n-${n.id}`} hidden={!isOpen} className={styles.accPanel}>
              {n.body}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
