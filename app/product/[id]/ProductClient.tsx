'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckIcon, ChevronLeft, ChevronRight, MinusIcon, PlusIcon } from '@/components/Icons';
import { addToBag, toggleWishlist, useBag, useWishlist } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import ui from '@/components/ui.module.css';
import styles from './product.module.css';

/** Mobile photo carousel: one big 4:5 shot, prev/next, 5 thumbnails. */
export function MobileCarousel({ shots }: { shots: string[] }) {
  const [idx, setIdx] = useState(0);
  const n = shots.length;
  return (
    <div role="group" aria-roledescription="carousel" aria-label="Photo carousel" className={styles.carousel}>
      {/* TODO: real photos per shot */}
      <div className={styles.stage}>
        <span aria-hidden="true">[{shots[idx]} 4:5]</span>
        <div aria-live="polite" className={styles.counter}>
          <span className="visually-hidden">Photo </span>
          {idx + 1} / {n}
        </div>
        <div className={styles.arrows}>
          <button type="button" aria-label="Previous photo" className={styles.arrow} onClick={() => setIdx((idx + n - 1) % n)}>
            <ChevronLeft size={18} />
          </button>
          <button type="button" aria-label="Next photo" className={styles.arrow} onClick={() => setIdx((idx + 1) % n)}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className={styles.thumbs}>
        {shots.map((label, i) => (
          <button
            key={label}
            type="button"
            className={styles.thumb}
            aria-label={`Photo ${i + 1} of ${n}: ${label.toLowerCase()}`}
            aria-pressed={i === idx}
            onClick={() => setIdx(i)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Add to bag (or the sold-out state) + wishlist toggle. */
export function PurchaseActions({ id, name, sold }: { id: string; name: string; sold: boolean }) {
  const bag = useBag();
  const wish = useWishlist();
  const router = useRouter();
  const inBag = bag.includes(id);
  const saved = wish.includes(id);
  const [status, setStatus] = useState('');

  return (
    <div className={styles.actions}>
      {sold ? (
        <>
          <button type="button" aria-disabled="true" className={ui.btnDisabled}>
            Sold out
          </button>
          <Link href="/shop" className={ui.textLinkCenter}>
            See similar pieces
          </Link>
        </>
      ) : inBag ? (
        <Link href="/bag" className={ui.btnPrimary}>
          <CheckIcon size={18} />
          In your bag
        </Link>
      ) : (
        <button
          type="button"
          className={ui.btnPrimary}
          onClick={() => {
            addToBag(id);
            router.push('/bag');
          }}
        >
          Add to bag
        </button>
      )}
      <button
        type="button"
        aria-pressed={saved}
        className={ui.btnSecondary}
        onClick={() => {
          toggleWishlist(id);
          setStatus(saved ? `${name} removed from your wishlist.` : `${name} saved to your wishlist.`);
        }}
      >
        {saved && <CheckIcon size={18} />}
        {saved ? 'Saved to wishlist' : 'Save to wishlist'}
      </button>
      <p role="status" className="visually-hidden">
        {status}
      </p>
    </div>
  );
}

export function ShippingAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <section className={styles.blockSm}>
      <h2 className={styles.accHeading}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="ship-panel"
          className={styles.accBtn}
          onClick={() => setOpen(!open)}
        >
          Shipping &amp; returns
          {open ? <MinusIcon /> : <PlusIcon />}
        </button>
      </h2>
      <div id="ship-panel" hidden={!open} className={styles.accPanel}>
        <p>
          Shipping is ₩ 3,000. Orders arrive 3–7 business days after payment, not counting weekends and holidays. Remote
          and island areas cost extra.
        </p>
        <p className={styles.accStrong}>No exchanges or refunds except for defects.</p>
      </div>
    </section>
  );
}

/** Mobile sticky bar at the bottom of the product page. */
export function PurchaseBar({
  id,
  name,
  size,
  price,
  sold,
}: {
  id: string;
  name: string;
  size: string;
  price: number | null;
  sold: boolean;
}) {
  const bag = useBag();
  const router = useRouter();
  const inBag = bag.includes(id);
  return (
    <div role="region" aria-label="Purchase" className={`m-only ${styles.bar}`}>
      <div className={styles.barInfo}>
        <span className={styles.barName}>
          {name} · {size}
        </span>
        {sold ? (
          <span className={`${styles.barSold} ${ui.soldText}`}>SOLD OUT</span>
        ) : (
          <span className={styles.barPrice}>{formatPrice(price)}</span>
        )}
      </div>
      {sold ? (
        <Link href="/shop" className={`${ui.btnSecondary} ${styles.barBtn}`}>
          See similar
        </Link>
      ) : inBag ? (
        <Link href="/bag" className={`${ui.btnPrimary} ${styles.barBtn}`}>
          In your bag
        </Link>
      ) : (
        <button
          type="button"
          className={`${ui.btnPrimary} ${styles.barBtn}`}
          onClick={() => {
            addToBag(id);
            router.push('/bag');
          }}
        >
          Add to bag
        </button>
      )}
    </div>
  );
}
