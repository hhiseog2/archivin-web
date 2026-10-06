'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SearchIcon } from '@/components/Icons';
import { ProductCard, ProductGrid } from '@/components/ProductCard/ProductCard';
import { CATEGORIES, SEARCH_SUGGESTIONS, searchProducts, shopHref } from '@/lib/catalog';
import ui from '@/components/ui.module.css';
import styles from './search.module.css';

export function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const q = (params.get('q') ?? '').trim();
  const [input, setInput] = useState(q);
  useEffect(() => setInput(q), [q]);

  const go = (term: string) => {
    const t = term.trim();
    router.replace(t ? `/search?q=${encodeURIComponent(t)}` : '/search', { scroll: false });
  };

  const hits = searchProducts(q);

  return (
    <main className={styles.main}>
      <h1 className="visually-hidden">Search</h1>

      {/* Mobile search bar (desktop uses the bar under the header). */}
      <form
        role="search"
        className={`m-only ${styles.bar}`}
        onSubmit={(e) => {
          e.preventDefault();
          go(input);
        }}
      >
        <label htmlFor="q" className="visually-hidden">
          Search the shop
        </label>
        <div className={styles.box}>
          <input
            id="q"
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Artist, band, brand or era"
            autoComplete="off"
            className={styles.input}
          />
          <button type="submit" aria-label="Search" className={styles.submit}>
            <SearchIcon size={20} />
          </button>
        </div>
        <Link href="/" className={styles.cancel}>
          Cancel
        </Link>
      </form>

      {!q && (
        <>
          <section aria-labelledby="try-h" className={styles.try}>
            <h2 id="try-h" className={styles.h2}>
              Try
            </h2>
            <div className={styles.suggest}>
              {SEARCH_SUGGESTIONS.map((s) => (
                <button key={s} type="button" className={styles.suggestBtn} onClick={() => go(s)}>
                  {s}
                </button>
              ))}
            </div>
          </section>
          <section aria-labelledby="cat-h" className={styles.cats}>
            <h2 id="cat-h" className={`${styles.h2} ${styles.h2Tight}`}>
              Categories
            </h2>
            <ul className={styles.catList}>
              {CATEGORIES.map((c) => (
                <li key={c.key}>
                  <Link href={shopHref(c.key)}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <div role="status">
        {q && hits.length > 0 && (
          <p className={styles.count}>
            {hits.length} {hits.length === 1 ? 'piece' : 'pieces'} for “{q}”
          </p>
        )}
        {q && hits.length === 0 && (
          <div className={styles.none}>
            <p className={styles.noneLead}>No pieces match “{q}”.</p>
            <p className={styles.noneSub}>Check the spelling, or search by artist, brand or decade, like “80&apos;s”.</p>
          </div>
        )}
      </div>

      {q && hits.length > 0 && (
        <section aria-label="Results">
          <ProductGrid>
            {hits.map((p) => (
              <ProductCard key={p.id} name={p.name} href={`/product/${p.id}`} price={p.price} sold={p.sold} />
            ))}
          </ProductGrid>
        </section>
      )}
      {q && hits.length === 0 && (
        <div className={styles.noneAction}>
          <Link href="/shop" className={ui.btnPrimary}>
            Browse all pieces
          </Link>
        </div>
      )}
    </main>
  );
}
