'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { setPopup } from '@/lib/popups';
import { goShop, parseShopQuery, shopHref } from '@/lib/shop';
import styles from './SearchField.module.css';

/**
 * "search" that opens in place (README 8-2). The 13px button fades out, the field fades in at the same x,
 * with a 1px ink-2 line under it (1.5px ink while focused — that's the focus indicator) and a 40×44 ×.
 * On /shop every keystroke filters the list and lands in `?q=`. × or Esc clears and closes.
 * Mobile draws the input at 16px scaled to 0.8125 so iOS doesn't zoom on focus.
 */
export function SearchField({ variant }: { variant: 'mobile' | 'desktop' }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const onShop = pathname === '/shop';
  const urlQ = onShop ? (params.get('q') ?? '') : '';

  const [open, setOpen] = useState(urlQ !== '');
  const [value, setValue] = useState(urlQ);
  const input = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const fieldId = useId();

  // Follow the URL when something else changes it (e.g. "see all pieces" clears the search).
  useEffect(() => {
    setValue((v) => (v === urlQ ? v : urlQ));
    if (urlQ) setOpen(true);
  }, [urlQ]);

  // Focus moves only on the user's open / close (not when a page loads with ?q= already set).
  const focusSoon = (el: { current: HTMLElement | null }) => requestAnimationFrame(() => el.current?.focus({ preventScroll: true }));

  const write = (q: string) => {
    if (!onShop) return; // other pages search on Enter
    goShop(shopHref({ ...parseShopQuery(params), q }), { onShop: true, replace: true, push: router.push });
  };

  const close = () => {
    setOpen(false);
    focusSoon(button);
    setValue('');
    if (urlQ) write('');
  };

  return (
    <div className={`${styles.wrap} ${variant === 'desktop' ? styles.desktop : styles.mobile} ${open ? styles.open : ''}`}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={fieldId}
        className={styles.openBtn}
        onClick={() => {
          setPopup(null);
          setOpen(true);
          focusSoon(input);
        }}
      >
        search
      </button>
      <div id={fieldId} role="search" className={styles.field}>
        <span className={styles.clip}>
          <input
            ref={input}
            type="search"
            value={value}
            placeholder="search pieces"
            aria-label="Search pieces"
            autoComplete="off"
            tabIndex={open ? 0 : -1}
            className={styles.input}
            onChange={(e) => {
              setValue(e.target.value);
              write(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                close();
              } else if (e.key === 'Enter' && !onShop && value.trim()) {
                // Other pages (DHeader, v5): Enter opens the shop filtered by the search.
                router.push(shopHref({ q: value.trim() }));
              }
            }}
          />
        </span>
        <button type="button" aria-label="Close search" tabIndex={open ? 0 : -1} className={styles.close} onClick={close}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
            <path d="M1 1l8 8M9 1L1 9" />
          </svg>
        </button>
        <span className={styles.line} aria-hidden="true" />
      </div>
    </div>
  );
}
