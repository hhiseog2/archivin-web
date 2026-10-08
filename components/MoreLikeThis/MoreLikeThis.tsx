'use client';

import { ProductCard } from '@/components/ProductCard/ProductCard';
import { useCanSeePrices } from '@/lib/auth';
import { useBag } from '@/lib/cart';
import { moreLikeThis } from '@/lib/catalog';
import styles from './MoreLikeThis.module.css';

/** Section id — the sold piece's "more like this" link scrolls here. */
export const MORE_LIKE_THIS_ID = 'more';

/**
 * "more like this" under a product (README 8-3): four available pieces — same category first, nearest era,
 * then new in (`moreLikeThis()`), as shop cards. Mobile 56px below, 2 columns (20 / 56);
 * desktop 160px below, 4 columns (56 / 80), back to 2 at 719px and under.
 */
export function MoreLikeThis({ id }: { id: string }) {
  const showPrice = useCanSeePrices();
  const bag = useBag();
  const list = moreLikeThis(id, 4);
  if (list.length === 0) return null;
  return (
    <section id={MORE_LIKE_THIS_ID} aria-labelledby="more-title" className={styles.more}>
      <h2 id="more-title" className={styles.title}>
        more like this
      </h2>
      <div className={styles.grid}>
        {list.map((p) => (
          <ProductCard
            key={p.id}
            name={p.name}
            href={`/product/${p.id}`}
            price={p.price}
            sold={p.sold}
            sizeLabel={p.sizeLabel}
            image={p.images[0]?.src}
            hoverImage={p.hoverImage?.src}
            inBag={bag.includes(p.id)}
            showPrice={showPrice}
          />
        ))}
      </div>
    </section>
  );
}
