import Link from 'next/link';
import { notices } from '@/lib/catalog';
import { Pagination } from '@/components/Pagination/Pagination';
import { NoticeAccordion } from './NoticeAccordion';
import { NoticeBody } from './NoticeBody';
import ui from '@/components/ui.module.css';
import styles from './notice.module.css';

/**
 * Notice list. Mobile: rows link to /notice/[id]. Desktop: rows expand in place (accordion).
 * `openId` is the row expanded on desktop when the page loads.
 */
export function NoticeList({ openId, mobile = true }: { openId?: string; mobile?: boolean }) {
  return (
    <main className={styles.main}>
      <div className={styles.head}>
        <h1 className={ui.pageTitle}>Notice</h1>
        <p className={ui.pageIntro}>Shipping, store hours and shop news.</p>
      </div>

      {mobile && (
        <ul className={`m-only ${styles.list}`}>
          {notices.map((n) => (
            <li key={n.id} className={styles.item}>
              <Link href={`/notice/${n.id}`} className={styles.mLink}>
                <span className={styles.mTitleRow}>
                  {n.pinned && <span className={ui.tag}>PINNED</span>}
                  <span lang={n.lang} className={`${styles.mTitle} ${n.pinned ? styles.bold : ''} ${n.lang === 'ko' ? styles.ko : ''}`}>
                    {n.title}
                  </span>
                </span>
                {/* TODO: notice dates */}
                <span className={styles.date}>{n.date ?? '[DATE]'}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <NoticeAccordion
        className="d-only"
        initialOpen={openId ?? notices[0]?.id}
        items={notices.map((n) => ({
          id: n.id,
          title: n.title,
          lang: n.lang,
          pinned: n.pinned,
          date: n.date ?? '[DATE]',
          body: <NoticeBody blocks={n.body} headingLevel={3} />,
        }))}
      />

      <Pagination page={1} pageCount={1} hrefFor={() => '/notice'} arrows={false} />
    </main>
  );
}
