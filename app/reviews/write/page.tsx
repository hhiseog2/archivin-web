import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { ReviewsView } from '../ReviewsView';
import { WriteReviewMobile } from './WriteReviewMobile';

export const metadata: Metadata = { title: 'Write a review' };

/** Mobile: the full-page form. Desktop: the reviews page with the form already open. */
export default function WriteReviewPage() {
  return (
    <SiteChrome active="reviews" mobileFooter={false}>
      <div className="m-only">
        <WriteReviewMobile />
      </div>
      <div className="d-only">
        <ReviewsView initialWriting />
      </div>
    </SiteChrome>
  );
}
