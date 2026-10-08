'use client';

import { createPersistentStore } from './persistent-store';
import { site } from './catalog';

/**
 * Prototype sign-in switch (no backend yet). `/signin` turns it on, my page "sign out" turns it off.
 * Stored in localStorage['archivin:signed-in'] as { email } or null.
 * TODO(backend): replace with the real member session (sign in · join · email check · password reset).
 */
export type Session = { email: string; name?: string } | null;

const store = createPersistentStore<Session>('archivin:signed-in', null);

export function useSession() {
  return store.useValue();
}

export function useSignedIn() {
  return store.useValue() != null;
}

export function signIn(email: string, name?: string) {
  store.set({ email, name });
}

export function signOut() {
  store.set(null);
}

/** Prices follow site.json pricing.visibility: "members" (archivin.kr today) or "everyone". */
export const PRICES_FOR_MEMBERS_ONLY = site.pricing.visibility === 'members';

/** Whether this visitor can see prices (and add to the bag / check out). */
export function useCanSeePrices() {
  const signedIn = useSignedIn();
  return !PRICES_FOR_MEMBERS_ONLY || signedIn;
}

/** "/signin?next=<path>" — after signing in or joining, the visitor comes back here. */
export function signInHref(next?: string) {
  return next ? `/signin?next=${encodeURIComponent(next)}` : '/signin';
}
