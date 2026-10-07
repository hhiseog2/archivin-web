'use client';

import { useState } from 'react';
import { setPopup } from '@/lib/popups';
import { Menu } from '../Menu/Menu';
import styles from './header.module.css';

/** "menu" in the header. Opening it closes the shop popups (README 8-2). Focus returns here on close. */
export function MenuButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={styles.navItem}
        onClick={() => {
          setPopup(null);
          setOpen(true);
        }}
      >
        menu
      </button>
      <Menu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
