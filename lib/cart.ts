'use client';

import { useMemo } from 'react';
import { createPersistentStore } from './persistent-store';
import { products, type Review } from './catalog';

const EMPTY: string[] = [];

/**
 * Bag: product ids in the order they were added. Every piece is one of one, so no quantities.
 * Pieces aren't held until checkout — re-check stock when payment is connected.
 */
const bagStore = createPersistentStore<string[]>('archivin:bag', EMPTY);

const KNOWN = new Set(products.map((p) => p.id));

/** Bag ids, skipping anything that's no longer in the catalog (e.g. ids saved by the v1 site). */
export function useBag() {
  const ids = bagStore.useValue();
  return useMemo(() => (ids.every((id) => KNOWN.has(id)) ? ids : ids.filter((id) => KNOWN.has(id))), [ids]);
}

export function addToBag(id: string) {
  bagStore.set((ids) => (ids.includes(id) ? ids : [...ids, id]));
}

export function removeFromBag(id: string) {
  bagStore.set((ids) => ids.filter((x) => x !== id));
}

/** Reviews written on this device. TODO: POST to a reviews API once accounts and orders exist. */
const NO_REVIEWS: Review[] = [];
const myReviewStore = createPersistentStore<Review[]>('archivin:my-reviews', NO_REVIEWS);

export function useMyReviews() {
  return myReviewStore.useValue();
}

export function addMyReview(review: Review) {
  myReviewStore.set((list) => [review, ...list]);
}
