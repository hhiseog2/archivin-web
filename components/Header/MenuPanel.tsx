'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { catalog, site } from '@/lib/catalog';
import { useModal } from '@/lib/useModal';
import styles from './menu.module.css';

/**
 * TODO(design): no design yet for the menu (README 8-5). Full-screen white panel, "close" top right,
 * three groups of lowercase 18px links. Esc or any link closes it; focus stays inside while open.
 */
export function MenuPanel({ onClose }: { onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useModal(panel, onClose);

  // TODO: the intro categories (band · designer · rap · skate · archive) have no shop view or product tags yet (README 11).
  const groups: { label: string; links: { label: string; href: string; external?: boolean }[] }[] = [
    { label: 'Shop', links: [{ label: 'shop', href: '/shop' }] },
    { label: 'Categories', links: catalog.introCategories.map((c) => ({ label: c, href: '/shop' })) },
    {
      label: 'About',
      links: [
        { label: 'about', href: '/about' },
        { label: 'lookbook', href: '/lookbook/1' },
        { label: 'notice', href: '/notice' },
        { label: 'reviews', href: '/reviews' },
        { label: 'instagram', href: site.links.instagram, external: true },
      ],
    },
  ];

  return (
    <div ref={panel} role="dialog" aria-modal="true" aria-label="Menu" className={styles.panel}>
      <div className={styles.top}>
        <button type="button" className={styles.close} onClick={onClose}>
          close
        </button>
      </div>
      <nav aria-label="Menu" className={styles.groups}>
        {groups.map((g) => (
          <ul key={g.label} aria-label={g.label} className={styles.group}>
            {g.links.map((l) => (
              <li key={l.label}>
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
        ))}
      </nav>
    </div>
  );
}
