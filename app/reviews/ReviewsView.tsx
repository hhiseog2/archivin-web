'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { signInHref, useSignedIn } from '@/lib/auth';
import { useMyReviews } from '@/lib/cart';
import { reviews, type Review } from '@/lib/catalog';
import { formatDate, maskName } from '@/lib/format';
import { Star } from './Star';
import styles from './reviews.module.css';

const TABS = ['all', 'with photos'] as const;
type Tab = (typeof TABS)[number];

/**
 * reviews (README 8-12, A21_Reviews · A21_DReviews). Reviews written on this device come first, then
 * data/reviews.json (placeholder text until the real board is imported — never invent review text).
 * TODO(backend): load reviews from the server.
 */
export function ReviewsView() {
  const mine = useMyReviews();
  const signedIn = useSignedIn();
  const [tab, setTab] = useState<Tab>('all');
  const [open, setOpen] = useState<string[]>([]);

  const all = useMemo(() => [...mine, ...reviews.filter((r) => !mine.some((m) => m.id === r.id))], [mine]);
  const list = tab === 'with photos' ? all.filter((r) => r.photo) : all;

  // Only buyers write reviews (prototype: signed in). TODO(backend): check the member has a delivered order.
  const writeHref = signedIn ? '/reviews/write' : signInHref('/reviews/write');

  return (
    <main className={styles.main}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>reviews</h1>
          <p className={styles.intro}>from people who bought a piece.</p>
        </div>
        <Link href={writeHref} className={styles.write}>
          write a review
        </Link>
      </div>

      <div role="group" aria-label="Show" className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tab === t}
            className={`${styles.tab} ${tab === t ? styles.tabOn : ''}`}
            onClick={() => setTab(t)}
          >
            <span className={styles.ulbl}>{t}</span>
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {list.map((r) => (
          <ReviewItem
            key={r.id}
            review={r}
            expanded={open.includes(r.id)}
            onToggle={() => setOpen((o) => (o.includes(r.id) ? o.filter((x) => x !== r.id) : [...o, r.id]))}
          />
        ))}
      </div>
    </main>
  );
}

function ReviewItem({ review: r, expanded, onToggle }: { review: Review; expanded: boolean; onToggle: () => void }) {
  const product = r.productSize ? `${r.productName} · ${r.productSize}` : r.productName;
  const rating = r.rating ?? 0;

  // `more` shows when the body is cut at three lines (measured; the design's 90-character rule before mount).
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [cut, setCut] = useState(r.body.length > 90);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const check = () => {
      if (el.classList.contains(styles.clamp3)) setCut(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <article aria-label={`review of ${product}`} className={styles.review}>
      {r.photo ? (
        // TODO(backend): buyer photos (up to 5). Grey placeholder until real photos exist (README 12).
        <div role="img" aria-label="buyer photo" className={styles.photo}>
          [buyer
          <br />
          photo]
        </div>
      ) : null}
      <div className={styles.text}>
        <div className={styles.line}>
          <span aria-hidden="true" className={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={12} strokeWidth={1.6} stroke="var(--color-ink)" fill={n <= rating ? 'var(--color-ink)' : 'none'} />
            ))}
          </span>
          {r.rating != null ? <span className="visually-hidden">{r.rating} out of 5</span> : null}
          {r.productId ? (
            <Link href={`/product/${r.productId}`} className={styles.product}>
              {product}
            </Link>
          ) : (
            <span className={styles.product}>{product}</span>
          )}
        </div>
        <p ref={bodyRef} lang={r.lang} className={`${styles.body} ${expanded ? '' : styles.clamp3}`}>
          {r.body}
        </p>
        {expanded || cut ? (
          <button type="button" aria-expanded={expanded} className={styles.more} onClick={onToggle}>
            {expanded ? 'less' : 'more'}
          </button>
        ) : null}
        <p className={styles.meta}>
          {maskName(r.author)} · {formatDate(r.date)}
        </p>
      </div>
    </article>
  );
}
