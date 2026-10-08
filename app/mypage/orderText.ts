import { getProduct } from '@/lib/catalog';
import { sumPrices } from '@/lib/format';
import type { Order } from '@/lib/orders';

/** Order status is text, never colour (README 8-9 / 11). `withTime` adds the 23:59 deadline (guest lookup, 8-6 ④). */
export function statusLine(o: Order, withTime = false) {
  if (o.status === 'waiting for payment' && o.payBy) return `${o.status} · pay by ${o.payBy}${withTime ? ' 23:59' : ''}`;
  if (o.status === 'delivered' && o.deliveredAt) return `${o.status} · ${o.deliveredAt}`;
  return o.status;
}

export function piecesLabel(o: Order) {
  return `${o.items.length} ${o.items.length === 1 ? 'piece' : 'pieces'}`;
}

/** First photo of each piece in the order (48×64 thumbnails). */
export function orderPhotos(o: Order) {
  return o.items.map((id) => ({ id, src: getProduct(id)?.images[0]?.src ?? null }));
}

export function orderTotal(o: Order) {
  return sumPrices(o.items.map((id) => getProduct(id)?.price ?? null));
}
