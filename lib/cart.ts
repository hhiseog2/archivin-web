'use client';

import { createPersistentStore } from './persistent-store';
import type { Review } from './catalog';

const EMPTY: string[] = [];

/** Bag: product ids in the order they were added. Every piece is one of one, so no quantities. */
const bagStore = createPersistentStore<string[]>('archivin:bag', EMPTY);

export function useBag() {
  return bagStore.useValue();
}

export function addToBag(id: string) {
  bagStore.set((ids) => (ids.includes(id) ? ids : [...ids, id]));
}

export function removeFromBag(id: string) {
  bagStore.set((ids) => ids.filter((x) => x !== id));
}

/** Wishlist (no account yet, so it lives on this device). TODO: move to the account once sign-in exists. */
const wishStore = createPersistentStore<string[]>('archivin:wishlist', EMPTY);

export function useWishlist() {
  return wishStore.useValue();
}

export function toggleWishlist(id: string) {
  wishStore.set((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
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
