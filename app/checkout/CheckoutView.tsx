'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Checkbox, Radio, Select, TextField, formClasses as fc } from '@/components/Form/Form';
import { signInHref, useSession } from '@/lib/auth';
import { clearBag, useBag } from '@/lib/cart';
import { checkoutConfig, getProduct, site } from '@/lib/catalog';
import { formatDate, formatPrice } from '@/lib/format';
import { SAMPLE_ORDERS, newOrderId, payByDate, saveOrder, useMyOrders, type Order } from '@/lib/orders';
import { OrderSummary, orderTotals } from './OrderSummary';
import styles from './checkout.module.css';

type Field = 'name' | 'tel' | 'mail' | 'addr' | 'pay' | 'dep' | 'agree';
type Method = 'card' | 'bank';

/** Focus goes to the first invalid field in this order (README 8-7). */
const FIELD_ORDER: Field[] = ['name', 'tel', 'mail', 'addr', 'pay', 'dep', 'agree'];
const METHODS = checkoutConfig.paymentMethods as { id: Method; label: string; ko: string; button: string; note: string }[];

/** "04029 서울 마포구 와우산로 00, 2층" → postcode · street · apt (the format orders save `shipTo.address` in). */
function splitAddress(address: string) {
  const m = /^(\d{5})\s+([^,]+?)(?:,\s*(.+))?$/.exec(address.trim());
  return m ? { post: m[1], street: m[2], addr2: m[3] ?? '' } : null;
}

/**
 * One-page checkout (A21_Checkout · A21_DCheckout, README 8-7). Prices are for members, so checkout is for
 * signed-in members only (`guestCheckout: false`) — private payment links (`payCode`, 8-16) too since v5.1.
 * Nothing is pre-selected: no payment method, agreement unchecked. Pieces aren't held — not even here.
 */
