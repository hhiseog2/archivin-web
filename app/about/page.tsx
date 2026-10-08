import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { site } from '@/lib/catalog';
import styles from './about.module.css';

export const metadata: Metadata = { title: 'about' };

/** ↗ after external links (A21_About). */
function ExtArrow() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
      <path d="M2 8l6-6M3.5 2H8v4.5" />
    </svg>
  );
}

/**
 * A21_About · A21_DAbout (README 8-10). Mobile: store photo full width, then the text.
 * Desktop: `.abgrid` — photo left, text right (max 480px).
 */
export default function AboutPage() {
  const { store, about, contact, links } = site;
  return (
    <SiteChrome fullWidth>
      <main className={styles.main}>
        {/* TODO(client): store photo (site.store.photo) */}
        <div role="img" aria-label="store photo · 4:5" className={styles.photo}>
          [store photo · 4:5]
        </div>

        <div className={styles.text}>
          <p className={styles.kicker}>about</p>
          <h1 className={styles.statement}>{about.statement}</h1>
          {about.en.map((p, i) => (
            <p key={i} className={styles.copy}>
              {p}
            </p>
          ))}
          <p lang="ko" className={styles.ko}>
            {about.ko}
          </p>

          <section aria-labelledby="ab-visit" className={styles.visit}>
            <h2 id="ab-visit" className={styles.h2}>
              visit
            </h2>
            <dl className={styles.dl}>
              <div className={styles.row}>
                <dt>address</dt>
                <dd>
                  {store.addressEn}
                  <span lang="ko" className={styles.addrKo}>
                    {store.addressKo}
                  </span>
                </dd>
              </div>
              <div className={styles.row}>
                <dt>hours</dt>
                {/* Hours can change by season (site.store.hoursNote) — keep them easy to edit. */}
                <dd>
                  {store.hours.map(([days, time], i) => (
                    <span key={days}>
                      {i > 0 && <br />}
                      {days} {time}
                    </span>
                  ))}
                  <span className={styles.hoursNote}>{store.hoursNote.en}</span>
                  <span lang="ko" className={styles.hoursNoteKo}>
                    {store.hoursNote.ko}
                  </span>
                </dd>
              </div>
              <div className={styles.row}>
                <dt>map</dt>
                {/* Address-search links until the store sends its own map links (site.json). */}
                <dd className={styles.maps}>
                  <a href={links.naverMap} target="_blank" rel="noopener" className={styles.ext}>
                    naver map
                    <ExtArrow />
                  </a>
                  <a href={links.kakaoMap} target="_blank" rel="noopener" className={styles.ext}>
                    kakao map
                    <ExtArrow />
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="ab-contact" className={styles.contact}>
            <h2 id="ab-contact" className={styles.h2}>
              contact
            </h2>
            <dl className={styles.dl}>
              <div className={styles.row}>
                <dt>email</dt>
                <dd>
                  <a href={`mailto:${contact.email}`} className={styles.link}>
                    {contact.email}
                  </a>
                </dd>
              </div>
              <div className={styles.row}>
                <dt>phone</dt>
                <dd>
                  <a href={contact.phoneHref} className={styles.link}>
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div className={styles.row}>
                <dt>instagram</dt>
                <dd>
                  <a href={links.instagram} target="_blank" rel="noopener" className={styles.ext}>
                    {links.instagramHandle}
                    <ExtArrow />
                  </a>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </main>
    </SiteChrome>
  );
}
