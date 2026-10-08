import Link from 'next/link';
import { Accordion } from '@/components/Accordion/Accordion';
import { policies, site } from '@/lib/catalog';
import styles from './policy.module.css';

type Doc = 'terms' | 'privacy';

const DOCS: Record<Doc, { title: string; ko: string; href: string }> = {
  terms: { title: 'terms of use', ko: '이용약관', href: '/terms' },
  privacy: { title: 'privacy policy', ko: '개인정보처리방침', href: '/privacy' },
};

/**
 * 이용약관 · 개인정보처리방침 (README 8-15, A21_Policy · A21_DPolicy `doc`). One frame for both routes;
 * the two buttons at the top are links between /terms and /privacy.
 * TODO(client): final legal text — archivin.kr still has the cafe24 samples. Article titles follow the FTC
 * standard terms and the bodies in data/policies.json are placeholders (`[본문]` shows in ink-2).
 */
export function PolicyView({ doc }: { doc: Doc }) {
  const d = DOCS[doc];
  const articles = policies[doc];
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{d.title}</h1>
      <p lang="ko" className={styles.sub}>
        {d.ko} · 시행일 {policies.effective}
      </p>
      <nav aria-label="Document" className={styles.docs}>
        {(['terms', 'privacy'] as const).map((k) => (
          <Link
            key={k}
            href={DOCS[k].href}
            aria-current={k === doc ? 'page' : undefined}
            className={`${styles.doc} ${k === doc ? styles.docOn : ''}`}
          >
            <span className={styles.ulbl}>{DOCS[k].title}</span>
          </Link>
        ))}
      </nav>
      <Accordion
        key={doc}
        lang="ko"
        className={styles.articles}
        items={articles.map((a) => ({
          title: a.title,
          content: <p className={`${styles.body} ${a.body.startsWith('[') ? styles.placeholder : ''}`}>{a.body}</p>,
        }))}
      />
      <p className={styles.ask}>
        questions about your details?{' '}
        <a href={`mailto:${site.contact.email}`} className={styles.mail}>
          {site.contact.email}
        </a>
      </p>
    </main>
  );
}
