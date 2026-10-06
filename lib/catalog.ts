import productData from '@/data/products.json';
import noticeData from '@/data/notices.json';
import reviewData from '@/data/reviews.json';
import lookbookData from '@/data/lookbooks.json';
import siteData from '@/data/site.json';

export type CategoryKey = 'all' | 'outer' | 'tops' | 'bottoms' | 'acc' | 'levis' | 'vans-converse';
export type Era = '70s' | '80s' | '90s' | '00s' | '10s';
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type Product = {
  id: string;
  productNo: string | null;
  name: string;
  category: Exclude<CategoryKey, 'all'>;
  era: Era;
  eraLabel: string;
  size: string | null;
  price: number | null;
  sold: boolean;
  newIn: number | null;
  addedAt: string;
  measurements: { shoulder: string; chest: string; sleeve: string; length: string } | null;
  tagSize: string | null;
  condition: string | null;
  construction: string | null;
  fabric: string | null;
  photos: string[];
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

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'outer', label: 'Outer' },
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'acc', label: 'Acc' },
  { key: 'levis', label: "Levi's" },
  { key: 'vans-converse', label: 'Vans & Converse' },
];

export const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const ERAS: Era[] = ['70s', '80s', '90s', '00s', '10s'];
export const SEARCH_SUGGESTIONS = ['Iggy Pop', 'John Varvatos', "Levi's", 'Pet Shop Boys', "80's"];

export const products = productData.products as Product[];
export const notices = noticeData.notices as Notice[];
export const reviews = reviewData.reviews as Review[];
export const lookbooks = lookbookData.lookbooks as Lookbook[];
export const site = siteData;

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? 'All';
}

export function shopHref(cat: CategoryKey) {
  return cat === 'all' ? '/shop' : `/shop?cat=${cat}`;
}

export function newInProducts() {
  return products
    .filter((p) => p.newIn != null)
    .sort((a, b) => (a.newIn ?? 0) - (b.newIn ?? 0));
}

/** Pieces to recommend under a product: same category first, unsold, not itself. */
export function relatedProducts(id: string, count: number) {
  const self = getProduct(id);
  const pool = products.filter((p) => p.id !== id && !p.sold);
  pool.sort((a, b) => Number(b.category === self?.category) - Number(a.category === self?.category));
  return pool.slice(0, count);
}

export function searchProducts(q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return products.filter((p) => p.name.toLowerCase().includes(needle));
}
