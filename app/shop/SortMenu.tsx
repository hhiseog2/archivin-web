'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, ChevronDown } from '@/components/Icons';
import styles from './shop.module.css';

export type SortKey = 'new' | 'price-asc' | 'price-desc';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'new', label: 'New in' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
];

/** "Sort: New in ▾" dropdown. Esc or a click outside closes it. */
export function SortMenu({
  value,
  onChange,
  variant,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
  variant: 'mobile' | 'desktop';
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const label = SORTS.find((s) => s.key === value)!.label;

  useEffect(() => {
    if (!open) return;
    wrap.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className={variant === 'desktop' ? styles.sortWrapD : styles.sortWrapM}>
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${styles.toolBtn} ${variant === 'desktop' ? styles.sortBtnD : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        Sort: {label}
        <ChevronDown />
      </button>
      {open && (
        <div role="listbox" aria-label="Sort" className={variant === 'desktop' ? styles.sortListD : styles.sortListM}>
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              role="option"
              aria-selected={s.key === value}
              className={styles.sortOption}
              onClick={() => {
                onChange(s.key);
                setOpen(false);
                button.current?.focus();
              }}
            >
              {s.label}
              {s.key === value && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
