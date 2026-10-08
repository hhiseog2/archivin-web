import Link from 'next/link';
import { site } from '@/lib/catalog';
import styles from './Footer.module.css';

const LINKS = [
  { label: 'about', href: '/about' },
  { label: 'lookbook', href: '/lookbook' },
  { label: 'notice', href: '/notice' },
  { label: 'reviews', href: '/reviews' },
  { label: 'guide', href: site.links.guide },
];

const b = site.business;

function External() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden="true" className={styles.ext}>
      <path d="M2 8l6-6M3.5 2H8v4.5" />
    </svg>
  );
}

/**
 * Footer · DFooter (design/shared, v5): links, business info as on archivin.kr, legal links.
 * 개인정보처리방침 is ink so it stands apart from the other links (개인정보 보호법).
 */
export function Footer() {
  const legal = (
    <div className={styles.legalLinks}>
      <Link href={site.links.terms} className={styles.terms}>
        이용약관
      </Link>
      <Link href={site.links.privacy} className={styles.privacy}>
        개인정보처리방침
      </Link>
      <a href={b.bizInfoUrl} target="_blank" rel="noopener" className={styles.terms}>
        사업자정보확인
        <External />
        <span className="visually-hidden"> (새 창)</span>
      </a>
    </div>
  );
  return (
    <footer className={styles.footer}>
      <nav aria-label="Footer" className={styles.nav}>
        {LINKS.map((l) => (
          <Link key={l.label} href={l.href} className={styles.link}>
            {l.label}
          </Link>
        ))}
        {/* TODO(client): Instagram address (site.json links.instagram). */}
        <a href={site.links.instagram} className={styles.link}>
          instagram
        </a>
      </nav>
      <div lang="ko" className={styles.info}>
        <div className="m-only">
          <p>{`${b.name} · 대표 ${b.ceo} · 사업자등록번호 ${b.regNo}`}</p>
          <p>{`통신판매업신고 ${b.mailOrderNo}`}</p>
          <p>{`${b.postcode} ${b.address}`}</p>
          <p>{`${b.phone} · ${b.email}`}</p>
          {/* TODO(client): hosting company. */}
          <p>{`호스팅 제공자 ${b.hosting}`}</p>
        </div>
        <div className="d-only">
          <p>{`${b.name} · 대표 ${b.ceo} · 사업자등록번호 ${b.regNo} · 통신판매업신고 ${b.mailOrderNo}`}</p>
          <p>{`${b.postcode} ${b.address} · ${b.phone} · ${b.email} · 호스팅 제공자 ${b.hosting}`}</p>
        </div>
        {legal}
        <p>{b.copyright}</p>
      </div>
    </footer>
  );
}
