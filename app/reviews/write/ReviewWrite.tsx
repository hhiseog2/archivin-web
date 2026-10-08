'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { formClasses, Select, TextField } from '@/components/Form/Form';
import reviewData from '@/data/reviews.json';
import { signInHref, useSession } from '@/lib/auth';
import { addMyReview } from '@/lib/cart';
import { getProduct, type Product } from '@/lib/catalog';
import { formatDate, maskName } from '@/lib/format';
import { SAMPLE_ORDERS, useMyOrders, type Order } from '@/lib/orders';
import { Star } from '../Star';
import styles from './write.module.css';

const { minLength: MIN, maxLength: MAX, maxPhotos } = reviewData.write;

const noop = () => () => {};
/** false on the server and during hydration, true after — so the sign-in check reads the saved session. */
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

/**
 * Pieces from the member's orders (README 8-12 `piece`): delivered orders first, cancelled ones left out.
 * Prototype: orders saved on this device + the design samples (data/checkout.json orderSamples).
 * TODO(backend): the member's orders from the server, and confirm the buyer before posting.
 */
function orderedPieces(mine: Order[]): Product[] {
  const orders = [...mine, ...SAMPLE_ORDERS.filter((s) => !mine.some((m) => m.id === s.id))].filter(
    (o) => o.status !== 'cancelled',
  );
  const sorted = [...orders.filter((o) => o.status === 'delivered'), ...orders.filter((o) => o.status !== 'delivered')];
  const ids = [...new Set(sorted.flatMap((o) => o.items))];
  return ids.map((id) => getProduct(id)).filter((p): p is Product => p != null);
}

/** write a review (README 8-12, A21_ReviewWrite · A21_DReviewWrite). Only buyers; signed out → /signin. */
export function ReviewWrite({ initialPiece }: { initialPiece?: string }) {
  const router = useRouter();
  const session = useSession();
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && !session) router.replace(signInHref('/reviews/write'));
  }, [hydrated, session, router]);

  const mine = useMyOrders();
  const pieces = useMemo(() => orderedPieces(mine), [mine]);
  const [pieceId, setPieceId] = useState(initialPiece ?? '');
  const piece = pieces.find((p) => p.id === pieceId) ?? pieces[0];

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [tried, setTried] = useState(false);
  const firstStar = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const okBody = body.trim().length >= MIN;
  const rateErr = tried && !rating;
  const bodyErr = tried && !okBody;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!rating || !okBody || !piece) {
      setTried(true);
      // Focus the first field that needs fixing.
      if (!rating) firstStar.current?.focus();
      else bodyRef.current?.focus();
      return;
    }
    // TODO(backend): upload the review (and photos) for the signed-in buyer. Kept on this device for now.
    addMyReview({
      id: `my-${Date.now()}`,
      productName: piece.name,
      productSize: piece.sizeLabel,
      productId: piece.id,
      rating,
      title: '',
      lang: /[ㄱ-ㅎ가-힣]/.test(body) ? 'ko' : 'en',
      body: body.trim(),
      author: maskName(session?.name || session?.email || 'member'),
      date: formatDate(new Date()),
      photo: false,
    });
    router.push('/reviews');
  };

  return (
    <main className={styles.main}>
      <Link href="/reviews" className={styles.back}>
        reviews
      </Link>
      <h1 className={styles.title}>write a review</h1>
      <p className={styles.intro}>for pieces you bought. it shows on the reviews page with a masked name.</p>

      <form noValidate onSubmit={submit} className={styles.form}>
        <Select
          id="rw-piece"
          label="piece"
          help="pieces from your orders."
          value={piece?.id ?? ''}
          onChange={(e) => setPieceId(e.target.value)}
          options={pieces.map((p) => ({ value: p.id, label: `${p.name} · ${p.sizeLabel}` }))}
        />

        <fieldset className={formClasses.group} aria-describedby={rateErr ? 'rw-rate-err' : undefined}>
          <legend className={formClasses.label}>rating</legend>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                ref={n === 1 ? firstStar : undefined}
                type="button"
                aria-label={n === 1 ? '1 star' : `${n} stars`}
                aria-pressed={n === rating}
                className={styles.star}
                onClick={() => setRating(n)}
              >
                <Star
                  size={24}
                  strokeWidth={1.4}
                  fill={n <= rating ? 'var(--color-navy)' : 'none'}
                  stroke={n <= rating ? 'var(--color-navy)' : 'var(--color-ink)'}
                />
              </button>
            ))}
            <span aria-live="polite" className={styles.rateText}>
              {rating ? `${rating} / 5` : 'not rated'}
            </span>
          </div>
          {rateErr ? (
            <p className={formClasses.error} id="rw-rate-err">
              choose a rating.
            </p>
          ) : null}
        </fieldset>

        <TextField
          ref={bodyRef}
          multiline
          id="rw-body"
          label="review"
          className={styles.bodyField}
          maxLength={MAX}
          placeholder="how's the fit, the fabric and the print? add the size you usually wear."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          error={bodyErr ? `write at least ${MIN} characters.` : null}
          help={`${body.length} / ${MAX}`}
        />

        <div role="group" aria-labelledby="rw-photos">
          <span id="rw-photos" className={formClasses.label}>
            photos (optional)
          </span>
          <div className={styles.photos}>
            {/* TODO(backend): photo upload (up to 5, README 12). */}
            <button type="button" aria-label="add photos" className={styles.addPhoto}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
                <path d="M6 1v10M1 6h10" />
              </svg>
              add
            </button>
          </div>
          <p className={formClasses.help}>up to {maxPhotos} photos.</p>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.post}>
            post review
          </button>
          <Link href="/reviews" className={styles.cancel}>
            cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
