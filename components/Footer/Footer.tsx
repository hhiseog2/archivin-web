import Link from 'next/link';
import { site } from '@/lib/catalog';
import styles from './Footer.module.css';

const LINKS = [
  { label: 'about', href: '/about' },
  { label: 'lookbook', href: '/lookbook/1' },
  { label: 'notice', href: '/notice' },
  { label: 'reviews', href: '/reviews' },
];

const b = site.business;
const LINE1 = `${b.name} · 대표 ${b.ceo} · 사업자등록번호 ${b.regNo} · 통신판매업신고 ${b.mailOrderNo}`;
const LINE2 = `${b.address} · ${site.contact.phone} · ${site.contact.email}`;

/** Footer from A21_Shop (mobile) / A21_DShop (desktop): links, then Korean business info. */
export function Footer() {
  // TODO: instagram, terms and privacy URLs (README 11) — data/site.json links.
  return (
    <footer className={styles.footer}>
      <nav aria-label="Footer" className={styles.nav}>
        {LINKS.map((l) => (
          <Link key={l.label} href={l.href} className={styles.link}>
            {l.label}
          </Link>
        ))}
        <a href={site.links.instagram} className={styles.link}>
          instagram
        </a>
      </nav>
      <div lang="ko" className={styles.legal}>
        <p>{LINE1}</p>
        <p className="m-only">{LINE2}</p>
        <div className={`m-only ${styles.legalLinks}`}>
          <a href={site.links.terms}>이용약관</a>
          <a href={site.links.privacy}>개인정보처리방침</a>
        </div>
        <p className="d-only">
          {LINE2} · <a href={site.links.terms}>이용약관</a> · <a href={site.links.privacy}>개인정보처리방침</a>
        </p>
      </div>
    </footer>
  );
}
