import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight } from '@/components/Icons';
import { SiteChrome } from '@/components/SiteChrome';
import { notices } from '@/lib/catalog';
import { NoticeBody } from '../NoticeBody';
import { NoticeList } from '../NoticeList';
import ui from '@/components/ui.module.css';
import styles from '../notice.module.css';

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return notices.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  return { title: notices.find((n) => n.id === id)?.title ?? 'Notice' };
}

/** Mobile: the notice on its own page. Desktop: the list with this notice expanded. */
export default async function NoticePostPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const idx = notices.findIndex((n) => n.id === id);
  if (idx < 0) notFound();
  const n = notices[idx];
  const next = notices[idx + 1];

  return (
    <SiteChrome>
      <div className={`m-only ${styles.post}`}>
        <nav aria-label="Breadcrumb" className={styles.back}>
          <Link href="/notice" className={styles.backLink}>
            <ChevronLeft />
            Notice
          </Link>
        </nav>

        <main className={styles.main}>
          <article className={styles.article}>
            <header className={styles.articleHead}>
              {n.pinned && <span className={ui.tag}>PINNED</span>}
              <h1 lang={n.lang} className={`${ui.pageTitle} ${styles.articleTitle} ${n.lang === 'ko' ? styles.ko : ''}`}>
                {n.title}
              </h1>
              {/* TODO: notice date */}
              <p className={styles.byline}>ARCHIVIN · {n.date ?? '[DATE]'}</p>
            </header>
            <NoticeBody blocks={n.body} headingLevel={2} />
          </article>

          {next && (
            <nav aria-label="More notices" className={styles.more}>
              <Link href={`/notice/${next.id}`} className={styles.nextLink}>
                <span className={styles.nextText}>
                  <span className={styles.nextKicker}>Next</span>
                  <span lang={next.lang} className={next.lang === 'ko' ? styles.ko : undefined}>
                    {next.title}
                  </span>
                </span>
                <ChevronRight />
              </Link>
            </nav>
          )}
          <div className={styles.allWrap}>
            <Link href="/notice" className={ui.btnSecondary}>
              All notices
            </Link>
          </div>
        </main>
      </div>

      <div className="d-only">
        <NoticeList openId={n.id} mobile={false} />
      </div>
    </SiteChrome>
  );
}
