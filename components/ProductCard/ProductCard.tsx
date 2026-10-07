import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatPrice } from '@/lib/format';
import styles from './ProductCard.module.css';

type Props = {
  name: string;
  href: string;
  price: number | null;
  sold: boolean;
  /** "L–XL", "US 9 (270)". Optional for lookbook pieces that aren't in the shop yet. */
  sizeLabel?: string;
  /** Photo URL. Missing → empty fill well (lookbook placeholders). */
  image?: string | null;
};

/**
 * Card (README 5): 3:4 photo on white, name 14/20 clamped to two lines, then "₩ 000,000 · L–XL" or "sold".
 * The whole card is one link; its aria-label describes the photo, so the image itself has alt="".
 */
export function ProductCard({ name, href, price, sold, sizeLabel, image }: Props) {
  const priceText = sold ? 'sold' : formatPrice(price);
  const line2 = sold ? 'sold' : sizeLabel ? `${priceText} · ${sizeLabel}` : priceText;
  const aria = `${name}, ${priceText}${sizeLabel ? `, size ${sizeLabel}` : ''}`;
  return (
    <Link href={href} aria-label={aria} className={styles.card}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" loading="lazy" className={styles.img} />
      ) : (
        <span aria-hidden="true" className={`${styles.img} ${styles.empty}`} />
      )}
      <span className={styles.name}>{name}</span>
      <span className={styles.line2}>{line2}</span>
    </Link>
  );
}

/** Product grid: 2 columns (20 / 56) on mobile, auto-fill 240px+ (56 / 80) on desktop. */
export function ProductGrid({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <section aria-label={label} className={styles.grid}>
      {children}
    </section>
  );
}
