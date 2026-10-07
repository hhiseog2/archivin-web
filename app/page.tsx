import Link from 'next/link';
import { IntroArrow } from '@/components/Icons';
import { catalog } from '@/lib/catalog';
import styles from './intro.module.css';

/**
 * Intro (A_Intro / A_DIntro): navy screen, white stitch logo, no header or footer.
 * Logo, "shop →" and the five categories all go to /shop for now.
 */
export default function IntroPage() {
  // TODO: band · designer · rap · skate · archive need their own shop views + product tags (README 11).
  const categories = (
    <nav aria-label="Categories">
      <ul className={styles.list}>
        {catalog.introCategories.map((c) => (
          <li key={c}>
            <Link href="/shop">{c}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className={styles.intro}>
      <div aria-hidden="true" className={`${styles.flex} ${styles.top}`} />

      <h1 className={styles.h1}>
        <Link href="/shop" className={styles.logoLink}>
          {/* TODO: swap for the vector logo (SVG) once the client sends it (README 6). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/archivin-stitch-white.png" alt="ARCHIVIN" width={1115} height={259} className={styles.logo} />
        </Link>
      </h1>

      <div className={styles.row}>
        <p className={styles.tagline}>selected vintage clothing.</p>
        <Link href="/shop" className={styles.cta}>
          shop
          <IntroArrow />
        </Link>
      </div>

      <div aria-hidden="true" className={`${styles.flex} ${styles.middle}`} />

      <div className={styles.bottom}>
        {categories}
        <p className={styles.love}>love you all.</p>
      </div>

      <div aria-hidden="true" className={`${styles.flex} ${styles.end}`} />
    </div>
  );
}
