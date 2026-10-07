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
  /** Other angle, cross-faded in on hover / keyboard focus (hover devices only). */
  hoverImage?: string | null;
  /** Already in the bag → "in bag" under the price line (stitch ②, small). */
  inBag?: boolean;
};

/**
 * Card (README 5): 3:4 photo on white, name 14/20 clamped to two lines, then "₩ 000,000 · L–XL" or "sold",
 * then "in bag" if it's in the bag. The whole card is one link; its aria-label describes the photo (alt="").
 */
export function ProductCard({ name, href, price, sold, sizeLabel, image, hoverImage, inBag }: Props) {
  const priceText = sold ? 'sold' : formatPrice(price);
  const line2 = sold ? 'sold' : sizeLabel ? `${priceText} · ${sizeLabel}` : priceText;
  const aria = `${name}, ${priceText}${sizeLabel ? `, size ${sizeLabel}` : ''}${inBag ? ', in bag' : ''}`;
  return (
    <Link href={href} aria-label={aria} className={styles.card}>
      <span className={styles.frame}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" loading="lazy" className={styles.img} />
        ) : (
          <span aria-hidden="true" className={`${styles.img} ${styles.empty}`} />
        )}
        {hoverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hoverImage} alt="" loading="lazy" className={styles.img2} />
        )}
      </span>
      <span className={styles.name}>{name}</span>
      <span className={styles.line2}>{line2}</span>
      {inBag && (
        <span className={styles.inbag}>
          <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
            <circle cx="4.5" cy="4.5" r="3.9" />
          </svg>
          in bag
        </span>
      )}
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
