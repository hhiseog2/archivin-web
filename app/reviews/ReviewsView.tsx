'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { StarIcon } from '@/components/Icons';
import { useMyReviews } from '@/lib/cart';
import { reviews as baseReviews, type Review } from '@/lib/catalog';
import { ReviewForm } from './ReviewForm';
import ui from '@/components/ui.module.css';
import styles from './reviews.module.css';

type Tab = 'All' | 'With photos';

export function ReviewsView({ initialWriting = false, justPosted = false }: { initialWriting?: boolean; justPosted?: boolean }) {
  const mine = useMyReviews();
  const [tab, setTab] = useState<Tab>('All');
  const [writing, setWriting] = useState(initialWriting);
  const [posted, setPosted] = useState(justPosted);
  const writeBtn = useRef<HTMLButtonElement>(null);
  const formWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (writing && !initialWriting) formWrap.current?.querySelector<HTMLElement>('select')?.focus();
  }, [writing, initialWriting]);

  const all: Review[] = [...mine, ...baseReviews];
  const list = tab === 'With photos' ? all.filter((r) => r.photo) : all;

  return (
    <main className={styles.main}>
      <div className={styles.side}>
        <div className={styles.headRow}>
          <div>
            <h1 className={ui.pageTitle}>Reviews</h1>
            <p className={ui.pageIntro}>From people who bought a piece.</p>
          </div>
          <Link href="/reviews/write" className={`m-only ${styles.writeLink}`}>
            Write a review
          </Link>
        </div>
        <div role="group" aria-label="Show" className={styles.tabs}>
          {(['All', 'With photos'] as Tab[]).map((t) => (
            <button key={t} type="button" className={ui.chip} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <button
          ref={writeBtn}
          type="button"
          className={`d-only ${styles.writeBtn}`}
          aria-expanded={writing}
          aria-controls="rv-form"
          onClick={() => {
            setWriting(!writing);
            setPosted(false);
          }}
        >
          {writing ? 'Close' : 'Write a review'}
        </button>
      </div>

      <div className={styles.content}>
        <div id="rv-form" ref={formWrap} className="d-only">
          {writing && (
            <section aria-labelledby="rvd-h" className={styles.formSection}>
              <ReviewForm
                variant="inline"
                idPrefix="rvd"
                onPosted={() => {
                  setWriting(false);
                  setPosted(true);
                  setTab('All');
                  writeBtn.current?.focus();
                }}
                onCancel={() => {
                  setWriting(false);
                  writeBtn.current?.focus();
                }}
              />
            </section>
          )}
        </div>

        <div role="status">{posted && <p className={`${ui.status} ${styles.posted}`}>Your review is posted.</p>}</div>

        <div className={styles.list}>
          {list.map((r) => (
            <ReviewItem key={r.id} r={r} />
          ))}
          {list.length === 0 && <p className={styles.none}>No reviews with photos yet.</p>}
        </div>

      </div>
    </main>
  );
}

function ReviewItem({ r }: { r: Review }) {
  const rating = r.rating ?? 0;
  return (
    <article className={styles.item}>
      <Link href={r.productId ? `/product/${r.productId}` : '/shop'} className={styles.product}>
        <span aria-hidden="true" className={styles.productThumb} />
        <span className={styles.productName}>{r.productName}</span>
      </Link>
      <div className={styles.ratingRow}>
        <span aria-hidden="true" className={styles.miniStars}>
          {[0, 1, 2, 3, 4].map((i) => (
            <StarIcon key={i} filled={i < rating} />
          ))}
        </span>
        <span className={styles.ratingSmall}>
          <span className="visually-hidden">Rating: </span>
          {r.rating == null ? '[N] / 5' : `${r.rating} / 5`}
        </span>
      </div>
      {r.title && (
        <h2 lang={r.lang} className={`${styles.itemTitle} ${r.lang === 'ko' ? styles.ko : ''}`}>
          {r.title}
        </h2>
      )}
      <p className={styles.itemBody}>
        {r.body}
      </p>
      {r.photo && (
        <div className={`${ui.well} ${styles.itemPhoto}`}>
          <span aria-hidden="true">[PHOTO]</span>
        </div>
      )}
      <p className={styles.itemMeta}>
        {r.author} · {r.date}
      </p>
    </article>
  );
}
