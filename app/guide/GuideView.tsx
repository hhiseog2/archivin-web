'use client';

import Link from 'next/link';
import { useEffect, useState, type MouseEvent } from 'react';
import { guide, site, type GuideSection } from '@/lib/catalog';
import styles from './guide.module.css';

const anchor = (id: string) => `g-${id}`;

/** Keeps "₩ 3,000" on one line (the design's &nbsp;). */
const nb = (text: string) => text.replace(/₩ /g, '₩ ');

/**
 * 이용안내 (README 8-14, A21_Guide · A21_DGuide). Content from data/guide.json.
 * Index links scroll to their section (smooth; instant with reduced motion, README 9) and move focus to its heading.
 * ≥ 1100px the index sits in the sticky left column (`.gside`); below that it wraps under the title (`.gtopidx`).
 */
export function GuideView() {
  const active = useActiveSection();

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(anchor(id));
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${anchor(id)}`);
    el.focus({ preventScroll: true });
  };

  const index = (side: boolean) => (
    <nav aria-label="On this page">
      <ul className={side ? styles.sideList : styles.topList}>
        {guide.map((s) => (
          <li key={s.id}>
            <a
              href={`#${anchor(s.id)}`}
              className={side ? styles.sideLink : styles.topLink}
              // The design has no visible "current" mark; screen readers get the section in view.
              aria-current={side && active === s.id ? 'location' : undefined}
              onClick={(e) => go(e, s.id)}
            >
              <span className={styles.ulbl}>{s.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <main className={styles.main}>
      <div className={styles.side}>
        <p className={styles.sideLabel}>on this page</p>
        {index(true)}
      </div>

      <div className={styles.col}>
        <h1 className={styles.title}>guide</h1>
        <p className={styles.intro}>
          shipping, payment, returns and membership.
          <span lang="ko" className={styles.introKo}>
            이용안내
          </span>
        </p>
        <div className={styles.topIdx}>{index(false)}</div>

        <div className={styles.sections}>
          {guide.map((s) => (
            <section key={s.id} aria-labelledby={anchor(s.id)} className={styles.section}>
              <h2 id={anchor(s.id)} tabIndex={-1} className={styles.heading}>
                {s.title}
                <span lang="ko" className={styles.headingKo}>
                  {s.titleKo}
                </span>
              </h2>
              <SectionBody section={s} />
            </section>
          ))}
        </div>
      </div>

      <div className={styles.right} />
    </main>
  );
}

function SectionBody({ section: s }: { section: GuideSection }) {
  if (s.kind === 'kv') {
    return (
      <dl className={styles.dl}>
        {s.rows?.map((r) => (
          <div key={r.label} className={styles.kv}>
            <dt className={styles.dt}>{r.label}</dt>
            <dd className={styles.dd}>
              {nb(r.en)}
              {r.ko ? (
                <span lang="ko" className={styles.ddKo}>
                  {r.ko}
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  if (s.kind === 'p') {
    return (
      <>
        {s.paragraphs?.map((p, i) => (
          <div key={i}>
            <p className={`${styles.p} ${i > 0 ? styles.pNext : ''}`}>{nb(p.en)}</p>
            {p.ko ? (
              <p lang="ko" className={styles.pKo}>
                {p.ko}
              </p>
            ) : null}
          </div>
        ))}
        {s.id === 'membership' ? (
          <Link href="/signin" className={styles.textLink}>
            sign in or join
          </Link>
        ) : null}
      </>
    );
  }

  // contact: email · phone · instagram from data/site.json
  const values: Record<string, { href: string; text: string }> = {
    email: { href: `mailto:${site.contact.email}`, text: site.contact.email },
    phone: { href: site.contact.phoneHref, text: site.contact.phone },
    // TODO(client): Instagram address (archivin.kr has "#" too).
    instagram: { href: site.links.instagram, text: site.links.instagramHandle.toLowerCase() },
  };
  return (
    <>
      <dl className={styles.dl}>
        {s.contact?.map((k) =>
          values[k] ? (
            <div key={k} className={styles.kv}>
              <dt className={styles.dt}>{k}</dt>
              <dd className={styles.dd}>
                <a href={values[k].href} className={styles.valueLink}>
                  {values[k].text}
                </a>
              </dd>
            </div>
          ) : null,
        )}
      </dl>
      <Link href="/about" className={styles.textLink}>
        store hours and address
      </Link>
    </>
  );
}

/** Section whose heading last passed the top third of the viewport (rAF-throttled scroll). */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight / 3;
      let current: string | null = guide[0]?.id ?? null;
      for (const s of guide) {
        const el = document.getElementById(anchor(s.id));
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return active;
}
