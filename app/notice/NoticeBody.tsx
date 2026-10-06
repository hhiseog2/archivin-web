import { Fragment } from 'react';
import type { NoticeBlock } from '@/lib/catalog';
import { site } from '@/lib/catalog';
import styles from './notice.module.css';

/** Renders a notice body from data/notices.json. `{email}` becomes a mailto link. */
export function NoticeBody({ blocks, headingLevel }: { blocks: NoticeBlock[]; headingLevel: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h':
            return (
              <H key={i} className={styles.bodyH}>
                {b.text}
              </H>
            );
          case 'p': {
            const parts = b.text.split('{email}');
            return (
              <p key={i} className={`${styles.bodyP} ${b.muted ? styles.muted : ''}`}>
                {parts.map((part, j) => (
                  <Fragment key={j}>
                    {part}
                    {j < parts.length - 1 && <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>}
                  </Fragment>
                ))}
              </p>
            );
          }
          case 'note-ko':
            return (
              <p key={i} lang="ko" className={styles.noteKo}>
                {b.text}
              </p>
            );
          case 'dl':
            return (
              <dl key={i} className={styles.bodyDl}>
                {b.rows.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            );
        }
      })}
    </>
  );
}
