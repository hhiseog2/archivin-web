'use client';

import Link from 'next/link';
import { useEffect, useState, type MouseEvent } from 'react';
import { AddToBagButton } from '@/components/AddToBagButton/AddToBagButton';
import { InfoRow } from '@/components/InfoRow/InfoRow';
import { PhotoBars, PhotoCarousel } from '@/components/PhotoCarousel/PhotoCarousel';
import type { Product } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import { LAST_SHOP_KEY } from '@/lib/shop';
import styles from './product.module.css';

const DESKTOP = '(min-width: 900px)';

/** A21_Product (mobile). Desktop: TODO(design) — no design yet (README 8-6); photos stacked left, info sticky right. */
export function ProductView({ product: p }: { product: Product }) {
  const [shot, setShot] = useState(0);
  const [backHref, setBackHref] = useState('/shop');

  // "back" keeps the shop's view when we came from there (README 8-3).
  useEffect(() => {
    try {
      const last = sessionStorage.getItem(LAST_SHOP_KEY);
      if (last?.startsWith('/shop')) setBackHref(last);
    } catch {
      // storage blocked: plain /shop
    }
  }, []);

  // "photo 4" in the condition text: go to that photo and scroll up to it.
  const showPhoto = (index: number) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShot(index);
    const target = window.matchMedia(DESKTOP).matches ? document.getElementById(`photo-${index + 1}`) : document.getElementById('photos');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
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
      <div className="m-only">
        <PhotoCarousel images={p.images} index={shot} onIndex={setShot}>
          <div className={styles.backOnPhoto}>{back}</div>
        </PhotoCarousel>
        <PhotoBars count={p.images.length} index={shot} onIndex={setShot} />
      </div>

      {/* TODO(design): desktop product page (README 8-6) — photos one under another, no bars. */}
      <section aria-label="Photos" className={`d-only ${styles.stack}`}>
        {p.images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img.src} id={`photo-${i + 1}`} src={img.src} alt={img.alt} className={styles.stackPhoto} />
        ))}
      </section>

      <div className={styles.side}>
        <div className="d-only">{back}</div>

        <section aria-label={p.name} className={`${styles.info} ${p.images.length > 1 ? '' : styles.infoNoBars}`}>
          <h1 className={styles.name}>{p.name}</h1>
          <p className={styles.price}>{priceLine}</p>
          <AddToBagButton id={p.id} sold={p.sold} />
        </section>

        {/* measurements · condition · details hide when there's no data (only 3599 has them so far, README 12). */}
        <section aria-label="Product information" className={styles.more}>
          {p.measurements && (
            <InfoRow title="measurements">
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
            </InfoRow>
          )}
          {cond && (
            <InfoRow title="condition">
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
            </InfoRow>
          )}
          {p.details && (
            <InfoRow title="details">
              <p className={styles.text}>{p.details}</p>
            </InfoRow>
          )}
          {/* Same copy as the bag. TODO: client to confirm the shipping / returns wording (README 12). */}
          <InfoRow title="shipping & returns">
            <p className={styles.text}>ships in 2–3 business days · no exchanges or refunds, except defects.</p>
            <p lang="ko" className={styles.ko}>
              영업일 2–3일 내 발송 · 하자 외 교환·환불 불가
            </p>
          </InfoRow>
        </section>
      </div>
    </main>
  );
}
