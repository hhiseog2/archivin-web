'use client';

import { createPersistentStore } from './persistent-store';
import { checkoutConfig } from './catalog';
import { formatDate } from './format';

/**
 * Prototype orders (no backend). Checkout saves the order here and routes to `/order/complete?id=…`;
 * my page lists them after the design samples in data/checkout.json.
 * TODO(backend): save orders on the server (stock check right before payment, PG card window,
 * bank-transfer auto-cancel after `depositDays` days, guest order lookup).
 */
export type OrderStatus = 'waiting for payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  method: 'card' | 'bank';
  items: string[];
  payBy?: string;
  deliveredAt?: string;
  depositor?: string;
  email?: string;
  shipTo?: { name: string; phone: string; address: string };
  note?: string;
  /** Private payment link (`/pay/[code]`, README 8-16): the order is this one line instead of bag pieces. */
  privatePay?: { code: string; title: string; amount: number | null; shippingIncluded: boolean };
};

export const SAMPLE_ORDERS = checkoutConfig.orderSamples as Order[];

const NONE: Order[] = [];
const store = createPersistentStore<Order[]>('archivin:orders', NONE);

export function useMyOrders() {
  return store.useValue();
}

export function getOrder(id: string, mine: Order[]) {
  return mine.find((o) => o.id === id) ?? SAMPLE_ORDERS.find((o) => o.id === id);
}

export function saveOrder(order: Order) {
  store.set((list) => [order, ...list.filter((o) => o.id !== order.id)]);
}

/** "20261008-0001" style number. TODO(backend): the server issues order numbers. */
export function newOrderId(now = new Date()) {
  const day = formatDate(now).replace(/\./g, '');
  // Skip numbers the design samples already use (20261008-0001).
  const taken = new Set([...store.get(), ...SAMPLE_ORDERS].map((o) => o.id));
  let i = 1;
  while (taken.has(`${day}-${i.toString().padStart(4, '0')}`)) i += 1;
  const n = i.toString().padStart(4, '0');
  return `${day}-${n}`;
}

/** Bank transfer pay-by date: today + depositDays (7). */
export function payByDate(now = new Date()) {
  const d = new Date(now);
  d.setDate(d.getDate() + (checkoutConfig.depositDays ?? 7));
  return formatDate(d);
}
