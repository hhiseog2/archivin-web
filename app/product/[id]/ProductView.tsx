'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { AddToBagButton } from '@/components/AddToBagButton/AddToBagButton';
import { InfoRow } from '@/components/InfoRow/InfoRow';
import { MORE_LIKE_THIS_ID, MoreLikeThis } from '@/components/MoreLikeThis/MoreLikeThis';
import { PhotoBars, PhotoCarousel } from '@/components/PhotoCarousel/PhotoCarousel';
import { PhotoBarsVertical } from '@/components/PhotoBarsVertical/PhotoBarsVertical';
import { ZoomPhoto } from '@/components/ZoomPhoto/ZoomPhoto';
import { useCanSeePrices } from '@/lib/auth';
import { catalog, site, type Measurements, type Product } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import { LAST_SHOP_KEY } from '@/lib/shop';
import styles from './product.module.css';

const DESKTOP = '(min-width: 900px)';
type MeasureKey = Exclude<keyof Measurements, 'unit'>;
const TOPS: MeasureKey[] = ['shoulder', 'chest', 'sleeve', 'length'];
const BOTTOMS: MeasureKey[] = ['waist', 'rise', 'thigh', 'hem', 'length'];

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Desktop: scroll so the element's top sits 32px under the window top (README 8-3). */
function scrollToTop32(el: Element | null) {
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 32, behavior: reduceMotion() ? 'auto' : 'smooth' });
}

/** "₩ 000,000 · fits L" (+ " · tag M" when the tag differs). Sold: "fits L". Members-only prices: "price for members · fits L". */
function priceLine(p: Product, canSeePrices: boolean) {
  const fits = `fits ${p.sizeLabel}${p.tagSize && p.tagSize !== p.sizeLabel ? ` · tag ${p.tagSize}` : ''}`;
  if (p.sold) return fits;
  return `${canSeePrices ? formatPrice(p.price) : 'price for members'} · ${fits}`;
}

