'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { PlusIcon, StarIcon } from '@/components/Icons';
import { addMyReview } from '@/lib/cart';
import { getProduct } from '@/lib/catalog';
import { sizeLabel } from '@/lib/format';
import ui from '@/components/ui.module.css';
import styles from './reviews.module.css';

// TODO: once accounts/orders exist, list the signed-in buyer's purchased pieces here.
const ORDER_PIECES = ['80s-iggy-pop', '80s-pet-shop-boys'];
const MAX_PHOTOS = 5;

/**
 * Review form. Post is enabled once there's a rating and 10+ characters; until then the reason shows.
 * `variant="page"` is the mobile /reviews/write screen, `"inline"` the desktop panel.
 */
export function ReviewForm({
  variant,
  idPrefix,
  onPosted,
  onCancel,
}: {
  variant: 'page' | 'inline';
  idPrefix: string;
  onPosted: () => void;
  onCancel?: () => void;
}) {
  const [piece, setPiece] = useState(ORDER_PIECES[0]);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const ready = rating > 0 && body.trim().length >= 10;
  const id = (s: string) => `${idPrefix}-${s}`;

  // Free the local preview URLs when the form goes away.
  const photoUrls = useRef<string[]>([]);
  photoUrls.current = photos;
  useEffect(() => () => photoUrls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const submit = () => {
    if (!ready) return;
    const p = getProduct(piece);
    // TODO: send to a reviews API (with photo upload) instead of saving on this device.
    addMyReview({
      id: `mine-${Date.now()}`,
      productName: p?.name ?? piece,
      productId: p?.id ?? null,
      rating,
      title: title.trim(),
      lang: /[가-힣]/.test(title + body) ? 'ko' : 'en',
      body: body.trim(),
      author: 'You',
      date: 'Just now',
      photo: photos.length > 0,
    });
    onPosted();
  };

  return (
    <form
      className={variant === 'inline' ? styles.formInline : styles.formPage}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      {variant === 'inline' ? (
        <h2 id={id('h')} className={styles.formTitle}>
          Write a review
        </h2>
      ) : (
        <h1 className={ui.pageTitle}>Write a review</h1>
      )}

      <div>
        <label htmlFor={id('item')} className={ui.fieldLabel}>
          Piece
        </label>
        <select id={id('item')} value={piece} onChange={(e) => setPiece(e.target.value)} className={`${ui.input} ${styles.narrow}`}>
          {ORDER_PIECES.map((pid) => {
            const p = getProduct(pid);
            return (
              <option key={pid} value={pid}>
                {p?.name} · Size {sizeLabel(p?.size)}
              </option>
            );
          })}
        </select>
        <p className={ui.hint}>Pieces from your orders.</p>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={ui.fieldLabel}>Rating</legend>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={styles.starBtn}
              aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
              aria-pressed={n === rating}
              onClick={() => setRating(n)}
            >
              <StarIcon size={26} filled={n <= rating} strokeWidth={1.8} />
            </button>
          ))}
          <span aria-live="polite" className={styles.ratingText}>
            {rating ? `${rating} / 5` : 'Not rated'}
          </span>
        </div>
      </fieldset>

      <div>
        <label htmlFor={id('title')} className={ui.fieldLabel}>
          Title (optional)
        </label>
        <input
          id={id('title')}
          type="text"
          maxLength={60}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${ui.input} ${styles.narrow}`}
        />
      </div>

      <div>
        <label htmlFor={id('body')} className={`${ui.fieldLabel} ${styles.labelTight}`}>
          Your review
        </label>
        <p id={id('hint')} className={styles.bodyHint}>
          How&apos;s the fit, the fabric and the print? Add the size you usually wear.
        </p>
        <textarea
          id={id('body')}
          aria-describedby={`${id('hint')} ${id('count')}`}
          maxLength={1000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={ui.textarea}
        />
        <p id={id('count')} className={styles.count}>
          {body.length} / 1000
        </p>
      </div>

      <div>
        <span className={ui.fieldLabel} id={id('photos')}>
          Photos (optional)
        </span>
        <div className={styles.photoRow}>
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt={`Photo ${i + 1}`} className={variant === 'inline' ? styles.photoD : styles.photoM} />
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className={`${styles.addPhoto} ${variant === 'inline' ? styles.photoD : styles.photoM}`}>
              <input
                type="file"
                accept="image/*"
                multiple
                className="visually-hidden"
                aria-describedby={id('photos-hint')}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - photos.length);
                  setPhotos((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
                  e.target.value = '';
                }}
              />
              <PlusIcon />
              Add photo
            </label>
          )}
        </div>
        <p id={id('photos-hint')} className={ui.hint}>
          Up to 5 photos.
        </p>
      </div>

      <div className={variant === 'inline' ? styles.actionsInline : styles.actionsPage}>
        <button
          type="submit"
          aria-disabled={!ready}
          aria-describedby={ready ? undefined : id('need')}
          className={`${ready ? ui.btnPrimary : ui.btnDisabled} ${styles.postBtn}`}
        >
          Post review
        </button>
        {variant === 'inline' ? (
          <button type="button" className={ui.textButton} onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        {!ready && (
          <p id={id('need')} className={styles.need}>
            Choose a rating and write at least 10 characters to post.
          </p>
        )}
        {variant === 'page' && (
          <Link href="/reviews" className={ui.textLinkCenter}>
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
