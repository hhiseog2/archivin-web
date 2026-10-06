'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useBag } from '@/lib/cart';
import { BagIcon, MenuIcon, SearchIcon } from '../Icons';
import { MobileMenu } from './MobileMenu';
import styles from './SiteHeader.module.css';

/**
 * Mobile header (56px): wordmark left, Search · Menu · Bag(count) right.
 * `tone="film"` is the home variant that sits over the video: light icons, no wordmark, no search.
 */
export function SiteHeader({ tone = 'paper' }: { tone?: 'paper' | 'film' }) {
  const bag = useBag();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const film = tone === 'film';

  return (
    <>
      <header className={`${styles.header} ${film ? styles.film : ''}`}>
        {!film && (
          <Link href="/" aria-label="ARCHIVIN home" className={styles.wordmark}>
            ARCHIVIN
          </Link>
        )}
        <nav aria-label="Site" className={styles.icons}>
          {!film && (
            <Link href="/search" aria-label="Search" className={styles.iconBtn}>
              <SearchIcon />
            </Link>
          )}
          <button
            ref={menuButton}
            type="button"
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className={styles.iconBtn}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
          <Link href="/bag" aria-label={`Bag, ${bag.length} ${bag.length === 1 ? 'item' : 'items'}`} className={styles.bag}>
            <BagIcon />
            <span aria-hidden="true" className={styles.count}>
              {bag.length}
            </span>
          </Link>
        </nav>
      </header>
      {menuOpen && (
        <MobileMenu
          bagCount={bag.length}
          onClose={() => {
            setMenuOpen(false);
            menuButton.current?.focus();
          }}
        />
      )}
    </>
  );
}
