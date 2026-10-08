import { catalog, products, type CategoryId, type Product } from './catalog';
import { formatCount } from './format';

export type SortId = 'new' | 'price-asc' | 'price-desc';

/**
 * Everything the shop list depends on (README 8-2). Lives in the URL:
 * `/shop?cat=tops&sub=tees`, `?brand=levis&sub=517`, `?brand=vans,converse`, `?sort=price-asc`, `?sold=1`,
 * `?q=iggy`, `?size=l,xl&waist=32,34&shoe=270`.
 */
export type ShopQuery = {
  cat: CategoryId | 'all';
  brands: string[];
  /** Subcategory id (`tees`, `517`, `vans` …). null = the view's "all". */
  sub: string | null;
  sort: SortId;
  sold: boolean;
  q: string;
  /** Recommended-fit letters, lowercase, s → xxl. */
  size: string[];
  /** Bottoms waist in inches, small → large. */
  waist: number[];
  /** Shoes in mm, small → large. */
  shoe: number[];
};

export type SizePick = Pick<ShopQuery, 'size' | 'waist' | 'shoe'>;

/** sessionStorage key: the last shop URL, so a product page's "back" keeps the view (README 8-3). */
export const LAST_SHOP_KEY = 'archivin:last-shop';
/** localStorage key: the sizes this device picked last (README 8-2 "기억 · URL"). */
export const SIZE_KEY = 'archivin:size';

export const EMPTY_SIZE: SizePick = { size: [], waist: [], shoe: [] };
export const EMPTY_QUERY: ShopQuery = { cat: 'all', brands: [], sub: null, sort: 'new', sold: false, q: '', ...EMPTY_SIZE };

const BRANDS = [
  ...new Set([...products.map((p) => p.brand).filter((b): b is string => !!b), ...catalog.brandShortcuts.flatMap((b) => b.brands)]),
];

const slug = (v: string) =>
  v
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

type Params = { get(name: string): string | null; has?(name: string): boolean };