/** site.productQuestions.mailto with the product name as the subject. */
function askHref(name: string) {
  const subject = encodeURIComponent(name).replace(/'/g, '%27');
  return site.productQuestions.mailto.replace('{email}', site.contact.email).replace('{productName}', subject);
}

/** Tops / outer: shoulder · chest · sleeve · length; bottoms: waist · rise · thigh · hem · length. Only the ones we have. */
function measureRows(m: Measurements) {
  const keys = m.waist != null ? BOTTOMS : TOPS;
  return keys.filter((k) => m[k] != null).map((k) => [k, m[k]!] as const);
}

/**
 * A21_Product (mobile, < 900px) and A21_DProduct (desktop, three columns). README 8-3.
 * Info groups without data are hidden; shipping & returns always shows.
 */
export function ProductView({ product: p }: { product: Product }) {
  const canSeePrices = useCanSeePrices();
  const [shot, setShot] = useState(0); // mobile carousel
  const [cur, setCur] = useState(0); // desktop: photo the bars point at
  const [backHref, setBackHref] = useState('/shop');
  const photoEls = useRef<(HTMLButtonElement | null)[]>([]);

  // "back" keeps the shop's view when we came from there (README 8-3).
  useEffect(() => {
    try {
      const last = sessionStorage.getItem(LAST_SHOP_KEY);
      if (last?.startsWith('/shop')) setBackHref(last);
    } catch {
      // storage blocked: plain /shop
    }
  }, []);

  // Desktop bars follow the last photo whose top has passed 45% of the window height (rAF-throttled).
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      if (!window.matchMedia(DESKTOP).matches) return;
      const line = window.innerHeight * 0.45;
      let k = 0;
      photoEls.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) k = i;
      });
      setCur(k);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const goPhoto = (i: number) => {
    setCur(i);
    scrollToTop32(photoEls.current[i]);
  };

  // "photo 4" in the condition text. Mobile: show that photo and scroll up to the carousel; desktop: scroll to it.
  const showPhoto = (index: number) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.matchMedia(DESKTOP).matches) {
      goPhoto(index);
      return;
    }
    setShot(index);
    document.getElementById('photos')?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  // Sold → "more like this". Desktop scrolls it 32px from the top; mobile is a plain jump (#more).
  const onMore = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia(DESKTOP).matches) return;
    e.preventDefault();
    scrollToTop32(document.getElementById(MORE_LIKE_THIS_ID));
  };

  const line2 = priceLine(p, canSeePrices);
  const m = p.measurements ? measureRows(p.measurements) : [];
  const cond = p.condition;
  const link = cond?.photoLink;
  const [before, after] = link ? cond.en.split(link.text) : [cond?.en ?? '', ''];
  // Korean detail lines from archivin.kr, minus the ones the condition already says (3608).
  const detailsKo = (p.detailsKo ?? []).filter((s) => !cond?.ko.includes(s)).join(' ');
  const hasDetails = Boolean(p.details || detailsKo);
  const photoHref = (desktop: boolean) => (desktop ? `#dph${(link?.imageIndex ?? 0) + 1}` : '#photos');

  const back = (
    <Link href={backHref} className={styles.back}>
      back
    </Link>
  );

  const unit = p.measurements && (
    <p className={styles.unit}>
      {p.measurements.unit} · <span lang="ko">단면 기준</span>
    </p>
  );
  const measureTable = (
    <dl className={styles.measure}>
      {m.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
  const condition = (desktop: boolean) =>
    cond && (
      <>
        <p className={styles.text}>
          {before}
          {link && (
            <a href={photoHref(desktop)} className={styles.photoLink} onClick={showPhoto(link.imageIndex)}>
              {link.text}
            </a>
          )}
          {after}
        </p>
        <p lang="ko" className={styles.ko}>
          {cond.ko}
        </p>
      </>
    );
  const details = (
    <>
      {p.details && <p className={styles.text}>{p.details}</p>}
      {detailsKo && (
        <p lang="ko" className={`${styles.ko} ${p.details ? '' : styles.koFirst}`}>
          {detailsKo}
        </p>
      )}
    </>
  );
  // archivin.kr product page (Shipping). TODO(client): confirm the final wording.
  const shipping = (
    <>
      <p className={styles.text}>orders placed by 3 pm ship in 2–3 business days. {formatPrice(catalog.shippingFee)} anywhere in Korea.</p>
      <p className={`${styles.text} ${styles.textNext}`}>
        no exchanges or refunds, except defects. vintage shows wear. if marks or stains bother you, this piece may not be for you.
      </p>
      <p lang="ko" className={styles.ko}>
        오후 3시 전 주문은 영업일 2–3일 안에 보내요 · 전국 3,000원 · 하자 외 교환·환불 불가 · 데미지·오염에 민감하다면 추천하지 않아요.
      </p>
      <Link href="/guide" className={styles.textLink}>
        shipping &amp; returns guide
      </Link>
    </>
  );
  const ask = (
    <a href={askHref(p.name)} className={`${styles.textLink} ${styles.ask}`}>
      ask about this piece
    </a>
  );
  const buy = (
    <>
      <h1 className={styles.name}>{p.name}</h1>
      <p className={styles.price}>{line2}</p>
      <AddToBagButton id={p.id} sold={p.sold} returnTo={`/product/${p.id}`} moreHref={`#${MORE_LIKE_THIS_ID}`} onMore={onMore} />
    </>
  );

  return (
    <main className={styles.page}>
      {/* A21_Product */}
      <div className="m-only">
        <PhotoCarousel images={p.images} index={shot} onIndex={setShot}>
          <div className={styles.backOnPhoto}>{back}</div>
        </PhotoCarousel>
        <PhotoBars count={p.images.length} index={shot} onIndex={setShot} />

        <section aria-label={p.name} className={`${styles.buy} ${p.images.length > 1 ? '' : styles.buyNoBars}`}>
          {buy}
        </section>

        <section aria-label="Product information" className={styles.info}>
          {m.length > 0 && (
            <InfoRow title="measurements">
              {unit}
              {measureTable}
            </InfoRow>
          )}
          {cond && <InfoRow title="condition">{condition(false)}</InfoRow>}
          {hasDetails && <InfoRow title="details">{details}</InfoRow>}
          <InfoRow title="shipping & returns">{shipping}</InfoRow>
          {ask}
        </section>
      </div>

      {/* A21_DProduct */}
      <div className="d-only">
        <div className={styles.backRow}>{back}</div>
        <div className={styles.pdp}>
          <section aria-label="About this piece" className={styles.pinfo}>
            {m.length > 0 && (
              <Group
                head={
                  <div className={styles.groupHead}>
                    <h2 className={styles.groupTitle}>measurements</h2>
                    {unit}
                  </div>
                }
              >
                {measureTable}
              </Group>
            )}
            {cond && <Group title="condition">{condition(true)}</Group>}
            {hasDetails && <Group title="details">{details}</Group>}
            <Group title="shipping & returns">{shipping}</Group>
            {ask}
          </section>

          <PhotoBarsVertical className={styles.pbars} count={p.images.length} index={cur} onIndex={goPhoto} />

          <section aria-label="Photos" className={styles.pphotos}>
            {p.images.map((img, i) => (
              <ZoomPhoto
                key={img.src}
                id={`dph${i + 1}`}
                src={img.src}
                alt={img.alt}
                ref={(el) => {
                  photoEls.current[i] = el;
                }}
              />
            ))}
          </section>

          <section aria-label={p.name} className={styles.pbuy}>
            {buy}
          </section>
        </div>
      </div>

      <MoreLikeThis id={p.id} />
    </main>
  );
}

/** Desktop "about this piece" group: always open, 13px ink-2 heading, content 8px below. */
function Group({ title, head, children }: { title?: string; head?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.group}>
      {head ?? <h2 className={styles.groupTitle}>{title}</h2>}
      <div className={styles.groupBody}>{children}</div>
    </div>
  );
}
