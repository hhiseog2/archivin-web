import Link from 'next/link';
import styles from './header.module.css';

/**
 * Navy stitch logo → /shop. 2× PNGs pre-scaled so the thread doesn't break up when small (README 6).
 * TODO: swap for the vector logo (SVG) once the client sends it.
 */
export function Logo({ size, onClick }: { size: 'mobile' | 'desktop'; onClick?: () => void }) {
  const src = size === 'desktop' ? '/logo/archivin-stitch-navy-440.png' : '/logo/archivin-stitch-navy-336.png';
  const [w, h] = size === 'desktop' ? [220, 51] : [168, 39];
  return (
    <Link href="/shop" aria-label="ARCHIVIN, go to Shop" className={styles.logo} onClick={onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={w} height={h} />
    </Link>
  );
}
