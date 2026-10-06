'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useBag } from '@/lib/cart';
import { SEARCH_SUGGESTIONS } from '@/lib/catalog';
import { BagIcon, SearchIcon } from '../Icons';
import styles from './DHeader.module.css';

export type NavKey = 'shop' | 'lookbook' | 'about' | 'notice' | 'reviews';

const NAV: { key: NavKey; label: string; href: string }[] = [
  { key: 'shop', label: 'Shop', href: '/shop' },
  { key: 'lookbook', label: 'Lookbook', href: '/lookbook/1' },
  { key: 'about', label: 'About', href: '/about' },
  { key: 'notice', label: 'Notice', href: '/notice' },
  { key: 'reviews', label: 'Reviews', href: '/reviews' },
];

type Props = {
  /** "film": transparent over the home video with light text. */
  tone?: 'paper' | 'film';
  /** Hide the wordmark (home: the big centred wordmark replaces it). */
  logo?: boolean;
  active?: NavKey;
  /** Open the search bar on first render (desktop /search). */
  initialSearchOpen?: boolean;
  initialQuery?: string;
};

/** Desktop header (72px). Search toggles a search bar right under the header. */
export function DHeader({ tone = 'paper', logo = true, active, initialSearchOpen = false, initialQuery = '' }: Props) {
  const bag = useBag();
  const router = useRouter();
  const [open, setOpen] = useState(initialSearchOpen);
  const [q, setQ] = useState(initialQuery);
  const input = useRef<HTMLInputElement>(null);
  const toggled = useRef(false);
  const film = tone === 'film';

  useEffect(() => {
    if (open && toggled.current) input.current?.focus();
  }, [open]);

  const submit = (term: string) => {
    const t = term.trim();
    router.push(t ? `/search?q=${encodeURIComponent(t)}` : '/search');
  };

  return (
    <div className={`${styles.wrap} ${film ? styles.film : ''}`}>
      <header className={styles.header}>
        <div className={styles.left}>
          {logo && (
            <Link href="/" aria-label="ARCHIVIN home" className={styles.wordmark}>
              ARCHIVIN
            </Link>
          )}
        </div>

        <nav aria-label="Main" className={styles.nav}>
          {NAV.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              aria-current={n.key === active ? 'page' : undefined}
              className={styles.navLink}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <button
            type="button"
            className={styles.action}
            aria-expanded={open}
            aria-controls="d-search"
            onClick={() => {
              toggled.current = true;
              setOpen((v) => !v);
            }}
          >
            <SearchIcon size={18} />
            Search
          </button>
          <Link href="/bag" aria-label={`Bag, ${bag.length} ${bag.length === 1 ? 'item' : 'items'}`} className={`${styles.action} ${styles.bag}`}>
            <BagIcon size={18} />
            <span aria-hidden="true">Bag ({bag.length})</span>
          </Link>
        </div>
      </header>

      {open && (
        <div id="d-search" className={styles.search}>
          <form
            role="search"
            className={styles.searchInner}
            onSubmit={(e) => {
              e.preventDefault();
              submit(q);
            }}
          >
            <label htmlFor="d-q" className={styles.searchLabel}>
              Search the shop
            </label>
            <div className={styles.searchBox}>
              <input
                ref={input}
                id="d-q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Artist, band, brand or era"
                autoComplete="off"
                className={styles.searchInput}
              />
              <button type="submit" aria-label="Search" className={styles.searchSubmit}>
                <SearchIcon size={20} />
              </button>
            </div>
            <div className={styles.suggest}>
              <span className={styles.try}>Try</span>
              {SEARCH_SUGGESTIONS.map((s) => (
                <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className={styles.suggestChip}>
                  {s}
                </Link>
              ))}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
