import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatPrice } from '@/lib/format';
import { Placeholder } from '../Placeholder';
import styles from './ProductCard.module.css';

type Props = {
  name: string;
  href: string;
  price: number | null;
  sold: boolean;
  photo?: string | null;
  /** Extra control layered on the image (Shop: add-to-bag "+"). */
  action?: ReactNode;
};

/** 4:5 image well, name left, price or SOLD OUT (always in words) right. */
export function ProductCard({ name, href, price, sold, photo, action }: Props) {
  const priceText = formatPrice(price);
  return (
    <div className={styles.card}>
      <Link href={href} aria-label={`${name}, ${sold ? 'sold out' : priceText}`} className={styles.link}>
        <Placeholder src={photo} label="[FRONT 4:5]" ratio="4 / 5" />
        <div className={styles.info}>
          <span className={styles.name}>{name}</span>
          {sold ? <span className={styles.sold}>SOLD OUT</span> : <span className={styles.price}>{priceText}</span>}
        </div>
      </Link>
      {action}
    </div>
  );
}

/** Responsive product grid: 2 columns on mobile, auto-fill on desktop. `mobileLimit` hides extras on mobile. */
export function ProductGrid({
  children,
  label,
  mobileLimit,
}: {
  children: ReactNode;
  label?: string;
  mobileLimit?: 2;
}) {
  return (
    <div
      role={label ? 'region' : undefined}
      aria-label={label}
      className={`${styles.grid} ${mobileLimit === 2 ? styles.limit2 : ''}`}
    >
      {children}
    </div>
  );
}
