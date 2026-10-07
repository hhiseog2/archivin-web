'use client';

import { useState } from 'react';
import { MenuPanel } from './MenuPanel';
import styles from './header.module.css';

export function MenuButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-haspopup="dialog" aria-expanded={open} className={styles.navItem} onClick={() => setOpen(true)}>
        menu
      </button>
      {open && <MenuPanel onClose={() => setOpen(false)} />}
    </>
  );
}
