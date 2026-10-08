import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';
import { lookbooks } from '@/lib/catalog';
import styles from './lookbook.module.css';

export const metadata: Metadata = { title: 'lookbook' };

/** A21_Lookbook · A21_DLookbook (README 8-13): the issue list. Each issue is one link (`.lbcard`). */
export default function LookbookPage() {
  return (
    <SiteChrome fullWidth>
      <main className={styles.listMain}>
        <h1 className={styles.title}>lookbook</h1>
        <p className={styles.intro}>pieces from the shop, styled. one issue at a time.</p>
        <ul className={styles.issues}>
          {lookbooks.map((lb) => (
            <li key={lb.n}>
              <Link href={`/lookbook/${lb.n}`} className={styles.lbcard}>
                {/* TODO(client): cover photos (4:5) */}
                {lb.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lb.cover} alt="" className={styles.photo45} />
                ) : (
                  <div role="img" aria-label="cover photo · 4:5" className={`${styles.well} ${styles.photo45}`}>
                    [cover photo · 4:5]
                  </div>
                )}
                <span className={styles.cardTitle}>
                  <span className={styles.lbt}>{lb.title}</span>
                </span>
                <span className={styles.cardMeta}>
                  {lb.season} · {lb.lookCount} looks
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </SiteChrome>
  );
}
