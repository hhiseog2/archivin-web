import { site } from '@/lib/catalog';

/** 사업자 정보 (README 11). `oneLine` joins the first two lines for the desktop footer. */
export function BusinessInfo({ className, oneLine = false }: { className?: string; oneLine?: boolean }) {
  const b = site.business;
  const c = site.contact;
  if (oneLine) {
    return (
      <p lang="ko" className={className}>
        상호 {b.name} · 대표 {b.ceo} · 사업자등록번호 {b.regNo} · 통신판매업신고 {b.mailOrderNo}
        <br />
        주소 {b.address} · 전화 {c.phone} · 이메일 {c.email}
      </p>
    );
  }
  return (
    <p lang="ko" className={className}>
      상호 {b.name} · 대표 {b.ceo}
      <br />
      사업자등록번호 {b.regNo} · 통신판매업신고 {b.mailOrderNo}
      <br />
      주소 {b.address}
      <br />
      전화 {c.phone} · 이메일 {c.email}
    </p>
  );
}
