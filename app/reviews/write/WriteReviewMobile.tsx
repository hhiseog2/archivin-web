'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from '@/components/Icons';
import { ReviewForm } from '../ReviewForm';
import styles from '../reviews.module.css';

export function WriteReviewMobile() {
  const router = useRouter();
  return (
    <>
      <nav aria-label="Breadcrumb" className={styles.back}>
        <Link href="/reviews" className={styles.backLink}>
          <ChevronLeft />
          Reviews
        </Link>
      </nav>
      <main className={styles.writeMain}>
        <ReviewForm variant="page" idPrefix="r" onPosted={() => router.push('/reviews?posted=1')} />
      </main>
    </>
  );
}
