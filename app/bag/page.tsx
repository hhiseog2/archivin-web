import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { BagView } from './BagView';

export const metadata: Metadata = { title: 'Bag' };

/** A21_Bag. No footer (README 5). */
export default function BagPage() {
  return (
    <SiteChrome footer={false} fullWidth>
      <BagView />
    </SiteChrome>
  );
}
