'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { Caret } from '../Icons';
import { Check } from '../Popup/Check';
import { arrowKeys, usePopupBehavior } from '../Popup/usePopupBehavior';
import popup from '../Popup/Popup.module.css';
import { setPopup, usePopup } from '@/lib/popups';
import { CATEGORY_VIEWS, currentViewLabel, goShop, isView, parseShopQuery, shopHref, viewHref } from '@/lib/shop';
import styles from './CategoryMenu.module.css';

/**
 * "all ▾" (README 8-2). Categories, then 16px gap and the brand shortcuts (all + brand).
 * Picking applies straight away and closes. On /shop it keeps sort, include sold and the search;
 * from other pages (desktop header) it just opens the shop on that view.
 */
export function CategoryMenu({ variant }: { variant: 'mobile' | 'desktop' }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const onShop = pathname === '/shop';
  // The intro draws the shop's first screen underneath itself, so "/" shows the plain shop view too.
  const query = onShop || pathname === '/' ? parseShopQuery(params) : null;

  const open = usePopup() === 'cat';
  const [fromKeyboard, setFromKeyboard] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setPopup(null), []);
  usePopupBehavior(open, close, wrap, trigger, list, fromKeyboard);

  // TODO(design): off the shop the header label has no design; "shop" with nothing checked.
  const label = query ? currentViewLabel(query) : 'shop';

  return (
    <div ref={wrap} className={styles.wrap}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Category: ${label}`}
        className={popup.trigger}
        onClick={(e) => {
          setFromKeyboard(e.detail === 0);
          setPopup(open ? null : 'cat');
        }}
      >
        <span className={popup.ulbl}>{label}</span>
        <Caret />
      </button>
      <div
        ref={list}
        role="listbox"
        aria-label="Category"
        aria-hidden={!open}
        className={`${popup.pop} ${open ? popup.open : ''} ${styles.list} ${variant === 'desktop' ? styles.desktop : styles.mobile}`}
        onKeyDown={arrowKeys}
      >
        {CATEGORY_VIEWS.map((v) => {
          const selected = query ? isView(v, query) : false;
          return (
            <button
              key={v.label}
              type="button"
              role="option"
              aria-selected={selected}
              tabIndex={open ? 0 : -1}
              className={`${popup.item} ${v.gapBefore ? styles.gap : ''}`}
              onClick={() => {
                close();
                trigger.current?.focus({ preventScroll: true });
                const href = query ? shopHref({ ...query, cat: v.cat, brands: v.brands }) : viewHref(v);
                goShop(href, { onShop, push: router.push });
              }}
            >
              <span className={popup.ulbl}>{v.label}</span>
              {selected && <Check />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Server-render stand-in while search params load (same look, no menu). */
export function CategoryMenuFallback({ label }: { label: string }) {
  return (
    <div className={styles.wrap}>
      <button type="button" aria-haspopup="listbox" aria-expanded={false} aria-label={`Category: ${label}`} className={popup.trigger}>
        <span className={popup.ulbl}>{label}</span>
        <Caret />
      </button>
    </div>
  );
}
