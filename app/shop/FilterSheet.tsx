'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { CloseIcon } from '@/components/Icons';
import ui from '@/components/ui.module.css';
import styles from './shop.module.css';

/** Mobile bottom sheet with size / era / hide-sold filters. Esc, backdrop or X closes. */
export function FilterSheet({
  onClose,
  onReset,
  renderFields,
  resultCount,
}: {
  onClose: () => void;
  onReset: () => void;
  renderFields: () => ReactNode;
  resultCount: number;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    document.body.classList.add('menu-open');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !sheet.current) return;
      const f = sheet.current.querySelectorAll<HTMLElement>('button, input');
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('menu-open');
      opener?.focus();
    };
  }, []);

  return (
    <div className={`m-only ${styles.sheetLayer}`}>
      <button type="button" aria-label="Close filter" tabIndex={-1} className={styles.backdrop} onClick={onClose} />
      <div ref={sheet} role="dialog" aria-modal="true" aria-labelledby="filter-title" className={styles.sheet}>
        <div className={styles.sheetHead}>
          <h2 id="filter-title" className={styles.sheetTitle}>
            Filter
          </h2>
          <button ref={closeBtn} type="button" aria-label="Close" className={styles.sheetClose} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        {renderFields()}
        <div className={styles.sheetActions}>
          <button type="button" className={styles.resetBtn} onClick={onReset}>
            Reset
          </button>
          <button type="button" className={`${ui.btnPrimary} ${styles.showBtn}`} onClick={onClose}>
            Show results{resultCount ? ` (${resultCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
