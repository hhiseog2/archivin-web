import Link from 'next/link';
import styles from './header.module.css';

/**
 * Navy stitch logo → /shop. Vector trace of the stitch logo (sharp on any screen), with the thread thickened
 * like the old pre-scaled header PNGs so it doesn't break up at 168–220px (README 6).
 * TODO(client): swap for the client's own vector logo if one arrives.
 */
export function Logo({ size, onClick }: { size: 'mobile' | 'desktop'; onClick?: () => void }) {
  const [w, h] = size === 'desktop' ? [220, 51] : [168, 39];
  return (
    <Link href="/shop" aria-label="ARCHIVIN, go to Shop" className={styles.logo} onClick={onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo/archivin-stitch-navy.svg" alt="" width={w} height={h} />
    </Link>
  );
}
