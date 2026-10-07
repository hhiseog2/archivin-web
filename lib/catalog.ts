import productData from '@/data/products.json';
import noticeData from '@/data/notices.json';
import reviewData from '@/data/reviews.json';
import lookbookData from '@/data/lookbooks.json';
import siteData from '@/data/site.json';

export type CategoryId = 'outer' | 'tops' | 'bottoms' | 'shoes' | 'accessories';

export type ProductImage = { src: string; alt: string };

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  brand: string | null;
  era: string;
  /** Short size shown on cards and in the bag: "L–XL", "US 9 (270)", "W38 L30". */
  sizeLabel: string;
  /** Letter sizes the size filter matches against (empty for shoes and denim). */
  sizes: string[];
  price: number | null;
  sold: boolean;
  images: ProductImage[];
  /** Second angle shown when a card is hovered or focused. Missing → the card photo doesn't change. */
  hoverImage?: { src: string; kind: string };
  measurements?: { unit: string; shoulder: number; chest: number; sleeve: number; length: number };
  condition?: { en: string; ko: string; photoLink?: { text: string; imageIndex: number } };
  details?: string;
};

export type NoticeBlock =
  | { type: 'h'; text: string }
  | { type: 'p'; text: string; muted?: boolean }
  | { type: 'note-ko'; text: string }
  | { type: 'dl'; rows: string[][] };

export type Notice = {
  id: string;
  title: string;
  lang: 'en' | 'ko';
  pinned: boolean;
  date: string | null;
  body: NoticeBlock[];
};

export type Review = {
  id: string;
  productName: string;
  productId: string | null;
  rating: number | null;
  title: string;
  lang: 'en' | 'ko';
  body: string;
  author: string;
  date: string;
  photo: boolean;
};

export type Lookbook = {
  n: number;
  title: string;
  season: string;
  intro: string;
  looks: { label: string; photo: string | null; caption: string }[];
  pieces: { name: string; productId: string | null; sold: boolean }[];
};

export const products = productData.products as Product[];
export const catalog = {
  categories: productData.categories as { id: CategoryId; label: string }[],
  brandShortcuts: productData.brandShortcuts,
  sorts: productData.filters.sort as { id: 'new' | 'price-asc' | 'price-desc'; label: string }[],
  /** Intro list (band · designer · rap · skate · archive). Plain text, not links (README 8-1). */
  introCategories: productData.introCategories,
  // TODO: fake display totals (README 11). Replace with real counts from the product API.
  totals: productData.totals,
  shippingFee: productData.shippingFee,
};
export const notices = noticeData.notices as Notice[];
export const reviews = reviewData.reviews as Review[];
export const lookbooks = lookbookData.lookbooks as Lookbook[];
export const site = siteData;

export const SEARCH_SUGGESTIONS = ['Iggy Pop', 'John Varvatos', "Levi's", 'Pet Shop Boys', "80's"];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function searchProducts(q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return products.filter((p) => p.name.toLowerCase().includes(needle) || p.brand?.toLowerCase().includes(needle));
}
