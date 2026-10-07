'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { Check } from '../Popup/Check';
import { arrowKeys, usePopupBehavior } from '../Popup/usePopupBehavior';
import popup from '../Popup/Popup.module.css';
import { catalog } from '@/lib/catalog';
import { setPopup, usePopup } from '@/lib/popups';
import { goShop, parseShopQuery, shopHref } from '@/lib/shop';
import styles from './SortMenu.module.css';

/**
 * "sort" (README 8-2): new in / price low–high / price high–low (one), a 1px rule, then include sold.
 * Picking a sort applies and closes; include sold toggles and stays open. Shop page only.
 */
export function SortMenu() {
  const params = useSearchParams();
  const query = parseShopQuery(params);
  const open = usePopup() === 'sort';
  const [fromKeyboard, setFromKeyboard] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setPopup(null), []);
  usePopupBehavior(open, close, wrap, trigger, list, fromKeyboard);

  const go = (href: string) => goShop(href, { onShop: true, push: () => {} });

  return (
    <div ref={wrap} className={styles.wrap}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        className={popup.trigger}
        onClick={(e) => {
          setFromKeyboard(e.detail === 0);
          setPopup(open ? null : 'sort');
        }}
      >
        <span className={popup.ulbl}>sort</span>
      </button>
      <div
        ref={list}
        role="menu"
        aria-label="Sort"
        aria-hidden={!open}
        className={`${popup.pop} ${open ? popup.open : ''} ${styles.list}`}
        onKeyDown={arrowKeys}
      >
        {catalog.sorts.map((s) => {
          const on = query.sort === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="menuitemradio"
              aria-checked={on}
              tabIndex={open ? 0 : -1}
              className={popup.item}
              onClick={() => {
                close();
                trigger.current?.focus({ preventScroll: true });
                go(shopHref({ ...query, sort: s.id }));
              }}
            >
              <span className={popup.ulbl}>{s.label}</span>
              {on && <Check />}
            </button>
          );
        })}
        <div aria-hidden="true" className={popup.rule} />
        <button
          type="button"
          role="menuitemcheckbox"
          aria-checked={query.sold}
          tabIndex={open ? 0 : -1}
          className={popup.item}
          onClick={() => go(shopHref({ ...query, sold: !query.sold }))}
        >
          <span className={popup.ulbl}>include sold</span>
          <span className={popup.box}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ top: 0, left: 0 }}>
              <rect className={popup.cbox} x="1" y="1" width="14" height="14" rx="3" />
            </svg>
            {query.sold && <Check small />}
          </span>
        </button>
      </div>
    </div>
  );
}
