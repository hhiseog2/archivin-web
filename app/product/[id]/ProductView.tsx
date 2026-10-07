'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Accordion } from '@/components/Accordion/Accordion';
import { addToBag, useBag } from '@/lib/cart';
import type { Product } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import { LAST_SHOP_KEY } from '@/lib/shop';
import styles from './product.module.css';

const DESKTOP = '(min-width: 900px)';

export function ProductView({ product: p }: { product: Product }) {
  const [shot, setShot] = useState(0);
  const [status, setStatus] = useState('');
  const [backHref, setBackHref] = useState('/shop');
  const inBag = useBag().includes(p.id);
  const n = p.images.length;
  const touchX = useRef<number | null>(null);

  // "back" keeps the shop's filters when we came from there (README 8-3).
  useEffect(() => {
    try {
      const last = sessionStorage.getItem(LAST_SHOP_KEY);
      if (last?.startsWith('/shop')) setBackHref(last);
    } catch {
      // storage blocked: plain /shop
    }
  }, []);

  const go = (i: number) => setShot((i + n) % n);

  // "photo 4" in the condition text: show that photo and scroll to it.
  const showPhoto = (index: number) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShot(index);
    const target = window.matchMedia(DESKTOP).matches
      ? document.getElementById(`photo-${index + 1}`)
      : document.getElementById('photos');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const priceLine = p.sold ? `size ${p.sizeLabel}` : `${formatPrice(p.price)} · size ${p.sizeLabel}`;
  const cond = p.condition;
  const link = cond?.photoLink;
  const [before, after] = link ? cond.en.split(link.text) : [cond?.en ?? '', ''];

  const back = (
    <Link href={backHref} className={styles.back}>
      back
    </Link>
  );

  return (
    <main className={styles.layout}>
      {/* Mobile: one photo at a time, tap the left/right 96px (or swipe) to move. */}
      <section
        id="photos"
        aria-label="Photos"
        aria-roledescription="carousel"
        className={`m-only ${styles.carousel}`}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(shot + (dx < 0 ? 1 : -1));
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.images[shot].src} alt={p.images[shot].alt} className={styles.photo} />
        {n > 1 && (
          <>
            <button type="button" aria-label="Previous photo" className={`${styles.zone} ${styles.zonePrev}`} onClick={() => go(shot - 1)} />
            <button type="button" aria-label="Next photo" className={`${styles.zone} ${styles.zoneNext}`} onClick={() => go(shot + 1)} />
          </>
        )}
        <div className={styles.backOnPhoto}>{back}</div>
        <p aria-live="polite" className="visually-hidden">
          photo {shot + 1} of {n}
        </p>
      </section>

      {/* TODO(design): desktop product page has no design (README 8-5) — photos stacked left, sticky info right. */}
      <section aria-label="Photos" className={`d-only ${styles.stack}`}>
        {p.images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img.src} id={`photo-${i + 1}`} src={img.src} alt={img.alt} className={styles.photo} />
        ))}
      </section>

      <div className={styles.side}>
        <div className="d-only">{back}</div>

        <section aria-label={p.name} className={styles.info}>
          <h1 className={styles.name}>{p.name}</h1>
          <p className={styles.price}>{priceLine}</p>
          {p.sold ? (
            // TODO(design): sold product page has no design (README 8-5) — disabled "sold" pill.
            <button type="button" disabled className={`${styles.pill} ${styles.pillOff}`}>
              sold
            </button>
          ) : inBag ? (
            <Link href="/bag" className={`${styles.pill} ${styles.pillFill}`}>
              in your bag · view bag
            </Link>
          ) : (
            <button
              type="button"
              className={`${styles.pill} ${styles.pillNavy}`}
              onClick={() => {
                addToBag(p.id);
                setStatus('added to bag.');
              }}
            >
              add to bag
            </button>
          )}
          <p role="status" className="visually-hidden">
            {status}
          </p>
        </section>

        {/* Rows without data are hidden — only 3599 has full details so far (README 11). */}
        {(p.measurements || cond || p.details) && (
          <section aria-label="Product information" className={styles.more}>
            {p.measurements && (
              <Accordion title="measurements">
                <p className={styles.unit}>
                  {p.measurements.unit} · <span lang="ko">단면 기준</span>
                </p>
                <dl className={styles.measure}>
                  {(['shoulder', 'chest', 'sleeve', 'length'] as const).map((k) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{p.measurements![k]}</dd>
                    </div>
                  ))}
                </dl>
              </Accordion>
            )}
            {cond && (
              <Accordion title="condition">
                <p className={styles.text}>
                  {before}
                  {link && (
                    <a href="#photos" className={styles.photoLink} onClick={showPhoto(link.imageIndex)}>
                      {link.text}
                    </a>
                  )}
                  {after}
                </p>
                <p lang="ko" className={styles.ko}>
                  {cond.ko}
                </p>
              </Accordion>
            )}
            {p.details && (
              <Accordion title="details">
                <p className={styles.text}>{p.details}</p>
              </Accordion>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
