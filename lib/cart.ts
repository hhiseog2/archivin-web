'use client';

import { useMemo, useSyncExternalStore } from 'react';
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

/**
 * Adds a piece. The UI switches to "it's yours · view bag" straight away (README 8-3).
 * TODO: when the bag moves to a server, keep this optimistic update and roll it back (removeFromBag + a
 * status message) if the request fails — e.g. the piece sold in the meantime.
 */
export function addToBag(id: string) {
  const before = bagStore.get();
  if (before.includes(id)) return;
  bagStore.set((ids) => (ids.includes(id) ? ids : [...ids, id]));
  addSeq += 1;
  addListeners.forEach((l) => l());
}

/** Counts adds made in this tab, so the bag ring re-sews on a real add — not when the saved bag loads. */
let addSeq = 0;
const addListeners = new Set<() => void>();

export function useAddSeq() {
  return useSyncExternalStore(
    (l) => {
      addListeners.add(l);
      return () => addListeners.delete(l);
    },
    () => addSeq,
    () => 0,
  );
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
