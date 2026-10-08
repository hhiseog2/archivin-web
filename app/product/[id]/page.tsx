import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteChrome } from '@/components/SiteChrome';
import { getProduct, products } from '@/lib/catalog';
import { getProductFull } from '@/lib/product-details';
import { ProductView } from './ProductView';

type Params = { id: string };

/** Available pieces are built ahead; sold ones (2,000+) render on first visit and are cached after. */
export function generateStaticParams(): Params[] {
  return products.filter((p) => !p.sold).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getProduct(id)?.name ?? 'Not found' };
}

/** A21_Product · A21_DProduct. v5 adds the footer (README 5, 8-3). Unknown ids → 404. */
export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const product = getProductFull(id);
  if (!product) notFound();
  return (
    <SiteChrome fullWidth>
      <ProductView product={product} />
    </SiteChrome>
  );
}
