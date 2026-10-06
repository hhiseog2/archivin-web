import Link from 'next/link';
import { ChevronLeft, ChevronRight } from '../Icons';
import styles from './Pagination.module.css';

/** Square 44px page links. `hrefFor(n)` builds each page URL. Shows at most 5 numbers. */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  arrows = true,
}: {
  page: number;
  pageCount: number;
  hrefFor: (n: number) => string;
  arrows?: boolean;
}) {
  const count = Math.max(1, pageCount);
  const start = Math.max(1, Math.min(page - 2, count - 4));
  const numbers = Array.from({ length: Math.min(5, count) }, (_, i) => start + i);
  return (
    <nav aria-label="Pages" className={styles.nav}>
      {arrows &&
        (page > 1 ? (
          <Link href={hrefFor(page - 1)} aria-label="Previous page" className={styles.cell}>
            <ChevronLeft />
          </Link>
        ) : (
          <span role="link" aria-disabled="true" aria-label="Previous page" className={`${styles.cell} ${styles.disabled}`}>
            <ChevronLeft />
          </span>
        ))}
      {numbers.map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          aria-label={`Page ${n}`}
          aria-current={n === page ? 'page' : undefined}
          className={`${styles.cell} ${styles.num}`}
        >
          {n}
        </Link>
      ))}
      {arrows &&
        (page < count ? (
          <Link href={hrefFor(page + 1)} aria-label="Next page" className={styles.cell}>
            <ChevronRight />
          </Link>
        ) : (
          <span role="link" aria-disabled="true" aria-label="Next page" className={`${styles.cell} ${styles.disabled}`}>
            <ChevronRight />
          </span>
        ))}
    </nav>
  );
}
