'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Caret, Check } from '../Icons';
import { CATEGORY_VIEWS, currentViewLabel, EMPTY_QUERY, isView, parseShopQuery, queryForView, shopHref } from '@/lib/shop';
import styles from './CategoryMenu.module.css';

/**
 * "all ▾" category dropdown (README 5, 8-2). On /shop it reflects and changes the current view;
 * on other pages (desktop header) it just opens the shop on the picked view.
 */
export function CategoryMenu({ variant }: { variant: 'mobile' | 'desktop' }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const onShop = pathname === '/shop';
  const query = onShop ? parseShopQuery(params) : null;

  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    (list.current?.querySelector<HTMLElement>('[aria-selected="true"]') ?? list.current?.querySelector<HTMLElement>('button'))?.focus();
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
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

  const onListKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...(list.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
  };

  // TODO(design): off the shop the desktop header has no design for this label; "shop" with nothing checked.
  const label = query ? currentViewLabel(query) : 'shop';

  return (
    <div ref={wrap} className={styles.wrap}>
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Category: ${label}`}
        className={styles.toggle}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <Caret />
      </button>
      {open && (
        <div
          ref={list}
          role="listbox"
          aria-label="Category"
          className={`${styles.list} ${variant === 'desktop' ? styles.listDesktop : styles.listMobile}`}
          onKeyDown={onListKey}
        >
          {CATEGORY_VIEWS.map((v) => {
            const selected = query ? isView(v, query) : false;
            return (
              <button
                key={v.label}
                type="button"
                role="option"
                aria-selected={selected}
                className={`${styles.option} ${v.gapBefore ? styles.gap : ''}`}
                onClick={() => {
                  setOpen(false);
                  button.current?.focus();
                  router.push(shopHref(queryForView(v, query ?? EMPTY_QUERY)), { scroll: !onShop });
                }}
              >
                {v.label}
                {selected && <Check />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Server-render stand-in while search params load (same look, no menu). */
export function CategoryMenuFallback({ label }: { label: string }) {
  return (
    <div className={styles.wrap}>
      <button type="button" aria-haspopup="listbox" aria-expanded={false} aria-label={`Category: ${label}`} className={styles.toggle}>
        {label}
        <Caret />
      </button>
    </div>
  );
}
