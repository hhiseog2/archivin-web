'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useId, useRef, useState } from 'react';
import { Caret } from '../Icons';
import { Check } from '../Popup/Check';
import { arrowKeys, usePopupBehavior } from '../Popup/usePopupBehavior';
import popup from '../Popup/Popup.module.css';
import { setPopup, usePopup } from '@/lib/popups';
import { CATEGORY_VIEWS, currentViewLabel, goShop, isView, parseShopQuery, viewHref } from '@/lib/shop';
import styles from './CategoryMenu.module.css';

/**
 * "all ▾" (README 8-2). Categories, then 16px gap and the brand shortcuts (all + brand).
 * Picking applies straight away and closes. On /shop it keeps sort, include sold and the search;
 * from other pages (desktop header) it just opens the shop on that view.
 */
export function CategoryMenu({ variant }: { variant: 'mobile' | 'desktop' }) {
  const pathname = usePathname();
  // Off the shop the desktop header shows "shop ▾" with plain links instead (A21_DHeader, v5).
  if (variant === 'desktop' && pathname !== '/shop' && pathname !== '/') return <ShopNavMenu />;
  return <ShopCategoryMenu variant={variant} />;
}

function ShopCategoryMenu({ variant }: { variant: 'mobile' | 'desktop' }) {
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

  const label = query ? currentViewLabel(query) : 'all';

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
                const href = query ? viewHref(v, query) : viewHref(v);
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

/**
 * "shop ▾" on desktop pages other than the shop (README 5 DHeader): same window as "all ▾" (220px, 40px rows),
 * but a <nav> of links to /shop?… — no listbox, no check marks.
 */
function ShopNavMenu() {
  const open = usePopup() === 'shopnav';
  const [fromKeyboard, setFromKeyboard] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLElement>(null);
  const close = useCallback(() => setPopup(null), []);
  usePopupBehavior(open, close, wrap, trigger, list, fromKeyboard);
  const navId = useId();

  return (
    <div ref={wrap} className={styles.wrap}>
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={navId}
        className={popup.trigger}
        onClick={(e) => {
          setFromKeyboard(e.detail === 0);
          setPopup(open ? null : 'shopnav');
        }}
      >
        <span className={popup.ulbl}>shop</span>
        <Caret />
      </button>
      <nav
        ref={list}
        id={navId}
        aria-label="Shop categories"
        aria-hidden={!open}
        className={`${popup.pop} ${open ? popup.open : ''} ${styles.list} ${styles.desktop}`}
        onKeyDown={arrowKeys}
      >
        <ul className={styles.navList}>
          {CATEGORY_VIEWS.map((v) => (
            <li key={v.label} className={v.gapBefore ? styles.gap : undefined}>
              <Link href={viewHref(v)} tabIndex={open ? 0 : -1} className={popup.item} onClick={close}>
                <span className={popup.ulbl}>{v.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
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
