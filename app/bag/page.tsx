import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { BagView } from './BagView';

export const metadata: Metadata = { title: 'Bag' };

export default function BagPage() {
  return (
    <SiteChrome>
      <BagView />
    </SiteChrome>
  );
}
