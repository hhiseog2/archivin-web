import { catalog, products, type CategoryId, type Product } from './catalog';

export type SortId = 'new' | 'price-asc' | 'price-desc';

/** Everything the shop list depends on. Lives in the URL so back/forward and links keep it. */
export type ShopQuery = {
  cat: CategoryId | 'all';
  brands: string[];
  sizes: string[];
  eras: string[];
  sold: boolean;
  sort: SortId;
};

export type ShopFilters = Pick<ShopQuery, 'brands' | 'sizes' | 'eras' | 'sold'>;

/** sessionStorage key: the last shop URL, so a product page's "back" keeps filters (README 8-3). */
export const LAST_SHOP_KEY = 'archivin:last-shop';

export const EMPTY_QUERY: ShopQuery = { cat: 'all', brands: [], sizes: [], eras: [], sold: false, sort: 'new' };

const slug = (v: string) =>
  v
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const fromSlugs = (raw: string | null, values: string[]) => {
  if (!raw) return [];
  const wanted = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return values.filter((v) => wanted.includes(slug(v)));
};

type Params = { get(name: string): string | null };

export function parseShopQuery(params: Params): ShopQuery {
  const cat = params.get('cat');
  const sort = params.get('sort');
  return {
    cat: catalog.categories.some((c) => c.id === cat) ? (cat as CategoryId) : 'all',
    brands: fromSlugs(params.get('brand'), catalog.filters.brands),
    sizes: fromSlugs(params.get('size'), catalog.filters.sizes),
    eras: fromSlugs(params.get('era'), catalog.filters.eras),
    sold: params.get('sold') === '1',
    sort: sort === 'price-asc' || sort === 'price-desc' ? sort : 'new',
  };
}

/** `/shop?cat=outer&brand=levis&size=m,l&era=90s&sold=1&sort=price-asc` (empty parts left out). */
export function shopHref(q: Partial<ShopQuery>) {
  const s = new URLSearchParams();
  if (q.cat && q.cat !== 'all') s.set('cat', q.cat);
  if (q.brands?.length) s.set('brand', q.brands.map(slug).join(','));
  if (q.sizes?.length) s.set('size', q.sizes.map(slug).join(','));
  if (q.eras?.length) s.set('era', q.eras.map(slug).join(','));
  if (q.sold) s.set('sold', '1');
  if (q.sort && q.sort !== 'new') s.set('sort', q.sort);
  const str = s.toString().replace(/%2C/g, ',');
  return str ? `/shop?${str}` : '/shop';
}

function matches(p: Product, f: ShopFilters, cat: ShopQuery['cat']) {
  if (cat !== 'all' && p.category !== cat) return false;
  if (p.sold && !f.sold) return false;
  if (f.brands.length && !(p.brand && f.brands.includes(p.brand))) return false;
  if (f.sizes.length && !p.sizes.some((z) => f.sizes.includes(z))) return false;
  if (f.eras.length && !f.eras.includes(p.era)) return false;
  return true;
}

/**
 * Pieces for a query. Array order in data/products.json is "new in".
 * TODO: sort by the real listing date / price once the product API has them (prices are null for now,
 * so price sorts keep the new-in order). Available pieces come first, sold ones after.
 */
export function filterProducts(q: ShopQuery) {
  const hits = products.filter((p) => matches(p, q, q.cat));
  if (q.sort !== 'new') {
    const dir = q.sort === 'price-asc' ? 1 : -1;
    hits.sort((a, b) => {
      if (a.price == null || b.price == null) return Number(a.price == null) - Number(b.price == null);
      return (a.price - b.price) * dir;
    });
  }
  return [...hits.filter((p) => !p.sold), ...hits.filter((p) => p.sold)];
}

/** Total shown next to "load more". 127 / 300 are fake display numbers for the plain "all" view (README 8-2). */
export function displayTotal(q: Pick<ShopQuery, 'cat'> & ShopFilters, realCount: number) {
  const plain = q.cat === 'all' && !q.brands.length && !q.sizes.length && !q.eras.length;
  if (!plain) return realCount;
  return q.sold ? catalog.totals.includingSold : catalog.totals.available; // TODO: real totals
}

export function activeFilterCount(f: ShopFilters) {
  return (f.sold ? 1 : 0) + f.brands.length + f.sizes.length + f.eras.length;
}

/** Entries in the category menu: categories, then brand shortcuts (all + brand filter). */
export type CategoryView = { label: string; cat: ShopQuery['cat']; brands: string[]; gapBefore: boolean };

export const CATEGORY_VIEWS: CategoryView[] = [
  { label: 'all', cat: 'all', brands: [], gapBefore: false },
  ...catalog.categories.map((c) => ({ label: c.label, cat: c.id, brands: [], gapBefore: false })),
  ...catalog.brandShortcuts.map((b, i) => ({ label: b.label, cat: 'all' as const, brands: b.brands, gapBefore: i === 0 })),
];

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

export function isView(v: CategoryView, q: ShopQuery) {
  return q.cat === v.cat && sameSet(q.brands, v.brands);
}

/** Picking a view: brands follow the view, sizes reset when the category changes, the rest stays. */
export function queryForView(v: CategoryView, q: ShopQuery): ShopQuery {
  return { ...q, cat: v.cat, brands: [...v.brands], sizes: v.cat === q.cat ? q.sizes : [] };
}

export function currentViewLabel(q: ShopQuery) {
  return CATEGORY_VIEWS.find((v) => isView(v, q))?.label ?? q.cat;
}

export const pieces = (n: number) => `${n} ${n === 1 ? 'piece' : 'pieces'}`;

/** Filter chips show lowercase brand names and "one size"; data keeps the original spelling (README 8-2). */
export const chipLabel = (v: string) => (v === 'One size' ? 'one size' : v.toLowerCase());
