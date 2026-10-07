'use client';

import { useEffect, type KeyboardEvent, type RefObject } from 'react';

/**
 * Shared by "all ▾" and sort (README 11): Esc or a click outside closes and returns focus to the trigger;
 * ↑ / ↓ move between items. `focusFirst` moves focus into the popup when it was opened from the keyboard.
 */
export function usePopupBehavior(
  open: boolean,
  close: () => void,
  wrap: RefObject<HTMLElement | null>,
  trigger: RefObject<HTMLButtonElement | null>,
  list: RefObject<HTMLElement | null>,
  focusFirst: boolean,
) {
  useEffect(() => {
    // The shop renders a mobile and a desktop copy; only the one on screen listens.
    if (!open || !wrap.current || wrap.current.getClientRects().length === 0) return;
    if (focusFirst) {
      const el = list.current?.querySelector<HTMLElement>('[aria-selected="true"], [aria-checked="true"]') ?? list.current?.querySelector('button');
      requestAnimationFrame(() => el?.focus({ preventScroll: true }));
    }
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        trigger.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, wrap, trigger, list, focusFirst]);
}

/** ↑ / ↓ between the popup's items. */
export function arrowKeys(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  e.preventDefault();
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>('button')];
  const i = items.indexOf(document.activeElement as HTMLElement);
  items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
}
