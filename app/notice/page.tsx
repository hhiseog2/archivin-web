import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';
import { formatDate } from '@/lib/format';
import { sortedNotices } from './sorted';
import styles from './notice.module.css';

export const metadata: Metadata = { title: 'notice' };

/**
 * A21_Notice · A21_DNotice (README 8-11). Rows split by space only; each row is one link.
 * Hover underlines the title (`.nt`) only. No page numbers. TODO(backend): load more once there are many.
 */
export default function NoticePage() {
  return (
    <SiteChrome fullWidth>
      <main className={styles.listMain}>
        <h1 className={styles.title}>notice</h1>
        <p className={styles.intro}>shipping, store hours and shop news.</p>
        <ul className={styles.nlist}>
          {sortedNotices.map((n) => (
            <li key={n.id}>
              <Link href={`/notice/${n.id}`} className={styles.row}>
                <span>
                  {n.pinned && <span className={styles.pinned}>pinned · </span>}
                  <span lang={n.lang === 'ko' ? 'ko' : undefined} className={styles.nt}>
                    {n.title}
                  </span>
                </span>
                <span className={styles.date}>{formatDate(n.date)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </SiteChrome>
  );
}
