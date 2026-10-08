'use client';

import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import styles from '../lookbook.module.css';

export type LookView = {
  label: string;
  photo: string | null;
  pieces: { name: string; href: string | null; sold: boolean }[];
};

/**
 * `.look` figures (README 8-13 · 9). Looks already on screen stay put; only the ones below the fold
 * get `.is-wait` and fade in once when 15% of them scrolls into view (A21_LookbookIssue script).
 */
export function Looks({ looks }: { looks: LookView[] }) {
  const figs = useRef<(HTMLElement | null)[]>([]);
  const [wait, setWait] = useState<number[]>([]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const els = figs.current;
    const below = els.map((el, i) => (el && el.getBoundingClientRect().top > window.innerHeight ? i : -1)).filter((i) => i >= 0);
    if (!below.length) return;
    setWait(below);
    const io = new IntersectionObserver(
      (entries) => {
        const shown = entries.filter((e) => e.isIntersecting).map((e) => els.indexOf(e.target as HTMLElement));
        if (!shown.length) return;
        shown.forEach((i) => io.unobserve(els[i]!));
        setWait((w) => w.filter((i) => !shown.includes(i)));
      },
      { threshold: 0.15 },
    );
    below.forEach((i) => io.observe(els[i]!));
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.looks}>
      {looks.map((look, i) => (
        <figure
          key={look.label}
          ref={(el) => {
            figs.current[i] = el;
          }}
          className={`${styles.look} ${wait.includes(i) ? styles.isWait : ''}`}
        >
          {/* TODO(client): look photos (3:4). Swap for <img> with a meaningful alt when they arrive. */}
          {look.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={look.photo} alt={look.label} className={styles.photo34} />
          ) : (
            <div role="img" aria-label={`${look.label} · 3:4`} className={`${styles.well} ${styles.photo34}`}>
              [{look.label} · 3:4]
            </div>
          )}
          <figcaption className={styles.caption}>
            {look.label}
            {look.pieces.length > 0 && ' · in this look: '}
            {look.pieces.map((p, j) => (
              <Fragment key={j}>
                {j > 0 && ' · '}
                {p.href ? (
                  <Link href={p.href} className={styles.captionLink}>
                    {p.name}
                  </Link>
                ) : (
                  <span className={styles.captionName}>{p.name}</span>
                )}
                {p.sold && ' (sold)'}
              </Fragment>
            ))}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
