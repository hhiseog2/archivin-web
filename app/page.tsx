import Link from 'next/link';
import { DHeader } from '@/components/DHeader/DHeader';
import { DFooter } from '@/components/Footers/DFooter';
import { HomeFooter } from '@/components/Footers/HomeFooter';
import { Placeholder } from '@/components/Placeholder';
import { SiteHeader } from '@/components/SiteHeader/SiteHeader';
import { TopBar } from '@/components/TopBar/TopBar';
import { lookbooks, newInProducts } from '@/lib/catalog';
import { formatPrice, sizeLabel } from '@/lib/format';
import { HeroVideo } from './_home/HeroVideo';
import { NewInMobile } from './_home/NewInMobile';
import styles from './_home/home.module.css';

const POSTERS_ALT = 'Three black-and-white ARCHIVIN posters: FUCK YOU, DO IT YOURSELF., 1 OF 1';

export default function HomePage() {
  const newIn = newInProducts().slice(0, 4);

  return (
    <div className={styles.page}>
      <a href="#content" className={styles.skip}>
        Skip to content
      </a>
      <TopBar animated />

      {/* Video → wordmark. Mobile: menu + bag over the video. Desktop: DHeader (film tone, no logo). */}
      <section aria-label="Campaign video" className={styles.hero}>
        <HeroVideo className={styles.video} />
        <div aria-hidden="true" className={styles.veil} />
        <h1 className={styles.wordmarkWrap}>
          <span className={styles.wordmark}>ARCHIVIN</span>
        </h1>
        <div className="m-only">
          <SiteHeader tone="film" />
        </div>
        <div className={`d-only ${styles.dHeader}`}>
          <DHeader tone="film" logo={false} />
        </div>
      </section>

      <main id="content" className={styles.main}>
        <section aria-label="Lookbooks" className={styles.lookbooks}>
          {lookbooks.slice(0, 2).map((lb) => (
            <Link key={lb.n} href={`/lookbook/${lb.n}`} className={styles.lookbookLink}>
              <div className={styles.labelRow}>
                <span className={styles.label}>{lb.title}</span>
              </div>
              {/* TODO: lookbook cover photos */}
              <Placeholder label="[PHOTO 3:4]" ratio="3 / 4" />
            </Link>
          ))}
        </section>

        <section aria-label="ARCHIVIN posters" className={styles.posters}>
          <picture>
            <source media="(min-width: 900px)" srcSet="/media/posters-row-desktop.jpg" width={2880} height={1327} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/posters-row-mobile.png" alt={POSTERS_ALT} className={styles.postersImg} />
          </picture>
        </section>

        <div className="m-only">
          <NewInMobile items={newIn} />
        </div>

        <section aria-labelledby="new-d" className={`d-only ${styles.newInD}`}>
          <div className={styles.labelRow}>
            <h2 id="new-d" className={styles.label}>New in</h2>
            <span className={styles.caption}>{newIn.length} PIECES</span>
          </div>
          <div className={styles.newGrid}>
            {newIn.map((p) => (
              <article key={p.id} className={styles.newCard}>
                <Placeholder label="[FRONT]" ratio="4 / 3" />
                <div className={styles.newCardInfo}>
                  <h3 className={styles.newCardName}>{p.name}</h3>
                  <p className={styles.newCardMeta}>
                    {p.sold ? <span className={styles.sold}>SOLD OUT</span> : formatPrice(p.price)} · Size{' '}
                    {sizeLabel(p.size)}
                    <br />1 of 1
                  </p>
                  <Link href={`/product/${p.id}`} aria-label={`View ${p.name}`} className={styles.viewPiece}>
                    View piece
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className={`m-only ${styles.mFooterWrap}`}>
        <HomeFooter />
      </div>
      <div className={`d-only ${styles.dSpacer}`} />
      <div className="d-only">
        <DFooter />
      </div>
    </div>
  );
}
