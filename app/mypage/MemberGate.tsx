'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { signInHref, signOut, useSession, type Session } from '@/lib/auth';

const noop = () => () => {};

/** Set while "sign out" leaves for /shop, so the gate doesn't bounce the visitor to /signin on the way out. */
let leaving = false;

/** my page "sign out": sign out and go to /shop (README 8-9). */
export function signOutAndLeave(router: ReturnType<typeof useRouter>, href = '/shop') {
  leaving = true;
  signOut();
  router.push(href);
}

/**
 * My page is for signed-in members only (README 4 · 8-9). The session lives in localStorage, so nothing renders
 * until the client knows it (no flash of the signed-out page); signed-out visitors go to /signin?next=<this page>.
 * TODO(backend): check the member session on the server instead.
 */
export function MemberGate({ path, children }: { path: string; children: (session: NonNullable<Session>) => ReactNode }) {
  const router = useRouter();
  const session = useSession();
  // false on the server and while hydrating, true after — by then useSession() holds the saved value too.
  const known = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    leaving = false;
  }, []);

  useEffect(() => {
    if (known && !session && !leaving) router.replace(signInHref(path));
  }, [known, session, path, router]);

  if (!known || !session) return null;
  return <>{children(session)}</>;
}
