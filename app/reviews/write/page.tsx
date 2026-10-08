import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { ReviewWrite } from './ReviewWrite';

export const metadata: Metadata = { title: 'Write a review' };

/** `?piece=<product id>` preselects the piece (e.g. from a delivered order on my page). */
export default async function WriteReviewPage({ searchParams }: { searchParams: Promise<{ piece?: string }> }) {
  const { piece } = await searchParams;
  return (
    <SiteChrome fullWidth>
      <ReviewWrite initialPiece={typeof piece === 'string' ? piece : undefined} />
    </SiteChrome>
  );
}
