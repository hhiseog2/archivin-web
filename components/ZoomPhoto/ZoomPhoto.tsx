'use client';

import { useState, type MouseEvent, type PointerEvent, type Ref } from 'react';
import styles from './ZoomPhoto.module.css';

type Props = {
  src: string;
  alt: string;
  id?: string;
  ref?: Ref<HTMLButtonElement>;
};

const clamp = (v: number) => Math.max(0, Math.min(100, v));

/**
 * Desktop product photo, 3:4 (README 8-3 `.pzoom`). Click → scale(2) around the click point (0.32s);
 * while zoomed the origin follows a mouse / pen so you can look around. Click again, leave, or Esc → back.
 * Enter / Space zoom around the centre. The frame clips the zoomed photo — no lightbox.
 */
export function ZoomPhoto({ src, alt, id, ref }: Props) {
  const [zoomed, setZoomed] = useState(false);
  // Kept after zooming out so the photo shrinks back towards the same point.
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const at = (e: MouseEvent<HTMLButtonElement> | PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) };
  };

  return (
    <button
      type="button"
      id={id}
      ref={ref}
      aria-pressed={zoomed}
      aria-label={`zoom: ${alt}`}
      className={`${styles.zoom} ${zoomed ? styles.isZ : ''}`}
      onClick={(e) => {
        if (zoomed) {
          setZoomed(false);
          return;
        }
        // detail 0 = keyboard (Enter / Space): zoom around the centre.
        setOrigin(e.detail === 0 ? { x: 50, y: 50 } : at(e));
        setZoomed(true);
      }}
      onPointerMove={(e) => {
        if (zoomed && e.pointerType !== 'touch') setOrigin(at(e));
      }}
      onPointerLeave={(e) => {
        if (zoomed && e.pointerType !== 'touch') setZoomed(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && zoomed) setZoomed(false);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className={styles.img}
        style={{ transform: zoomed ? 'scale(2)' : 'scale(1)', transformOrigin: `${origin.x.toFixed(1)}% ${origin.y.toFixed(1)}%` }}
      />
    </button>
  );
}
