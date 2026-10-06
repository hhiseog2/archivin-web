import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SiteChrome } from '@/components/SiteChrome';
import { SearchView } from './SearchView';

export const metadata: Metadata = { title: 'Search' };

/** Mobile: standalone search screen. Desktop: header search bar open, results below. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  return (
    <SiteChrome mobileTopBar={false} mobileHeader={false} mobileFooter={false} desktopSearchOpen desktopQuery={q}>
      <Suspense>
        <SearchView />
      </Suspense>
    </SiteChrome>
  );
}
