import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { ReviewsView } from './ReviewsView';

export const metadata: Metadata = { title: 'Reviews' };

export default function ReviewsPage() {
  return (
    <SiteChrome fullWidth>
      <ReviewsView />
    </SiteChrome>
  );
}
