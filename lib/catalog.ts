import productData from '@/data/products.json';
import noticeData from '@/data/notices.json';
import reviewData from '@/data/reviews.json';
import lookbookData from '@/data/lookbooks.json';
import siteData from '@/data/site.json';
import checkoutData from '@/data/checkout.json';
import guideData from '@/data/guide.json';
import policyData from '@/data/policies.json';

export type CategoryId = 'outer' | 'tops' | 'bottoms' | 'shoes' | 'accessories';

export type ProductImage = { src: string; alt: string };

/** Tops / outer measure shoulder · chest · sleeve · length; bottoms waist · rise · thigh · hem · length. */
export type Measurements = { unit: string } & Partial<
  Record<'shoulder' | 'chest' | 'sleeve' | 'length' | 'waist' | 'rise' | 'thigh' | 'hem' | 'width' | 'height', number>
>;

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  /** Subcategory (tops: tees · long sleeves …, bottoms: pants · shorts, accessories: hats · bags · others). */
  sub: string | null;
  /** Levi's model (501 · 505 · 517 · 550; anything else counts as "others"). */
  model?: string | null;
  brand: string | null;
  era: string;
  /** Recommended fit shown on cards and in the bag: "L–XL", "US 9 (270)", "W38 L30" (README 8-2). */
  sizeLabel: string;
  /** Recommended-fit letters the size filter matches (empty for shoes, bottoms and accessories). */
  sizes: string[];
  /** Bottoms: waist in inches (size filter "waist · inch"). */
  waist?: number | null;
  /** Shoes: fit in mm (size filter "shoes · mm"). */
  fitMm?: number | null;
  /** Size on the tag. Shown as "· tag M" only when it differs from sizeLabel. Detail field (server). */
  tagSize?: string | null;
  price: number | null;
  sold: boolean;
  /** In the browser list only the first photo; the product page gets them all (lib/product-details.ts). */
  images: ProductImage[];
  /** Second angle shown when a card is hovered or focused. Missing → the card photo doesn't change. */
  hoverImage?: { src: string; kind: string };
  measurements?: Measurements;
  condition?: { en: string; ko: string; photoLink?: { text: string; imageIndex: number } };
  details?: string;
  detailsKo?: string[];
};

export type NoticeBlock =
  | { type: 'h'; text: string }
  | { type: 'p'; text: string; muted?: boolean }
  | { type: 'note-ko'; text: string }
  | { type: 'dl'; rows: string[][] }
  | { type: 'link'; text: string; href: string };

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
  productSize: string;
  productId: string | null;
  rating: number | null;
  /** Not shown in v5. */
  title: string;
  lang: 'en' | 'ko';
  body: string;
  author: string;
  date: string;
  photo: boolean;
};

export type LookPiece = { name: string; productId: string | null; sold: boolean };

export type Lookbook = {
  n: number;
  title: string;
  season: string;
  lookCount: number;
  cover: string | null;
  intro: string;
  looks: { label: string; photo: string | null; pieces: LookPiece[] }[];
  pieces: LookPiece[];
};

export type GuideSection = {
  id: string;
  title: string;
  titleKo: string;
  kind: 'kv' | 'p' | 'contact';
  rows?: { label?: string; en: string; ko?: string }[];
  /** kind "p": paragraphs, each with its Korean line. */
  paragraphs?: { en: string; ko?: string }[];
  contact?: string[];
};

export type PolicyArticle = { title: string; body: string };

type SubDef = { id: string; label: string; cafe24?: string };
type CategoryDef = { id: CategoryId; label: string; cafe24?: string; subs: SubDef[] };
type BrandShortcut = { label: string; brands: string[]; subsBy: 'model' | 'brand'; subs: string[] };

// TODO(backend): migrate products and members from cafe24 (strip the size prefix from names, e.g. "38)90's Levis 517";
// member id → email; review board). `products[].cafe24` keeps each piece's archivin.kr number and category.
/**
 * data/products.json holds the list fields only (cards, filters, bag) — it ships to the browser on every page,
 * so measurements, details and the full photo list live in data/product-details.json (server only).
 */
type ProductRow = Omit<Product, 'images' | 'hoverImage'> & { image: string | null; hover?: string };

/**
 * Sold pieces keep their photos on archivin.kr (cafe24), stored as "~/big/…" to keep the list small.
 * TODO(client): move them to image storage before the cafe24 shop closes — they disappear with it.
 */
export const photoUrl = (src: string) => (src.startsWith('~/') ? `https://archivin.kr/web/product/${src.slice(2)}` : src);

export const products: Product[] = (productData.products as ProductRow[]).map(({ image, hover, ...p }) => ({
  ...p,
  images: image ? [{ src: photoUrl(image), alt: p.name }] : [],
  ...(hover ? { hoverImage: { src: photoUrl(hover), kind: 'other angle' } } : {}),
}));
export const catalog = {
  categories: productData.categories as CategoryDef[],
  brandShortcuts: productData.brandShortcuts as BrandShortcut[],
  sorts: productData.filters.sort as { id: 'new' | 'price-asc' | 'price-desc'; label: string }[],
  size: productData.filters.size as {
    letters: string[];
    waistInch: number[];
    shoesMm: number[];
    groupsByView: Record<string, ('letters' | 'waistInch' | 'shoesMm')[]>;
  },
  /** Display totals from archivin.kr (2026.10.08). TODO(backend): count on the server. */
  totals: productData.totals as { available: number; includingSold: number; asOf: string },
  shippingFee: productData.shippingFee,
};
export const notices = noticeData.notices as Notice[];
export const reviews = reviewData.reviews as Review[];
export const lookbooks = lookbookData.lookbooks as Lookbook[];
export const site = siteData;
export const checkoutConfig = checkoutData;
export const guide = guideData.sections as GuideSection[];
export const policies = policyData as { effective: string; terms: PolicyArticle[]; privacy: PolicyArticle[] };

export const SEARCH_SUGGESTIONS = ['Iggy Pop', 'John Varvatos', "Levi's", 'Pet Shop Boys', "80's"];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function searchProducts(q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return products.filter((p) => p.name.toLowerCase().includes(needle) || p.brand?.toLowerCase().includes(needle));
}

const eraYear = (era: string) => {
  const n = Number.parseInt(era, 10);
  return Number.isNaN(n) ? 0 : n < 30 ? 2000 + n : 1900 + n;
};

/**
 * "more like this" (README 8-3): available pieces only, same category first, then the nearest era,
 * then new-in order; fill from other categories with the same rule. TODO(backend): compute on the server.
 */
export function moreLikeThis(id: string, count = 4) {
  const self = getProduct(id);
  if (!self) return [];
  const pool = products.filter((p) => p.id !== id && !p.sold);
  const order = new Map(products.map((p, i) => [p.id, i]));
  const rank = (p: Product) => Math.abs(eraYear(p.era) - eraYear(self.era));
  const sorted = (list: Product[]) => [...list].sort((a, b) => rank(a) - rank(b) || order.get(a.id)! - order.get(b.id)!);
  const same = sorted(pool.filter((p) => p.category === self.category));
  const other = sorted(pool.filter((p) => p.category !== self.category));
  return [...same, ...other].slice(0, count);
}
