// Server only: import this from server components (product page), never from 'use client' files.
import detailData from '@/data/product-details.json';
import { getProduct, photoUrl, type Measurements, type Product } from './catalog';

type Detail = {
  tagSize?: string | null;
  images: string[];
  measurements?: Measurements;
  condition?: Product['condition'];
  details?: string;
  detailsKo?: string[];
  cafe24?: Record<string, string>;
};

const DETAILS = detailData as Record<string, Detail>;

/** The full piece for its product page: list fields + every photo, measurements and details. */
export function getProductFull(id: string): Product | undefined {
  const p = getProduct(id);
  if (!p) return undefined;
  const d = DETAILS[id];
  if (!d) return p;
  const { images, cafe24: _cafe24, ...rest } = d;
  return { ...p, ...rest, images: images.map((src, i) => ({ src: photoUrl(src), alt: i ? `${p.name}, photo ${i + 1}` : p.name })) };
}
