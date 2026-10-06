import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SiteChrome } from '@/components/SiteChrome';
import { ShopView } from './ShopView';

export const metadata: Metadata = { title: 'Shop' };

export default function ShopPage() {
  return (
    <SiteChrome active="shop">
      <Suspense>
        <ShopView />
      </Suspense>
    </SiteChrome>
  );
}
