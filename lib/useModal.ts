'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Modal behaviour for the menu (README 8-5, 11): while `open`, focus moves inside, Tab stays inside,
 * Esc closes, page scroll locks; on close, focus goes back to whatever opened it.
 * The panel stays mounted (for its open/close transition), so this keys off `open`.
 */
export function useModal(open: boolean, panel: RefObject<HTMLElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    // Wait a frame so the panel is visible (visibility flips with the open class) before focusing.
    const raf = requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true }));
    document.body.classList.add('scroll-locked');

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !panel.current.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('scroll-locked');
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, panel]);
}
