'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import popup from '../Popup/Popup.module.css';
import { SizeChip } from '../SizeChip/SizeChip';
import { catalog } from '@/lib/catalog';
import { setPopup, usePopup } from '@/lib/popups';
import { EMPTY_SIZE, hasRelevantSize, normalizeSize, sizeButtonLabel, sizeGroupsFor, type ShopQuery, type SizeGroup, type SizePick } from '@/lib/shop';
import styles from './SizeMenu.module.css';

const GROUPS: Record<SizeGroup, { title: string; key: keyof SizePick; values: (string | number)[] }> = {
  letters: { title: 'clothing', key: 'size', values: catalog.size.letters },
  waistInch: { title: 'waist · inch', key: 'waist', values: catalog.size.waistInch },
  shoesMm: { title: 'shoes · mm', key: 'shoe', values: catalog.size.shoesMm },
};

/**
 * `size` button + size window (README 8-2, A21_Shop / A21_DShop). Non-modal `role="dialog"`, 300px.
 * Chips filter straight away and the window stays open; the button, Esc or a click outside closes it
 * and focus goes back to the button. Opening it closes "all ▾" / sort but leaves the search open.
 * Hidden on views without size groups (accessories).
 */
export function SizeMenu({
  query,
  variant,
  onChange,
}: {
  query: ShopQuery;
  variant: 'mobile' | 'desktop';
  /** New picks (all three groups); the caller writes the URL and the device memory. */
  onChange: (next: SizePick) => void;
}) {
  const groups = sizeGroupsFor(query);
  const store = usePopup();
  const open = store === 'size' && groups.length > 0;
  const [fromKeyboard, setFromKeyboard] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback((refocus: boolean) => {
    setPopup(null);
    if (refocus) trigger.current?.focus({ preventScroll: true });
  }, []);

  // Switching to a view without sizes hides the button: drop the open window with it.
  useEffect(() => {
    if (store === 'size' && !groups.length) setPopup(null);
  }, [store, groups.length]);

  useEffect(() => {
    // The shop renders a mobile and a desktop copy; only the one on screen listens.
    if (!open || !wrap.current || wrap.current.getClientRects().length === 0) return;
    if (fromKeyboard) {
      const first = dialog.current?.querySelector<HTMLElement>('button');
      requestAnimationFrame(() => first?.focus({ preventScroll: true }));
    }
    const onDown = (e: PointerEvent) => {
      if (wrap.current?.contains(e.target as Node)) return;
      // Focus was inside the window → hand it back to the button; otherwise let the click place it.
      close(!!wrap.current?.contains(document.activeElement));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, fromKeyboard]);

  if (!groups.length) return null;

  const pick: SizePick = { size: query.size, waist: query.waist, shoe: query.shoe };
  const flip = (key: keyof SizePick, v: string | number) => {
    const cur = pick[key] as (string | number)[];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    onChange(normalizeSize({ ...pick, [key]: next }));
  };
  const anySize = hasRelevantSize(query);

  return (
    <div ref={wrap} className={variant === 'mobile' ? styles.wrapMobile : styles.wrapDesktop}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-size`}
        className={`${popup.trigger} ${styles.trigger}`}
        onClick={(e) => {
          setFromKeyboard(e.detail === 0);
          setPopup(open ? null : 'size');
        }}
      >
        <span className={popup.ulbl}>{sizeButtonLabel(query)}</span>
      </button>
      <div
        ref={dialog}
        id={`${id}-size`}
        role="dialog"
        aria-label="Size"
        aria-hidden={!open}
        className={`${popup.pop} ${open ? popup.open : ''} ${styles.pop} ${variant === 'mobile' ? styles.mobile : styles.desktop}`}
      >
        {groups.map((g, i) => {
          const def = GROUPS[g];
          const values = pick[def.key] as (string | number)[];
          return (
            <div key={g}>
              <p id={`${id}-${g}`} className={`${styles.title} ${i > 0 ? styles.gap : ''}`}>
                {def.title}
              </p>
              <div role="group" aria-labelledby={`${id}-${g}`} className={styles.chips}>
                {def.values.map((v) => (
                  <SizeChip key={v} pressed={values.includes(v)} tabIndex={open ? 0 : -1} onClick={() => flip(def.key, v)}>
                    {v}
                  </SizeChip>
                ))}
              </div>
            </div>
          );
        })}
        <div aria-hidden="true" className={styles.rule} />
        <div className={styles.foot}>
          <p className={styles.help}>
            by fit, not tag size.
            <br />
            <span lang="ko" className={styles.ko}>
              태그 대신 추천 착용 사이즈 기준
            </span>
          </p>
          {anySize && (
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              className={styles.clear}
              onClick={() => {
                onChange(EMPTY_SIZE);
                // `clear` disappears with the picks: keep focus inside the window.
                dialog.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
              }}
            >
              clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
