'use client';

import { useSyncExternalStore } from 'react';

/**
 * Tiny localStorage-backed store. Server render and the first client render use `initial`,
 * then the saved value takes over (no hydration mismatch). Syncs across tabs.
 */
export function createPersistentStore<T>(key: string, initial: T) {
  let value: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === 'undefined') return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) value = JSON.parse(raw) as T;
    } catch {
      // Private mode or blocked storage: keep the in-memory value.
    }
  };

  const emit = () => listeners.forEach((l) => l());

  const get = () => {
    load();
    return value;
  };

  const set = (next: T | ((prev: T) => T)) => {
    load();
    value = typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
    emit();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        value = e.newValue == null ? initial : (JSON.parse(e.newValue) as T);
      } catch {
        value = initial;
      }
      emit();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  };

  const useValue = () => useSyncExternalStore(subscribe, get, () => initial);

  return { get, set, subscribe, useValue };
}
