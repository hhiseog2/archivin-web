import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from '@/components/Icons';
import { Placeholder } from '@/components/Placeholder';
import { ProductCard, ProductGrid } from '@/components/ProductCard/ProductCard';
import { SiteChrome } from '@/components/SiteChrome';
import { getProduct, lookbooks } from '@/lib/catalog';
import ui from '@/components/ui.module.css';
import styles from './lookbook.module.css';

type Params = { n: string };

export function generateStaticParams(): Params[] {
  return lookbooks.map((l) => ({ n: String(l.n) }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { n } = await params;
  const lb = lookbooks.find((l) => String(l.n) === n);
  return { title: lb?.title ?? 'Lookbook' };
}

export default async function LookbookPage({ params }: { params: Promise<Params> }) {
  const { n } = await params;
  const idx = lookbooks.findIndex((l) => String(l.n) === n);
  if (idx < 0) notFound();
  const lb = lookbooks[idx];
  const next = lookbooks[(idx + 1) % lookbooks.length];
  const [first, ...rest] = lb.looks;
  const total = lb.looks.length;

  return (
    <SiteChrome>
      <main className={styles.main}>
        <div className={styles.head}>
          <p className={styles.kicker}>Lookbook</p>
          <h1 className={styles.title}>{lb.title}</h1>
          {/* TODO: season */}
          <p className={styles.season}>
            {lb.season} · {total} looks
          </p>
        </div>

        {/* Look 01 + intro. Desktop: side by side. */}
        <div className={styles.lead}>
          <figure className={styles.leadFig}>
            <div className={ui.labelRow}>
              <span className={ui.label}>{first.label}</span>
              <span className={ui.caption}>1 / {total}</span>
            </div>
            {/* TODO: lookbook photos */}
            <Placeholder src={first.photo} label={`[${first.label.toUpperCase()} · 4:5]`} ratio="4 / 5" />
            <figcaption className={`m-only ${styles.figcap}`}>{first.caption}</figcaption>
          </figure>
          <div className={styles.leadText}>
            <p className={styles.intro}>{lb.intro}</p>
            <p className={`d-only ${styles.leadCaption}`}>
              {first.label} · {first.caption}
            </p>
          </div>
        </div>

        <div className={styles.pair}>
          {rest.map((look, i) => (
            <figure key={look.label} className={styles.fig}>
              <div className={ui.labelRow}>
                <span className={ui.label}>{look.label}</span>
                <span className={ui.caption}>
                  {i + 2} / {total}
                </span>
              </div>
              <Placeholder src={look.photo} label={`[${look.label.toUpperCase()} · 3:4]`} ratio="3 / 4" />
              <figcaption className={styles.figcap}>{look.caption}</figcaption>
            </figure>
          ))}
        </div>

        <section aria-labelledby="shop-look" className={styles.pieces}>
          <div className={ui.labelRow}>
            <h2 id="shop-look" className={ui.label}>
              Pieces in this lookbook
            </h2>
            <span className={ui.caption}>1 OF 1 EACH</span>
          </div>
          <ProductGrid>
            {lb.pieces.map((piece, i) => {
              const p = piece.productId ? getProduct(piece.productId) : undefined;
              return (
                <ProductCard
                  key={i}
                  name={p?.name ?? piece.name}
                  href={p ? `/product/${p.id}` : '/shop'}
                  price={p?.price ?? null}
                  sold={p?.sold ?? piece.sold}
                  sizeLabel={p?.sizeLabel}
                  image={p?.images[0]?.src}
                />
              );
            })}
          </ProductGrid>
        </section>

        <Link href={`/lookbook/${next.n}`} className={styles.next}>
          <span className={styles.nextText}>
            <span className={styles.nextKicker}>Next</span>
            <span className={styles.nextTitle}>{next.title}</span>
          </span>
          <ArrowRight />
        </Link>
      </main>
    </SiteChrome>
  );
}
