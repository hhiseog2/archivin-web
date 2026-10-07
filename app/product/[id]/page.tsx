import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteChrome } from '@/components/SiteChrome';
import { getProduct, products } from '@/lib/catalog';
import { ProductView } from './ProductView';

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getProduct(id)?.name ?? 'Not found' };
}

/** A21_Product. No footer (README 5). */
export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  return (
    <SiteChrome footer={false} fullWidth>
      <ProductView product={product} />
    </SiteChrome>
  );
}
