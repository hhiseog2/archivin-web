import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteChrome } from '@/components/SiteChrome';
import { site, type NoticeBlock } from '@/lib/catalog';
import { formatDate } from '@/lib/format';
import { sortedNotices } from '../sorted';
import styles from '../notice.module.css';

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return sortedNotices.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  return { title: sortedNotices.find((n) => n.id === id)?.title ?? 'notice' };
}

/** One body block from data/notices.json. Headings are UI (lowercase); titles and text stay as written. */
function Block({ block }: { block: NoticeBlock }) {
  switch (block.type) {
    case 'h':
      return <h2 className={styles.h}>{block.text}</h2>;
    case 'p':
      // TODO(client): "[N]" days, bank account, store-hours and 2021 notice bodies (data/notices.json _todo)
      return (
        <p className={`${styles.p} ${block.muted ? styles.muted : ''}`}>
          {block.text.replaceAll('{email}', site.contact.email)}
        </p>
      );
    case 'note-ko':
      return (
        <p lang="ko" className={styles.noteKo}>
          {block.text}
        </p>
      );
    case 'dl':
      return (
        <dl className={styles.dl}>
          {block.rows.map(([k, v]) => (
            <div key={k} className={styles.dlRow}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      );
    case 'link':
      return block.href.startsWith('/') ? (
        <Link href={block.href} className={styles.textLink}>
          {block.text}
        </Link>
      ) : (
        <a href={block.href} className={styles.textLink}>
          {block.text}
        </a>
      );
  }
}

/** A21_NoticePost · A21_DNoticePost (README 8-11). Desktop is one centred 560px column. */
export default async function NoticePostPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const idx = sortedNotices.findIndex((n) => n.id === id);
  if (idx < 0) notFound();
  const n = sortedNotices[idx];
  const next = sortedNotices[idx + 1];
  const ko = n.lang === 'ko' ? 'ko' : undefined;

  return (
    <SiteChrome fullWidth>
      <main className={styles.postMain}>
        <Link href="/notice" className={styles.back}>
          notice
        </Link>
        <article className={styles.article}>
          <p className={styles.meta}>
            {n.pinned && 'pinned · '}
            {formatDate(n.date)}
          </p>
          <h1 lang={ko} className={styles.postTitle}>
            {n.title}
          </h1>
          <div lang={ko} className={styles.body}>
            {n.body.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </div>
        </article>
        <nav aria-label="More notices" className={styles.more}>
          {next && (
            <Link href={`/notice/${next.id}`} className={styles.next}>
              <span className={styles.nextLabel}>next</span>
              <span lang={next.lang === 'ko' ? 'ko' : undefined}>{next.title}</span>
            </Link>
          )}
          <Link href="/notice" className={styles.textLink}>
            all notices
          </Link>
        </nav>
      </main>
    </SiteChrome>
  );
}
