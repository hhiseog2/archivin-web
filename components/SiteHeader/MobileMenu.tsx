'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { CATEGORIES, shopHref, site } from '@/lib/catalog';
import { CloseIcon } from '../Icons';
import styles from './MobileMenu.module.css';

/** Full-screen mobile menu (design/mobile/Menu). Esc or the X closes it; focus stays inside while open. */
export function MobileMenu({ bagCount, onClose }: { bagCount: number; onClose: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    closeBtn.current?.focus();
    document.body.classList.add('menu-open');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialog.current) return;
      const focusables = dialog.current.querySelectorAll<HTMLElement>('a[href], button');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
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
    };
  }, []);

  return (
    <div ref={dialog} role="dialog" aria-modal="true" aria-label="Menu" className={`${styles.menu} m-only`}>
      <div className={styles.top}>
        <Link href="/" aria-label="ARCHIVIN home" className={styles.wordmark} onClick={onClose}>
          ARCHIVIN
        </Link>
        <button ref={closeBtn} type="button" aria-label="Close menu" className={styles.close} onClick={onClose}>
          <CloseIcon />
        </button>
      </div>

      <nav aria-label="Main" className={styles.nav}>
        <h2 className={styles.group}>Shop</h2>
        <ul className={styles.list}>
          {CATEGORIES.map((c) => (
            <li key={c.key}>
              <Link href={shopHref(c.key)} onClick={onClose}>
                {c.label}
              </Link>
            </li>
          ))}
        </ul>

        <h2 className={styles.group}>Info</h2>
        <ul className={styles.list}>
          <li><Link href="/lookbook/1" onClick={onClose}>Lookbook</Link></li>
          <li><Link href="/about" onClick={onClose}>About us</Link></li>
          <li><Link href="/notice" onClick={onClose}>Notice</Link></li>
          <li><Link href="/reviews" onClick={onClose}>Reviews</Link></li>
        </ul>

        <h2 className={styles.group}>Account</h2>
        <ul className={styles.list}>
          <li><Link href="/signin" onClick={onClose}>Sign in</Link></li>
          <li><Link href="/mypage" onClick={onClose}>My page</Link></li>
          <li><Link href="/bag" onClick={onClose}>Bag ({bagCount})</Link></li>
        </ul>
      </nav>

      <div className={styles.spacer} />
      <div className={styles.store}>
        <span className={styles.storeTitle}>Store · Haebangchon</span>
        <span className={styles.storeInfo}>
          {site.store.addressEn}
          <br />
          {site.store.hoursLine}
        </span>
        {/* TODO: Instagram handle / URL (data/site.json links.instagram) */}
        <a href={site.links.instagram} className={styles.insta}>
          Instagram
        </a>
      </div>
    </div>
  );
}