const list = (v: string | null) =>
  (v ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

const LETTERS = catalog.size.letters;
const sortLetters = (xs: string[]) => LETTERS.filter((l) => xs.includes(l));
const sortNums = (xs: number[]) => [...new Set(xs)].sort((a, b) => a - b);

export function normalizeSize(p: Partial<SizePick> | null | undefined): SizePick {
  return {
    size: sortLetters((p?.size ?? []).map((s) => String(s).toLowerCase())),
    waist: sortNums((p?.waist ?? []).map(Number).filter((n) => catalog.size.waistInch.includes(n))),
    shoe: sortNums((p?.shoe ?? []).map(Number).filter((n) => catalog.size.shoesMm.includes(n))),
  };
}

/** True when the URL carries any size · waist · shoe parameter (otherwise the remembered sizes apply). */
export function hasSizeParams(params: Params) {
  return params.get('size') != null || params.get('waist') != null || params.get('shoe') != null;
}

export function parseShopQuery(params: Params): ShopQuery {
  const cat = params.get('cat');
  const sort = params.get('sort');
  const wanted = list(params.get('brand'));
  const q: ShopQuery = {
    cat: catalog.categories.some((c) => c.id === cat) ? (cat as CategoryId) : 'all',
    brands: BRANDS.filter((b) => wanted.includes(slug(b))),
    sub: null,
    sort: sort === 'price-asc' || sort === 'price-desc' ? sort : 'new',
    sold: params.get('sold') === '1',
    q: params.get('q') ?? '',
    ...normalizeSize({ size: list(params.get('size')), waist: list(params.get('waist')).map(Number), shoe: list(params.get('shoe')).map(Number) }),
  };
  const sub = params.get('sub');
  if (sub && subsFor(q).some((s) => s.id === sub)) q.sub = sub;
  return q;
}

export function shopHref(q: Partial<ShopQuery>) {
  const s = new URLSearchParams();
  if (q.cat && q.cat !== 'all') s.set('cat', q.cat);
  if (q.brands?.length) s.set('brand', q.brands.map(slug).join(','));
  if (q.sub) s.set('sub', q.sub);
  if (q.sort && q.sort !== 'new') s.set('sort', q.sort);
  if (q.sold) s.set('sold', '1');
  if (q.q) s.set('q', q.q);
  if (q.size?.length) s.set('size', q.size.join(','));
  if (q.waist?.length) s.set('waist', q.waist.join(','));
  if (q.shoe?.length) s.set('shoe', q.shoe.join(','));
  const str = s.toString().replace(/%2C/g, ',');
  return str ? `/shop?${str}` : '/shop';
}

/* ---------- views (category menu entries) ---------- */

/** Entries in the category menu: categories, then brand shortcuts (all + brand). */
export type CategoryView = { label: string; cat: ShopQuery['cat']; brands: string[]; gapBefore: boolean };

export const CATEGORY_VIEWS: CategoryView[] = [
  { label: 'all', cat: 'all', brands: [], gapBefore: false },
  ...catalog.categories.map((c) => ({ label: c.label, cat: c.id, brands: [], gapBefore: false })),
  ...catalog.brandShortcuts.map((b, i) => ({ label: b.label, cat: 'all' as const, brands: b.brands, gapBefore: i === 0 })),
];

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

export function isView(v: CategoryView, q: Pick<ShopQuery, 'cat' | 'brands'>) {
  return q.cat === v.cat && sameSet(q.brands, v.brands);
}

export function currentViewLabel(q: Pick<ShopQuery, 'cat' | 'brands'>) {
  return CATEGORY_VIEWS.find((v) => isView(v, q))?.label ?? q.cat;
}

/** Changing the view resets the subcategory to "all" (sizes stay — README 8-2). */
export function viewHref(v: CategoryView, keep?: Partial<ShopQuery>) {
  return shopHref({ ...keep, cat: v.cat, brands: v.brands, sub: null });
}

/* ---------- subcategory row ---------- */

export type SubDef = { id: string; label: string };

/** Subcategory row for the current view (empty for all · outer · shoes). */
export function subsFor(q: Pick<ShopQuery, 'cat' | 'brands'>): SubDef[] {
  const shortcut = catalog.brandShortcuts.find((b) => q.cat === 'all' && sameSet(q.brands, b.brands));
  if (shortcut) return shortcut.subs.map((id) => ({ id, label: id }));
  if (q.brands.length) return [];
  const cat = catalog.categories.find((c) => c.id === q.cat);
  return cat ? cat.subs.map((s) => ({ id: s.id, label: s.label })) : [];
}

function matchesSub(p: Product, q: ShopQuery) {
  if (!q.sub) return true;
  const shortcut = catalog.brandShortcuts.find((b) => q.cat === 'all' && sameSet(q.brands, b.brands));
  if (shortcut?.subsBy === 'model') {
    const named = shortcut.subs.filter((s) => s !== 'others');
    return q.sub === 'others' ? !named.includes(String(p.model ?? '')) : String(p.model ?? '') === q.sub;
  }
  if (shortcut?.subsBy === 'brand') return (p.brand ?? '').toLowerCase() === q.sub;
  return p.sub === q.sub;
}

/* ---------- size filter ---------- */

export type SizeGroup = 'letters' | 'waistInch' | 'shoesMm';

/** Which chip groups the size window shows for this view (accessories: none → the button hides). */
export function sizeGroupsFor(q: Pick<ShopQuery, 'cat' | 'brands'>): SizeGroup[] {
  return catalog.size.groupsByView[currentViewLabel(q)] ?? catalog.size.groupsByView[q.cat] ?? [];
}

/** Only the picked values that count in this view (README 8-2: shoes mm don't count on tops). */
export function relevantSize(q: ShopQuery): SizePick {
  const g = sizeGroupsFor(q);
  return {
    size: g.includes('letters') ? q.size : [],
    waist: g.includes('waistInch') ? q.waist : [],
    shoe: g.includes('shoesMm') ? q.shoe : [],
  };
}

export function hasRelevantSize(q: ShopQuery) {
  const r = relevantSize(q);
  return r.size.length + r.waist.length + r.shoe.length > 0;
}

/** `size` → `size · l, xl` → `size · l, w32 +1`. */
export function sizeButtonLabel(q: ShopQuery) {
  const r = relevantSize(q);
  const vals = [...r.size, ...r.waist.map((w) => `w${w}`), ...r.shoe.map(String)];
  if (!vals.length) return 'size';
  return `size · ${vals.slice(0, 2).join(', ')}${vals.length > 2 ? ` +${vals.length - 2}` : ''}`;
}

/**
 * Fit, not tag size: clothing by `sizes`, bottoms by `waist`, shoes by `fitMm`.
 * A group with nothing picked doesn't filter; accessories never do.
 */
function matchesSize(p: Product, r: SizePick) {
  if (p.category === 'outer' || p.category === 'tops') {
    return !r.size.length || p.sizes.some((s) => r.size.includes(s.toLowerCase()));
  }
  if (p.category === 'bottoms') return !r.waist.length || (p.waist != null && r.waist.includes(p.waist));
  if (p.category === 'shoes') return !r.shoe.length || (p.fitMm != null && r.shoe.includes(p.fitMm));
  return true;
}

export function readSizeMemory(): SizePick | null {
  try {
    const raw = window.localStorage.getItem(SIZE_KEY);
    if (!raw) return null;
    const v = normalizeSize(JSON.parse(raw));
    return v.size.length + v.waist.length + v.shoe.length ? v : null;
  } catch {
    return null;
  }
}

export function writeSizeMemory(v: SizePick) {
  try {
    if (v.size.length + v.waist.length + v.shoe.length) window.localStorage.setItem(SIZE_KEY, JSON.stringify(v));
    else window.localStorage.removeItem(SIZE_KEY);
  } catch {
    // ignore
  }
}

/* ---------- list ---------- */

/** Prototype search: name, brand, era and category (README 8-2). TODO(backend): server search. */
function matchesText(p: Product, needle: string) {
  if (!needle) return true;
  return `${p.name} ${p.brand ?? ''} ${p.era} ${p.category}`.toLowerCase().includes(needle);
}

/**
 * Pieces for a query. Array order in data/products.json is "new in".
 * TODO(backend): sort by the real listing date / price on the server. Available pieces first, sold after.
 */
export function filterProducts(q: ShopQuery) {
  const needle = q.q.trim().toLowerCase();
  const r = relevantSize(q);
  const hits = products.filter(
    (p) =>
      (q.cat === 'all' || p.category === q.cat) &&
      (q.sold || !p.sold) &&
      (!q.brands.length || (p.brand != null && q.brands.includes(p.brand))) &&
      matchesSub(p, q) &&
      matchesSize(p, r) &&
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

/**
 * Total next to "load more", with thousands commas. The plain "all" view shows archivin.kr's totals
 * (338 / 2,713 on 2026.10.08); anything filtered shows the real count. TODO(backend): count on the server.
 */
export function displayTotal(q: ShopQuery, realCount: number) {
  const plain = q.cat === 'all' && !q.brands.length && !q.sub && !q.q.trim() && !hasRelevantSize(q);
  if (!plain) return formatCount(realCount);
  return formatCount(q.sold ? catalog.totals.includingSold : catalog.totals.available);
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
