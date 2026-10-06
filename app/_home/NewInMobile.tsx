'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/catalog';
import { formatPrice, sizeLabel } from '@/lib/format';
import { MinusIcon, PlusIcon } from '@/components/Icons';
import styles from './home.module.css';

/** Mobile NEW IN: 4 tiles with +/−; the open piece's info shows below. One open at a time. */
export function NewInMobile({ items }: { items: Product[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  const current = items.find((p) => p.id === open);

  return (
    <>
      <section aria-labelledby="new-m" className={styles.newIn}>
        <div className={styles.labelRow}>
          <h2 id="new-m" className={styles.label}>New in</h2>
          <span className={styles.caption}>{items.length} PIECES</span>
        </div>
        <div className={styles.tiles}>
          {items.map((p, i) => {
            const isOpen = p.id === open;
            return (
              <button
                key={p.id}
                type="button"
                className={styles.tile}
                aria-expanded={isOpen}
                aria-controls="new-m-info"
                aria-label={`${p.name}${isOpen ? ' 정보 닫기' : ' 정보 열기'}`}
                onClick={() => setOpen(isOpen ? null : p.id)}
              >
                <span className={`${styles.tileImg} ${isOpen ? styles.tileOpen : ''}`}>
                  <span className={styles.tileIcon}>{isOpen ? <MinusIcon /> : <PlusIcon />}</span>
                  [FRONT]
                </span>
                <span className={styles.tileLabel}>New 0{i + 1}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section id="new-m-info" aria-label="Piece info" aria-live="polite" className={styles.info}>
        {current ? (
          <>
            <div className={styles.infoName}>{current.name}</div>
            <div className={styles.infoMeta}>
              {current.sold ? <span className={styles.sold}>SOLD OUT</span> : formatPrice(current.price)} · Size{' '}
              {sizeLabel(current.size)}
              <br />1 of 1
            </div>
            <Link href={`/product/${current.id}`} className={styles.viewPiece}>
              View piece
            </Link>
          </>
        ) : (
          <div lang="ko" className={styles.infoEmpty}>
            + 를 눌러 상품 정보를 확인하세요
          </div>
        )}
      </section>
    </>
  );
}
