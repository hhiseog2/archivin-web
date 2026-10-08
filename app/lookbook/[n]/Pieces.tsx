'use client';

import { ProductCard, ProductGrid } from '@/components/ProductCard/ProductCard';
import { useCanSeePrices } from '@/lib/auth';
import { useBag } from '@/lib/cart';
import type { Product } from '@/lib/catalog';

export type PieceView = { name: string; sold: boolean; product: Product | null };

/** "pieces in this issue": shop cards, same members-only price rule as the shop (README 8-13). */
export function Pieces({ pieces }: { pieces: PieceView[] }) {
  const showPrice = useCanSeePrices();
  const bag = useBag();
  return (
    <ProductGrid>
      {pieces.map(({ name, sold, product: p }, i) => (
        <ProductCard
          key={i}
          name={name}
          href={p ? `/product/${p.id}` : '/shop'}
          price={p?.price ?? null}
          sold={sold}
          sizeLabel={p?.sizeLabel}
          image={p?.images[0]?.src}
          hoverImage={p?.hoverImage?.src}
          inBag={p ? bag.includes(p.id) : false}
          showPrice={showPrice}
        />
      ))}
    </ProductGrid>
  );
}
