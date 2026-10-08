'use client';

import Link from 'next/link';
import { useRef, type CSSProperties } from 'react';
import { useSignedIn } from '@/lib/auth';
import { site } from '@/lib/catalog';
import { CATEGORY_VIEWS, viewHref } from '@/lib/shop';
import { useModal } from '@/lib/useModal';
import { Logo } from '../Header/Logo';
import styles from './Menu.module.css';

type MenuLink = { label: string; href: string; external?: boolean; gapBefore?: boolean };

// Rise delays from A21_Header / A21_DShop: shop 0.12s, categories 0.22s + 0.03s each, about group 0.50s + 0.03s,
// sign in / my page 0.65s, heart 0.71s (v5).
const SHOP: MenuLink[] = [{ label: 'shop', href: '/shop' }];
const CATS: MenuLink[] = CATEGORY_VIEWS.filter((v) => v.label !== 'all').map((v) => ({
  label: v.label,
  href: viewHref(v),
  gapBefore: v.gapBefore,
}));
const ABOUT: MenuLink[] = [
  { label: 'about', href: '/about' },
  { label: 'lookbook', href: '/lookbook' },
  { label: 'notice', href: '/notice' },
  { label: 'reviews', href: '/reviews' },
  // TODO: Instagram URL (README 12) — data/site.json links.instagram.
  { label: 'instagram', href: site.links.instagram, external: true },
];

const rise = (s: number) => ({ animationDelay: `${s.toFixed(2)}s` }) as CSSProperties;

/**
 * Menu (README 8-5). Mobile: full-screen white overlay with the header row (logo · close), a 1px rule,
 * then three groups of links and the heart. Desktop: 400px drawer from the right over a scrim.
 * Always mounted so it can fade / slide; closed → visibility hidden + aria-hidden.
 */
export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const signedIn = useSignedIn();
  const account: MenuLink[] = [signedIn ? { label: 'my page', href: '/mypage' } : { label: 'sign in', href: '/signin' }];
  useModal(open, panel, onClose);

  const group = (links: MenuLink[], start: number, sub = false) => (
    <ul className={sub ? styles.sub : styles.group}>
      {links.map((l, i) => (
        <li key={l.label} className={`${styles.li} ${l.gapBefore ? styles.gap : ''}`} style={rise(start + i * 0.03)}>
          {l.external ? (
            <a href={l.href} className={styles.link} onClick={onClose}>
              {l.label}
            </a>
          ) : (
            <Link href={l.href} className={styles.link} onClick={onClose}>
              {l.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`${styles.root} ${open ? styles.open : ''}`} aria-hidden={!open}>
      <button type="button" tabIndex={-1} aria-label="Close menu" className={styles.scrim} onClick={onClose} />
      <div ref={panel} role="dialog" aria-modal="true" aria-label="Menu" className={styles.panel}>
        <div className={styles.top}>
          <span className={styles.topLogo}>
            <Logo size="mobile" onClick={onClose} />
          </span>
          <button type="button" className={styles.close} onClick={onClose}>
            close
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
              <path d="M1 1l8 8M9 1L1 9" />
            </svg>
          </button>
        </div>
        <div aria-hidden="true" className={styles.rule} />
        <nav aria-label="Menu" className={styles.nav}>
          {group(SHOP, 0.12)}
          <div aria-hidden="true" className={styles.space} />
          {group(CATS, 0.22)}
          <div aria-hidden="true" className={styles.space} />
          {group(ABOUT, 0.5, true)}
          <div aria-hidden="true" className={styles.space} />
          {group(account, 0.65, true)}
          <p className={`${styles.li} ${styles.love}`} style={rise(0.71)}>
            <svg className={styles.heart} width="20" height="18" viewBox="0 0 20 18" aria-hidden="true">
              <path d="M10 16.4C5.2 12.7 1.6 9.7 1.6 6 1.6 3.5 3.5 1.6 5.9 1.6c1.7 0 3.2 0.9 4.1 2.3 0.9-1.4 2.4-2.3 4.1-2.3 2.4 0 4.3 1.9 4.3 4.4 0 3.7-3.6 6.7-8.4 10.4z" />
            </svg>
            love you all.
          </p>
        </nav>
      </div>
    </div>
  );
}
