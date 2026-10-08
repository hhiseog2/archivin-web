'use client';

import { useSyncExternalStore } from 'react';

/**
 * Which shop popup is open ("all ▾" or sort). Only one at a time; opening search or the menu
 * closes both (README 8-2). The category menu sits in the desktop header and sort in the shop row,
 * so they share this tiny store instead of props.
 */
export type PopupId = 'cat' | 'sort' | 'size' | 'shopnav' | null;

let current: PopupId = null;
const listeners = new Set<() => void>();

export function setPopup(next: PopupId) {
  if (next === current) return;
  current = next;
  listeners.forEach((l) => l());
}

export function usePopup() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}
