import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Placeholder } from '@/components/Placeholder';
import { ProductCard, ProductGrid } from '@/components/ProductCard/ProductCard';
import { SiteChrome } from '@/components/SiteChrome';
import { categoryLabel, getProduct, products, relatedProducts, shopHref } from '@/lib/catalog';
import { formatPrice, sizeLabel } from '@/lib/format';
import { MobileCarousel, PurchaseActions, PurchaseBar, ShippingAccordion } from './ProductClient';
import ui from '@/components/ui.module.css';
import styles from './product.module.css';

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const p = getProduct(id);
  return { title: p ? p.name : 'Not found' };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) notFound();

  const m = p.measurements;
  const related = relatedProducts(p.id, 4);
  const tbd = '[—]'; // TODO: fill in from data/products.json

  return (
    <SiteChrome active="shop" after={<PurchaseBar id={p.id} name={p.name} size={sizeLabel(p.size)} price={p.price} sold={p.sold} />}>
      <nav aria-label="Breadcrumb" className={styles.crumbs}>
        <Link href="/shop">Shop</Link>
        <span aria-hidden="true">/</span>
        <Link href={shopHref(p.category)}>{categoryLabel(p.category)}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className={styles.crumbCurrent}>
          {p.name}
        </span>
      </nav>

      <main className={styles.main}>
        <div className={styles.layout}>
          <section aria-label="Photos" className={styles.photos}>
            <div className="m-only">
              <MobileCarousel shots={p.photos} />
            </div>
            {/* TODO: product photos (front, back, tag, detail, flaw) */}
            <div className={`d-only ${styles.photoGrid}`}>
              <div className={styles.grid2}>
                {p.photos.slice(0, 2).map((s) => (
                  <Placeholder key={s} label={`[${s} 4:5]`} ratio="4 / 5" />
                ))}
              </div>
              <div className={styles.grid3}>
                {p.photos.slice(2, 5).map((s) => (
                  <Placeholder key={s} label={`[${s} 4:5]`} ratio="4 / 5" />
                ))}
              </div>
            </div>
          </section>

          <section aria-label="Product" className={styles.info}>
            <div className={styles.tagRow}>
              <span className={ui.tag}>1 OF 1</span>
              <span className={styles.era}>{p.eraLabel}</span>
            </div>
            <h1 className={styles.title}>{p.name}</h1>
            {p.sold ? (
              <p className={`${styles.price} ${ui.soldText}`}>SOLD OUT</p>
            ) : (
              <p className={styles.price}>{formatPrice(p.price)}</p>
            )}

            <div className={styles.sizeRow}>
              <span className={ui.label}>Size</span>
              <span className={styles.sizeBox}>{sizeLabel(p.size)}</span>
              <span className={ui.meta}>One piece, one size</span>
            </div>

            <PurchaseActions id={p.id} name={p.name} sold={p.sold} />
            <p className={styles.shipLine}>Shipping ₩ 3,000 · Arrives 3–7 business days after payment</p>

            <section aria-labelledby="m-title" className={styles.block}>
              <h2 id="m-title" className={styles.blockTitle}>
                Measurements (cm)
              </h2>
              <dl className={styles.measure}>
                {(
                  [
                    ['Shoulder', m?.shoulder],
                    ['Chest', m?.chest],
                    ['Sleeve', m?.sleeve],
                    ['Length', m?.length],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v ?? tbd}</dd>
                  </div>
                ))}
              </dl>
              <p className={styles.note}>Tag size {p.tagSize ?? sizeLabel(p.size)}.</p>
            </section>

            <section aria-labelledby="c-title" className={styles.blockSm}>
              <h2 id="c-title" className={styles.blockTitle}>
                Condition
              </h2>
              <p className={styles.body}>{p.condition ?? '[Condition notes]'}</p>
              <p className={`${styles.body} ${styles.bodyMuted}`}>
                A vintage piece with signs of age. Not recommended if damage or stains bother you.
              </p>
            </section>

            <section aria-labelledby="d-title" className={styles.blockSm}>
              <h2 id="d-title" className={`${styles.blockTitle} ${styles.blockTitleTight}`}>
                Details
              </h2>
              <dl className={styles.details}>
                <div>
                  <dt>Era</dt>
                  <dd>{p.eraLabel}</dd>
                </div>
                <div>
                  <dt>Construction</dt>
                  <dd>{p.construction ?? tbd}</dd>
                </div>
                <div>
                  <dt>Fabric</dt>
                  <dd>{p.fabric ?? tbd}</dd>
                </div>
                <div>
                  <dt>Tag size</dt>
                  <dd>{p.tagSize ?? sizeLabel(p.size)}</dd>
                </div>
                <div>
                  <dt>Product no.</dt>
                  <dd className={styles.muted}>{p.productNo ?? tbd}</dd>
                </div>
              </dl>
            </section>

            <ShippingAccordion />
          </section>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="y-title" className={styles.related}>
            <div className={ui.labelRow}>
              <h2 id="y-title" className={ui.label}>
                You may also like
              </h2>
            </div>
            <ProductGrid mobileLimit={2}>
              {related.map((r) => (
                <ProductCard key={r.id} name={r.name} href={`/product/${r.id}`} price={r.price} sold={r.sold} />
              ))}
            </ProductGrid>
          </section>
        )}
      </main>
    </SiteChrome>
  );
}
