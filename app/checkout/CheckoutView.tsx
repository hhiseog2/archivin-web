'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft } from '@/components/Icons';
import { useBag } from '@/lib/cart';
import { catalog, getProduct, site } from '@/lib/catalog';
import { formatPrice, sumPrices } from '@/lib/format';
import ui from '@/components/ui.module.css';
import parked from '@/components/parked.module.css';
import styles from './checkout.module.css';

const METHODS = [
  { id: 'card', label: 'Card', ko: '신용·체크카드' },
  { id: 'bank', label: 'Bank transfer', ko: '무통장입금' },
  { id: 'kakao', label: 'KakaoPay', ko: '카카오페이' },
  { id: 'naver', label: 'Naver Pay', ko: '네이버페이' },
  { id: 'toss', label: 'Toss Pay', ko: '토스페이' },
] as const;

type Method = (typeof METHODS)[number]['id'];

export function CheckoutView() {
  const router = useRouter();
  const bag = useBag();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  // Nothing is pre-selected or pre-checked (README 9).
  const [pay, setPay] = useState<Method | null>(null);
  const [agree, setAgree] = useState(false);
  const [tel, setTel] = useState('');
  const [telTouched, setTelTouched] = useState(false);
  const [tried, setTried] = useState(false);

  const items = bag.map(getProduct).filter((p): p is NonNullable<typeof p> => !!p);
  const subtotal = sumPrices(items.map((p) => p.price));
  const empty = ready && items.length === 0;
  const total = empty ? 0 : subtotal == null ? null : subtotal + catalog.shippingFee;

  const telOk = /^\d{11}$/.test(tel);
  const showTelErr = (telTouched || tried) && !telOk;
  const payErr = tried && !pay;
  const agreeErr = tried && !agree;

  const tryPay = () => {
    setTried(true);
    if (!pay || !agree || !telOk || items.length === 0) return;
    // TODO: payment. Card / easy pay open the PG window here (e.g. PortOne, Toss Payments);
    // bank transfer creates an order awaiting payment. Save the order server-side before redirecting.
    router.push(`/order/complete?method=${pay === 'bank' ? 'bank' : 'card'}`);
  };

  return (
    <>
      <header className={`m-only ${styles.header}`}>
        <Link href="/bag" className={styles.back}>
          <ChevronLeft />
          Bag
        </Link>
        <Link href="/shop" aria-label="ARCHIVIN, go to Shop" className={styles.wordmark}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/archivin-stitch-navy.png" alt="" width={138} height={32} />
        </Link>
        <span />
      </header>

      <main className={parked.column}>
        <div className={styles.head}>
          <h1 className={ui.pageTitle}>Checkout</h1>
          <p className={parked.lead}>
            You&apos;re checking out as a guest. <Link href="/signin">Sign in</Link> to use a saved address.
          </p>
        </div>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            tryPay();
          }}
        >
          <section aria-labelledby="s1" className={`${parked.section} ${styles.first}`}>
            <h2 id="s1" className={parked.sectionTitle}>
              1 · Contact
            </h2>
            <div>
              <label htmlFor="f-name" className={ui.fieldLabel}>
                Name
              </label>
              <input id="f-name" type="text" autoComplete="name" className={ui.input} />
            </div>
            <div>
              <label htmlFor="f-tel" className={ui.fieldLabel}>
                Mobile number
              </label>
              <input
                id="f-tel"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="01012345678"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                onBlur={() => setTelTouched(tel.length > 0)}
                aria-invalid={showTelErr}
                aria-describedby={showTelErr ? 'f-tel-err' : undefined}
                className={ui.input}
              />
              {showTelErr && (
                <p id="f-tel-err" className={ui.error}>
                  Enter an 11-digit mobile number, numbers only.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="f-mail" className={ui.fieldLabel}>
                Email
              </label>
              <input id="f-mail" type="email" autoComplete="email" aria-describedby="f-mail-hint" className={ui.input} />
              <p id="f-mail-hint" className={ui.hint}>
                We send the order and shipping updates here.
              </p>
            </div>
          </section>

          <section aria-labelledby="s2" className={parked.section}>
            <h2 id="s2" className={parked.sectionTitle}>
              2 · Delivery
            </h2>
            <div>
              <label htmlFor="f-post" className={ui.fieldLabel}>
                Address
              </label>
              <div className={styles.postRow}>
                <input
                  id="f-post"
                  type="text"
                  readOnly
                  autoComplete="postal-code"
                  placeholder="Postcode"
                  className={`${ui.input} ${styles.postInput}`}
                />
                {/* TODO: Korean address search (e.g. Daum Postcode) fills postcode + street address. */}
                <button type="button" className={`${ui.btnSecondary} ${styles.findBtn}`}>
                  Find address
                </button>
              </div>
              <input
                type="text"
                readOnly
                aria-label="Street address"
                autoComplete="address-line1"
                placeholder="Street address appears after search"
                className={`${ui.input} ${styles.street}`}
              />
            </div>
            <div>
              <label htmlFor="f-addr2" className={ui.fieldLabel}>
                Apt, unit, floor
              </label>
              <input id="f-addr2" type="text" autoComplete="address-line2" className={ui.input} />
            </div>
            <div>
              <label htmlFor="f-req" className={ui.fieldLabel}>
                Delivery note (optional)
              </label>
              <select id="f-req" className={ui.input}>
                <option>No note</option>
                <option>Leave at the door</option>
                <option>Leave with the building security office</option>
                <option>Call before delivery</option>
              </select>
            </div>
          </section>

          <section aria-labelledby="s3" className={parked.section}>
            <h2 id="s3" className={parked.sectionTitle}>
              3 · Payment
            </h2>
            <div>
              <div
                role="radiogroup"
                aria-labelledby="s3"
                aria-describedby={payErr ? 'pay-err' : undefined}
                className={styles.methods}
              >
                {METHODS.map((m) => (
                  <label key={m.id} className={`${styles.method} ${pay === m.id ? styles.methodOn : ''}`}>
                    <input
                      type="radio"
                      name="pay"
                      value={m.id}
                      checked={pay === m.id}
                      onChange={() => setPay(m.id)}
                      className={ui.checkbox}
                    />
                    <span className={styles.methodLabel}>{m.label}</span>
                    <span lang="ko" className={styles.methodKo}>
                      {m.ko}
                    </span>
                  </label>
                ))}
              </div>
              {payErr && (
                <p id="pay-err" className={ui.error}>
                  Choose a payment method.
                </p>
              )}
              {pay === 'bank' && (
                <div className={styles.bankBox}>
                  <label htmlFor="f-dep" className={ui.fieldLabel}>
                    Depositor name
                  </label>
                  <input id="f-dep" type="text" className={ui.input} />
                  <p className={styles.bankNote}>
                    The account number shows on the next screen. Your order is confirmed once the payment arrives.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="s4" className={parked.section}>
            <h2 id="s4" className={parked.sectionTitle}>
              4 · Order summary
            </h2>
            <div>
              {empty ? (
                <p className={styles.emptyNote}>
                  Your bag is empty. <Link href="/shop">Shop new in</Link>
                </p>
              ) : (
                <ul className={styles.items}>
                  {items.map((p) => (
                    <li key={p.id}>
                      <span aria-hidden="true" className={styles.itemThumb} />
                      <span className={styles.itemText}>
                        <span className={styles.itemName}>{p.name}</span>
                        <span className={styles.itemSize}>size {p.sizeLabel}</span>
                      </span>
                      <span className={styles.itemPrice}>{formatPrice(p.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <dl className={styles.sum}>
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div>
                  <dt>Shipping</dt>
                  <dd>{formatPrice(empty ? 0 : catalog.shippingFee)}</dd>
                </div>
                <div className={styles.total}>
                  <dt>Total</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className={styles.agreeSection}>
            <label className={styles.agree}>
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree(!agree)}
                aria-describedby={agreeErr ? 'agree-err' : undefined}
                aria-invalid={agreeErr}
                className={`${ui.checkbox} ${styles.agreeBox}`}
              />
              <span>
                I agree to the terms of purchase. Pieces can&apos;t be exchanged or refunded unless they&apos;re defective.
                (Required)
              </span>
            </label>
            {/* TODO: terms of purchase URL */}
            <a href={site.links.terms} className={styles.terms}>
              Read the terms
            </a>
            {agreeErr && (
              <p id="agree-err" className={`${ui.error} ${styles.agreeErr}`}>
                Check the box to agree before you pay.
              </p>
            )}
          </section>

          <section className={styles.paySection}>
            <button
              type="submit"
              aria-disabled={empty}
              className={`${empty ? ui.btnDisabled : ui.btnPrimary} ${styles.payBtn}`}
            >
              {empty ? 'Pay' : `Pay ${formatPrice(total)}`}
            </button>
            <p className={styles.payNote}>Card and easy pay open their own window to finish payment.</p>
          </section>
        </form>
      </main>
    </>
  );
}