export function CheckoutView({ payCode }: { payCode?: string }) {
  const router = useRouter();
  const session = useSession();
  const mine = useMyOrders();
  const bag = useBag();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  // TODO(backend): private payment links create/lookup — the prototype uses the one sample for any code.
  const sample = checkoutConfig.privatePayment.sample;
  const privatePay: Order['privatePay'] = payCode
    ? { code: payCode, title: sample.title, amount: sample.amount as number | null, shippingIncluded: sample.shippingIncluded }
    : undefined;

  const mustSignIn = ready && !session && !checkoutConfig.guestCheckout;
  useEffect(() => {
    if (mustSignIn) router.replace(signInHref(payCode ? `/pay/${encodeURIComponent(payCode)}` : '/checkout'));
  }, [mustSignIn, payCode, router]);

  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [mail, setMail] = useState('');
  const [post, setPost] = useState('');
  const [street, setStreet] = useState('');
  const [addr2, setAddr2] = useState('');
  const [note, setNote] = useState('none');
  const [pay, setPay] = useState<Method | ''>('');
  const [depValue, setDepValue] = useState('');
  const [depTouched, setDepTouched] = useState(false);
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);

  // Signed-in member with a saved address: name · mobile · email · address come filled in (method and agreement don't).
  const prefilled = useRef(false);
  useEffect(() => {
    if (!ready || !session || prefilled.current) return;
    prefilled.current = true;
    // TODO(backend): the member's saved address from their profile. Prototype: the latest order's shipping details.
    const last = [...mine, ...SAMPLE_ORDERS].find((o) => o.shipTo)?.shipTo;
    const addr = last ? splitAddress(last.address) : null;
    setName((v) => v || session.name || last?.name || '');
    setTel((v) => v || last?.phone || '');
    setMail((v) => v || session.email || '');
    if (addr) {
      setPost((v) => v || addr.post);
      setStreet((v) => v || addr.street);
      setAddr2((v) => v || addr.addr2);
    }
  }, [ready, session, mine]);

  // After placing the order the bag is cleared; keep showing what was ordered until the next page loads.
  const [frozen, setFrozen] = useState<string[] | null>(null);
  const ids = privatePay ? [] : (frozen ?? bag);
  // Prototype of the stock check right before payment: pieces that sold meanwhile drop out of the order.
  const soldNames = ids.map(getProduct).filter((p) => p?.sold).map((p) => p!.name);
  const buyIds = ids.filter((id) => getProduct(id)?.sold === false);
  const totals = orderTotals(buyIds, privatePay);
  const nothingToBuy = !privatePay && buyIds.length === 0;

  const el = useRef<Partial<Record<Field, HTMLElement | null>>>({});
  const refFor = (k: Field) => (node: HTMLElement | null) => {
    el.current[k] = node;
  };

  const digits = tel.replace(/\D/g, '');
  const dep = depTouched ? depValue : name;
  const bad: Record<Field, boolean> = {
    name: !name.trim(),
    tel: digits.length < 10 || digits.length > 11,
    mail: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim()),
    addr: !post || !street,
    pay: !pay,
    dep: pay === 'bank' && !dep.trim(),
    agree: !agree,
  };
  const show = (k: Field) => tried && bad[k];
  const anyBad = FIELD_ORDER.some((k) => bad[k]);

  const method = METHODS.find((m) => m.id === pay);
  const amount = formatPrice(totals.total).replace(/^₩\s/, '');
  const payLabel = (method ?? METHODS.find((m) => m.id === 'card')!).button.replace('{total}', amount);
  const payNote = method ? method.note : checkoutConfig.noMethodNote;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const first = FIELD_ORDER.find((k) => bad[k]);
    if (first) {
      setTried(true);
      el.current[first]?.focus();
      return;
    }
    if (nothingToBuy || !pay) return;
    // TODO(backend): stock check right before payment. If a piece sold meanwhile, charge nothing: drop it,
    // recalculate and show the "sold while you were checking out" notice (no holds, no timers).
    // TODO(backend): PG card window — for card, open it here and go on only when it reports success.
    // TODO(backend): auto-cancel after 7 days (`depositDays`) — bank-transfer orders that are never paid.
    const now = new Date();
    const id = newOrderId(now);
    const noteKo = checkoutConfig.deliveryNotes.find((n) => n.id === note)?.ko;
    saveOrder({
      id,
      date: formatDate(now),
      status: pay === 'bank' ? 'waiting for payment' : 'paid',
      method: pay,
      items: buyIds,
      payBy: pay === 'bank' ? payByDate(now) : undefined,
      depositor: pay === 'bank' ? dep.trim() : undefined,
      email: mail.trim(),
      shipTo: { name: name.trim(), phone: tel.trim(), address: `${post} ${street}${addr2.trim() ? `, ${addr2.trim()}` : ''}` },
      // The courier gets the Korean line (data/checkout.json deliveryNotes).
      note: noteKo || undefined,
      privatePay,
    });
    if (!privatePay) {
      setFrozen(ids);
      clearBag(buyIds);
    }
    router.push(`/order/complete?id=${encodeURIComponent(id)}`);
  };

  if (!ready || mustSignIn) return <main className={styles.shell} />;

  const head = (
    <>
      <h1 className={styles.title}>checkout</h1>
      {checkoutConfig.guestCheckout && !session && (
        <p className={styles.guest}>
          checking out as a guest. <Link href={signInHref(payCode ? `/checkout?pay=${encodeURIComponent(payCode)}` : '/checkout')}>sign in</Link> to
          use a saved address.
        </p>
      )}
      {soldNames.length > 0 && (
        <div role="alert" className={styles.soldNotice}>
          <p className={styles.soldLine}>{soldNames.join(', ')} sold while you were checking out.</p>
          <p className={styles.soldBody}>
            we took {soldNames.length === 1 ? 'it' : 'them'} out of your order and updated the total.
          </p>
          <p lang="ko" className={styles.soldKo}>
            결제하는 사이 다른 분이 먼저 구매했어요. 주문에서 빼고 금액을 다시 계산했어요.
          </p>
        </div>
      )}
    </>
  );

  if (nothingToBuy) {
    // TODO(design): checkout with nothing buyable has no design — the bag's empty state.
    return (
      <main className={styles.shell}>
        <div className={styles.form}>
          <div className={styles.main}>
            {head}
            <div className={styles.empty}>
              <p>your bag is empty.</p>
              <Link href="/shop" className={styles.emptyLink}>
                shop new pieces
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <form noValidate onSubmit={submit} className={styles.form}>
        <div className={styles.main}>
          {head}

          <section aria-labelledby="co-h-contact" className={`${styles.section} ${styles.first}`}>
            <h2 id="co-h-contact" className={styles.h2}>
              contact
            </h2>
            <TextField
              id="co-name"
              ref={refFor('name')}
              label="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={show('name') ? 'enter your name.' : null}
            />
            <TextField
              id="co-tel"
              ref={refFor('tel')}
              label="mobile number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="010-0000-0000"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              error={show('tel') ? 'enter your mobile number, like 010-1234-5678.' : null}
              help="we text you the tracking number."
            />
            <TextField
              id="co-mail"
              ref={refFor('mail')}
              label="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="name@example.com"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              error={show('mail') ? 'enter an email like name@example.com.' : null}
              help="your receipt and order updates go here."
            />
          </section>

          <section aria-labelledby="co-h-ship" className={styles.section}>
            <h2 id="co-h-ship" className={styles.h2}>
              shipping address
            </h2>
            <div>
              <label className={fc.label} htmlFor="co-post">
                address
              </label>
              <div className={styles.postRow}>
                <input
                  id="co-post"
                  className={`${fc.input} ${styles.post}`}
                  type="text"
                  readOnly
                  autoComplete="postal-code"
                  placeholder="postcode"
                  value={post}
                  aria-invalid={show('addr') ? true : undefined}
                  aria-describedby={show('addr') ? 'co-addr-err' : undefined}
                />
                <button
                  type="button"
                  ref={refFor('addr')}
                  className={styles.find}
                  onClick={() => {
                    // TODO(backend): Kakao (Daum) postcode window — fills the postcode and road address it returns.
                    setPost('04029');
                    setStreet('서울 마포구 와우산로 00');
                  }}
                >
                  find address
                </button>
              </div>
              {/* Shares the "address" label, so it's named with aria-label (README 8-7). */}
              <input
                className={`${fc.input} ${styles.street}`}
                type="text"
                readOnly
                aria-label="street address"
                autoComplete="address-line1"
                placeholder="street address shows after you search"
                value={street}
                aria-invalid={show('addr') ? true : undefined}
              />
              {show('addr') && (
                <p className={fc.error} id="co-addr-err">
                  search for your address.
                </p>
              )}
            </div>
            <TextField
              id="co-addr2"
              label="apt, unit, floor"
              type="text"
              autoComplete="address-line2"
              value={addr2}
              onChange={(e) => setAddr2(e.target.value)}
            />
            <Select
              id="co-note"
              label="delivery note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              options={checkoutConfig.deliveryNotes.map((n) => ({ value: n.id, label: n.label }))}
            />
          </section>

          <section aria-labelledby="co-h-pay" className={`${styles.section} ${styles.paySection}`}>
            <h2 id="co-h-pay" className={`${styles.h2} ${styles.payTitle}`}>
              payment
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="co-h-pay"
              aria-describedby={show('pay') ? 'co-pay-err' : undefined}
              className={`${styles.methods} ${show('pay') ? styles.methodsBad : ''}`}
            >
              {METHODS.map((m, i) => (
                <div key={m.id}>
                  {i > 0 && <div aria-hidden="true" className={styles.methodRule} />}
                  <label className={styles.method}>
                    <Radio
                      ref={i === 0 ? refFor('pay') : undefined}
                      name="co-pay"
                      value={m.id}
                      checked={pay === m.id}
                      onChange={() => setPay(m.id)}
                    />
                    <span className={styles.methodName}>{m.label}</span>
                    <span lang="ko" className={styles.methodKo}>
                      {m.ko}
                    </span>
                  </label>
                  {m.id === 'bank' && pay === 'bank' && (
                    <div className={styles.dep}>
                      <TextField
                        id="co-dep"
                        ref={refFor('dep')}
                        label="depositor name"
                        type="text"
                        value={dep}
                        onChange={(e) => {
                          setDepValue(e.target.value);
                          setDepTouched(true);
                        }}
                        error={show('dep') ? 'enter the name the payment will come from.' : null}
                        help="we show our account number after you place the order. pay within 7 days, or the order is cancelled."
                      />
                      <p lang="ko" className={`${fc.help} ${styles.depKo}`}>
                        주문 후 7일 안에 입금하지 않으면 주문이 취소돼요.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {show('pay') && (
              <p className={fc.error} id="co-pay-err">
                choose how to pay.
              </p>
            )}
            {/* v5.1 (README 8-7): cash payments must offer escrow. TODO(client): the escrow company name. */}
            <p className={styles.escrow}>
              {checkoutConfig.escrowNote.en}
              <span lang="ko" className={styles.escrowKo}>
                {checkoutConfig.escrowNote.ko}
              </span>
            </p>
          </section>
        </div>

        <aside className={styles.side}>
          <div className={styles.sumWrap}>
            <OrderSummary headingId="co-h-sum" ids={buyIds} privatePay={privatePay} />
          </div>

          <div className={styles.agreeWrap}>
            <div className={styles.agreeRow}>
              <Checkbox
                id="co-agree"
                ref={refFor('agree')}
                checked={agree}
                onChange={() => setAgree(!agree)}
                invalid={show('agree')}
                aria-describedby={show('agree') ? 'co-agree-err' : undefined}
              />
              <label htmlFor="co-agree" className={styles.agreeLabel}>
                {checkoutConfig.purchaseAgreement.en} <span className={styles.required}>(required)</span>
                <span lang="ko" className={styles.agreeKo}>
                  {checkoutConfig.purchaseAgreement.ko}
                </span>
              </label>
            </div>
            <Link href={site.links.terms} className={styles.terms}>
              view terms of purchase
            </Link>
            {show('agree') && (
              <p className={`${fc.error} ${styles.agreeErr}`} id="co-agree-err">
                check the box to agree before you pay.
              </p>
            )}
          </div>

          <div aria-hidden="true" className={styles.spacer} />
          <div className={styles.payBar}>
            <button type="submit" className={styles.payBtn}>
              {payLabel}
            </button>
            <p className={styles.payNote}>{payNote}</p>
          </div>
        </aside>

        <p role="status" className="visually-hidden">
          {tried && anyBad ? 'some details are missing. check the marked fields.' : ''}
        </p>
      </form>
    </main>
  );
}
