import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { ReviewsView } from './ReviewsView';

export const metadata: Metadata = { title: 'Reviews' };

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ posted?: string }> }) {
  const { posted } = await searchParams;
  return (
    <SiteChrome>
      <ReviewsView justPosted={posted === '1'} />
    </SiteChrome>
  );
}
