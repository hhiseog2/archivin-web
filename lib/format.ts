/** "₩ 480,000". Unknown prices stay as the design placeholder until real prices are in data/products.json. */
export function formatPrice(price: number | null | undefined) {
  if (price == null) return '₩ 000,000'; // TODO(client): real prices
  return `₩ ${price.toLocaleString('en-US')}`;
}

/** Sum of prices, or null when any price is still unknown. */
export function sumPrices(prices: (number | null)[]) {
  if (prices.some((p) => p == null)) return null;
  return prices.reduce<number>((acc, p) => acc + (p ?? 0), 0);
}

/** Thousands with commas: 2713 → "2,713". */
export function formatCount(n: number) {
  return n.toLocaleString('en-US');
}

/**
 * The one date format (README 7): "2026.10.08". Accepts a Date, an ISO string or an already-dotted string.
 */
export function formatDate(value: Date | string | null | undefined) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}\.\d{2}\.\d{2}$/.test(value)) return value;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** Masks a reviewer name to its first letter: "Minji" → "M****". Already-masked values pass through. */
export function maskName(name: string) {
  if (!name || name.includes('*')) return name;
  return `${name[0]}****`;
}
