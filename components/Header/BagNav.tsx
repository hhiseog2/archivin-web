'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { BagDot } from '../BagDot/BagDot';
import { BagPreview } from '../BagPreview/BagPreview';
import { useCanSeePrices } from '@/lib/auth';
import { useBag } from '@/lib/cart';
import styles from './BagNav.module.css';

const EMPTY: string[] = [];

/**
 * "bag" + count ring, with the preview underneath (README 5, 8-5).
 * Aria: "Bag, empty" / "Bag, 1 piece" / "Bag, 2 pieces". Text is always "bag".
 *
 * Mouse: hover opens the preview, a click goes to /bag. Keyboard: focus opens it.
 * Touch (no hover): the first tap opens the preview and "view bag" goes on to /bag; tapping "bag" again,
 * tapping outside or Esc closes it. Client request — the v4 README (8-5) had touch go straight to /bag.
 */
export function BagNav({ align }: { align: 'mobile' | 'desktop' }) {
  const saved = useBag();
  // Members-only prices: signed-out visitors can't add, so the ring stays empty (README 8-2).
  const canBuy = useCanSeePrices();
  const ids = canBuy ? saved : EMPTY;
  const n = ids.length;
  // The preview is optional on the bag page itself (README 8-5) — it's off there.
  const preview = usePathname() !== '/bag';
  const aria = n > 0 ? `Bag, ${n} ${n === 1 ? 'piece' : 'pieces'}` : 'Bag, empty';

  const [open, setOpen] = useState(false);
  const [touch, setTouch] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const peekId = useId();

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover)');
    const sync = () => setTouch(!mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const tapToPreview = preview && touch;
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!tapToPreview) return; // mouse / no preview: plain link to /bag
    e.preventDefault();
    setOpen((v) => !v);
  };

  return (
    <div ref={wrap} className={`${styles.wrap} ${open ? styles.open : ''}`}>
      <Link
        href="/bag"
        aria-label={aria}
        aria-expanded={tapToPreview ? open : undefined}
        aria-controls={tapToPreview ? peekId : undefined}
        className={styles.link}
        onClick={onClick}
      >
        bag
        <BagDot count={n} />
      </Link>
      {preview && (
        <div id={peekId} className={`${styles.peek} ${align === 'desktop' ? styles.peekDesktop : styles.peekMobile}`}>
          <BagPreview ids={ids} />
        </div>
      )}
    </div>
  );
}
