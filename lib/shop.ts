import { catalog, products, type CategoryId, type Product } from './catalog';

export type SortId = 'new' | 'price-asc' | 'price-desc';

/**
 * Everything the shop list depends on (README 8-2). Lives in the URL:
 * `/shop?cat=outer`, `?brand=levis` / `?brand=vans,converse`, `?sort=price-asc`, `?sold=1`, `?q=iggy`.
 */
export type ShopQuery = {
  cat: CategoryId | 'all';
  brands: string[];
  sort: SortId;
  sold: boolean;
  q: string;
};

/** sessionStorage key: the last shop URL, so a product page's "back" keeps the view (README 8-3). */
export const LAST_SHOP_KEY = 'archivin:last-shop';

export const EMPTY_QUERY: ShopQuery = { cat: 'all', brands: [], sort: 'new', sold: false, q: '' };

const BRANDS = [...new Set(products.map((p) => p.brand).filter((b): b is string => !!b)), 'Vans'];

const slug = (v: string) =>
  v
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

type Params = { get(name: string): string | null };

export function parseShopQuery(params: Params): ShopQuery {
  const cat = params.get('cat');
  const sort = params.get('sort');
  const wanted = (params.get('brand') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return {
    cat: catalog.categories.some((c) => c.id === cat) ? (cat as CategoryId) : 'all',
    brands: BRANDS.filter((b) => wanted.includes(slug(b))),
    sort: sort === 'price-asc' || sort === 'price-desc' ? sort : 'new',
    sold: params.get('sold') === '1',
    q: params.get('q') ?? '',
  };
}

export function shopHref(q: Partial<ShopQuery>) {
  const s = new URLSearchParams();
  if (q.cat && q.cat !== 'all') s.set('cat', q.cat);
  if (q.brands?.length) s.set('brand', q.brands.map(slug).join(','));
  if (q.sort && q.sort !== 'new') s.set('sort', q.sort);
  if (q.sold) s.set('sold', '1');
  if (q.q) s.set('q', q.q);
  const str = s.toString().replace(/%2C/g, ',');
  return str ? `/shop?${str}` : '/shop';
}

/** Prototype search: name, brand, era and category (README 8-2). TODO: server search. */
function matchesText(p: Product, needle: string) {
  if (!needle) return true;
  return `${p.name} ${p.brand ?? ''} ${p.era} ${p.category}`.toLowerCase().includes(needle);
}

/**
 * Pieces for a query. Array order in data/products.json is "new in".
 * TODO: sort by the real listing date / price once the product API has them (prices are null for now,
 * so the price sorts keep the new-in order). Available pieces come first, sold ones after.
 */
export function filterProducts(q: ShopQuery) {
  const needle = q.q.trim().toLowerCase();
  const hits = products.filter(
    (p) =>
      (q.cat === 'all' || p.category === q.cat) &&
      (q.sold || !p.sold) &&
      (!q.brands.length || (p.brand != null && q.brands.includes(p.brand))) &&
      matchesText(p, needle),
  );
  if (q.sort !== 'new') {
    const dir = q.sort === 'price-asc' ? 1 : -1;
    hits.sort((a, b) => {
      if (a.price == null || b.price == null) return Number(a.price == null) - Number(b.price == null);
      return (a.price - b.price) * dir;
    });
  }
  return [...hits.filter((p) => !p.sold), ...hits.filter((p) => p.sold)];
}

/** Total next to "load more". 127 / 300 are fake display numbers for the plain "all" view (README 8-2). */
export function displayTotal(q: ShopQuery, realCount: number) {
  const plain = q.cat === 'all' && !q.brands.length && !q.q.trim();
  if (!plain) return realCount;
  return q.sold ? catalog.totals.includingSold : catalog.totals.available; // TODO: real totals
}

/** Entries in the category menu: categories, then brand shortcuts (all + brand). */
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

export function currentViewLabel(q: ShopQuery) {
  return CATEGORY_VIEWS.find((v) => isView(v, q))?.label ?? q.cat;
}

export function viewHref(v: CategoryView) {
  return shopHref({ cat: v.cat, brands: v.brands });
}

export const pieces = (n: number) => `${n} ${n === 1 ? 'piece' : 'pieces'}`;

/**
 * Update the shop URL. On /shop it uses the History API (Next keeps useSearchParams in sync),
 * so typing and sorting stay instant; anywhere else it's a normal navigation.
 */
export function goShop(href: string, opts: { replace?: boolean; onShop: boolean; push: (href: string) => void }) {
  if (opts.onShop && typeof window !== 'undefined') {
    window.history[opts.replace ? 'replaceState' : 'pushState'](null, '', href);
  } else {
    opts.push(href);
  }
}
