import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteChrome } from '@/components/SiteChrome';
import { getProduct, lookbooks, type LookPiece } from '@/lib/catalog';
import { Looks, type LookView } from './Looks';
import { Pieces } from './Pieces';
import styles from '../lookbook.module.css';

type Params = { n: string };

export function generateStaticParams(): Params[] {
  return lookbooks.map((l) => ({ n: String(l.n) }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { n } = await params;
  return { title: lookbooks.find((l) => String(l.n) === n)?.title ?? 'lookbook' };
}

/** Sold if the lookbook says so or the shop piece has sold since. */
const isSold = (piece: LookPiece) => piece.sold || Boolean(piece.productId && getProduct(piece.productId)?.sold);

/** A21_LookbookIssue · A21_DLookbookIssue (README 8-13). */
export default async function LookbookIssuePage({ params }: { params: Promise<Params> }) {
  const { n } = await params;
  const idx = lookbooks.findIndex((l) => String(l.n) === n);
  if (idx < 0) notFound();
  const lb = lookbooks[idx];
  const next = lookbooks[(idx + 1) % lookbooks.length];

  // TODO(client): looks for issues that only have a look count so far — grey 3:4 wells until then.
  const looks: LookView[] = lb.looks.length
    ? lb.looks.map((look) => ({
        label: look.label,
        photo: look.photo,
        pieces: look.pieces.map((p) => ({
          name: p.name,
          href: p.productId && getProduct(p.productId) ? `/product/${p.productId}` : null,
          sold: isSold(p),
        })),
      }))
    : Array.from({ length: lb.lookCount }, (_, i) => ({
        label: `look ${String(i + 1).padStart(2, '0')}`,
        photo: null,
        pieces: [],
      }));

  const pieces = lb.pieces.map((p) => ({
    name: p.name,
    sold: isSold(p),
    product: (p.productId && getProduct(p.productId)) || null,
  }));

  return (
    <SiteChrome fullWidth>
      <main className={styles.issueMain}>
        <div className={styles.issueHead}>
          <Link href="/lookbook" className={styles.back}>
            lookbook
          </Link>
          <p className={styles.issueMeta}>
            {lb.season} · {lb.lookCount} looks
          </p>
          <h1 className={styles.issueTitle}>{lb.title}</h1>
          {/* TODO(client): season, intro and looks (data/lookbooks.json is a placeholder) */}
          <p className={styles.issueIntro}>{lb.intro}</p>
        </div>

        <Looks looks={looks} />

        {pieces.length > 0 && (
          <section aria-labelledby="lbi-pieces" className={styles.pieces}>
            <h2 id="lbi-pieces" className={styles.piecesTitle}>
              pieces in this issue
            </h2>
            <Pieces pieces={pieces} />
          </section>
        )}

        {next !== lb && (
          <div className={styles.nextWrap}>
            <Link href={`/lookbook/${next.n}`} className={styles.lbnext}>
              <span className={styles.nextLabel}>next</span>
              <span className={styles.nextTitle}>
                <span className={styles.lbt}>
                  {next.title} · {next.season}
                </span>
              </span>
            </Link>
          </div>
        )}
      </main>
    </SiteChrome>
  );
}
