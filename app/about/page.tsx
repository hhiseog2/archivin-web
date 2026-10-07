import type { Metadata } from 'next';
import { Placeholder } from '@/components/Placeholder';
import { SiteChrome } from '@/components/SiteChrome';
import { site } from '@/lib/catalog';
import styles from './about.module.css';

export const metadata: Metadata = { title: 'About us' };

export default function AboutPage() {
  return (
    <SiteChrome>
      <main className={styles.main}>
        <div className={styles.hero}>
          {/* TODO: store photo */}
          <Placeholder label="[STORE PHOTO 4:5]" ratio="4 / 5" className={styles.heroPhoto} />
          <section className={styles.intro}>
            <p className={styles.kicker}>About us</p>
            <h1 className={styles.title}>Archivin against restocks.</h1>
            <div className={styles.copy}>
              <p>
                ARCHIVIN is a vintage shop in Haebangchon, Seoul. We carry band tees, tour merch, film and skate graphics,
                and designer pieces from the 1970s to the 2010s.
              </p>
              <p>Every piece is one of one. When it sells, it goes to the archive.</p>
              <p lang="ko" className={styles.ko}>
                해방촌의 빈티지 숍 아카이빈이에요. 1970년대부터 2010년대까지의 밴드 티셔츠와 디자이너 피스를 한 점씩만
                소개해요.
              </p>
            </div>
          </section>
        </div>

        <div className={styles.info}>
          <section aria-labelledby="visit" className={styles.visit}>
            <h2 id="visit" className={styles.h2}>
              Visit the store
            </h2>
            <p className={styles.addr}>{site.store.addressEn}</p>
            <p lang="ko" className={styles.addrKo}>
              {site.store.addressKo}
            </p>
            <dl className={styles.hours}>
              {site.store.hours.map(([d, h]) => (
                <div key={d}>
                  <dt>{d}</dt>
                  <dd>{h}</dd>
                </div>
              ))}
            </dl>
            {/* TODO: map embed or image */}
            <Placeholder label="[MAP]" className={styles.map} />
            <div className={styles.mapLinks}>
              {/* TODO: Naver / Kakao map URLs (data/site.json) */}
              <a href={site.links.naverMap} className={styles.mapBtn}>
                Naver Map
              </a>
              <a href={site.links.kakaoMap} className={styles.mapBtn}>
                Kakao Map
              </a>
            </div>
          </section>

          <section aria-labelledby="contact" className={styles.contact}>
            <h2 id="contact" className={`${styles.h2} ${styles.h2Tight}`}>
              Contact
            </h2>
            <dl className={styles.contactList}>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={site.contact.phoneHref}>{site.contact.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Instagram</dt>
                <dd>
                  {/* TODO: Instagram handle */}
                  <a href={site.links.instagram}>{site.links.instagramHandle}</a>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </main>
    </SiteChrome>
  );
}
