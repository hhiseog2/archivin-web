'use client';

import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { ProductImage } from '@/lib/catalog';
import styles from './PhotoCarousel.module.css';

type Props = {
  images: ProductImage[];
  index: number;
  onIndex: (i: number) => void;
  /** Overlay content (the "back" link). */
  children?: ReactNode;
};

/**
 * Product photos (README 8-3): full width, 3:4, laid side by side and slid 0.5s.
 * Swipe (40px+, more sideways than down; stops at the ends), tap the left / right 96px (wraps),
 * or ←/→. The number is only announced ("photo 2 of 5"); hidden photos are aria-hidden.
 */
export function PhotoCarousel({ images, index, onIndex, children }: Props) {
  const n = images.length;
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const tap = (step: number) => () => {
    // A swipe's pointerup can also land as a click on a tap zone; skip that one.
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    onIndex((index + step + n) % n);
  };

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft') onIndex((index - 1 + n) % n);
    if (e.key === 'ArrowRight') onIndex((index + 1) % n);
  };

  return (
    <section
      id="photos"
      aria-label="Photos"
      aria-roledescription="carousel"
      className={styles.carousel}
      onKeyDown={onKey}
      onPointerDown={(e) => {
        start.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const s = start.current;
        start.current = null;
        if (!s) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
        swiped.current = true;
        setTimeout(() => {
          swiped.current = false;
        }, 400);
        const k = index + (dx < 0 ? 1 : -1);
        if (k >= 0 && k < n) onIndex(k);
      }}
      onPointerCancel={() => {
        start.current = null;
      }}
    >
      <div className={styles.track} style={{ transform: `translateX(${-100 * index}%)` }}>
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img.src} src={img.src} alt={img.alt} aria-hidden={i !== index} draggable={false} className={styles.photo} />
        ))}
      </div>
      {n > 1 && (
        <>
          <button type="button" aria-label="Previous photo" className={`${styles.zone} ${styles.prev}`} onClick={tap(-1)} />
          <button type="button" aria-label="Next photo" className={`${styles.zone} ${styles.next}`} onClick={tap(1)} />
        </>
      )}
      {children}
      <p aria-live="polite" className="visually-hidden">
        photo {index + 1} of {n}
      </p>
    </section>
  );
}

/**
 * Bars under the photos: 28×28 buttons with a 16×4 bar; the navy bar slides to `6 + 28 × i` px (0.3s).
 * Hidden when there's only one photo.
 */
export function PhotoBars({ count, index, onIndex }: { count: number; index: number; onIndex: (i: number) => void }) {
  if (count < 2) return null;
  return (
    <div role="group" aria-label="Choose photo" className={styles.bars}>
      <div className={styles.barRow}>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`photo ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
            className={styles.barBtn}
            onClick={() => onIndex(i)}
          >
            <span aria-hidden="true" className={styles.bar} />
          </button>
        ))}
        <span aria-hidden="true" className={styles.thumb} style={{ left: 6 + 28 * index }} />
      </div>
    </div>
  );
}
