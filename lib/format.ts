/** "₩ 480,000". Unknown prices stay as the design placeholder until real prices are in data/products.json. */
export function formatPrice(price: number | null | undefined) {
  if (price == null) return '₩ 000,000'; // TODO: real price
  return `₩ ${price.toLocaleString('en-US')}`;
}

/** Sum of prices, or null when any price is still unknown. */
export function sumPrices(prices: (number | null)[]) {
  if (prices.some((p) => p == null)) return null;
  return prices.reduce<number>((acc, p) => acc + (p ?? 0), 0);
}

export function sizeLabel(size: string | null | undefined) {
  return size ?? '[SIZE]'; // TODO: real size
}
