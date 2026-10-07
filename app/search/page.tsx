import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SiteChrome } from '@/components/SiteChrome';
import { SearchView } from './SearchView';

export const metadata: Metadata = { title: 'Search' };

/** Mobile: standalone search screen (no header). Desktop: header, then the search bar and results. */
export default function SearchPage() {
  return (
    <SiteChrome mobileHeader={false}>
      <Suspense>
        <SearchView />
      </Suspense>
    </SiteChrome>
  );
}
