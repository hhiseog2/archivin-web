import { redirect } from 'next/navigation';
import { shopHref } from '@/lib/shop';

/** v5: search lives on the shop (README 8-2, CHANGES 6). `/search?q=iggy` → `/shop?q=iggy`. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const term = (Array.isArray(q) ? q[0] : q)?.trim() ?? '';
  redirect(shopHref({ q: term }));
}
