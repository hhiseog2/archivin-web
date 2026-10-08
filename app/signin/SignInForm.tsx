'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { TextField, formClasses as f } from '@/components/Form/Form';
import { signIn } from '@/lib/auth';
import { checkoutConfig } from '@/lib/catalog';
import { createPersistentStore } from '@/lib/persistent-store';
import { formatPrice } from '@/lib/format';
import { SAMPLE_ORDERS, getOrder, useMyOrders, type Order } from '@/lib/orders';
import { orderPhotos, orderTotal, piecesLabel, statusLine } from '../mypage/orderText';
import ui from '@/components/ui.module.css';
import styles from './signin.module.css';

/**
 * Sign in (README 8-6, A21_SignIn · A21_DSignIn): one screen, identifier first.
 * ① email → ② password (has an account) or ③ create an account, ④ guest order lookup (only with guestCheckout).
 */

type Step = 'email' | 'pw' | 'new' | 'lookup';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits = (v: string) => v.replace(/\D/g, '').length;
const AGREEMENTS = checkoutConfig.signUpAgreements;

/** archivin.kr rule: 8+ characters with at least two of letters / numbers / symbols (the 16-character cap is dropped). */
export function passwordOk(pw: string) {
  const { min, kinds } = checkoutConfig.signUp.password;
  const n = [/[A-Za-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  return pw.length >= min && n >= kinds;
}

/**
 * Prototype "has an account" check. The design switches it with a prop; here an email counts as new when
 * its name starts with "new" (the design's sample new@example.com) unless it already joined on this device.
 * TODO(backend): ask the member API whether the email has an account.
 */
const joined = createPersistentStore<string[]>('archivin:joined', []);
function hasAccount(email: string) {
  const e = email.trim().toLowerCase();
  return joined.get().includes(e) || !/^new/.test(e);
}

export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const mine = useMyOrders();
  const [step, setStep] = useState<Step>('email');
  const [tried, setTried] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState('');
  const [ntel, setNtel] = useState('');
  const [npw, setNpw] = useState('');
  const [ag, setAg] = useState<boolean[]>(() => AGREEMENTS.map(() => false));
  const [ord, setOrd] = useState('');
  const [otel, setOtel] = useState('');
  const [found, setFound] = useState<Order | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const ntelRef = useRef<HTMLInputElement>(null);
  const npwRef = useRef<HTMLInputElement>(null);
  const agRefs = useRef<(HTMLInputElement | null)[]>([]);
  const ordRef = useRef<HTMLInputElement>(null);
  const otelRef = useRef<HTMLInputElement>(null);

  // A step change comes from the visitor's click → focus the new step's first field. Not on first open (README 8-6).
  const shownStep = useRef(step);
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    const el = { email: emailRef, pw: pwRef, new: nameRef, lookup: ordRef }[step].current;
    el?.focus({ preventScroll: true });
  }, [step]);

  const go = (s: Step) => {
    setStep(s);
    setTried(false);
    setFound(null);
  };

  const finish = (who: string, memberName?: string) => {
    signIn(who, memberName);
    router.push(next);
  };

  const okMail = EMAIL_RE.test(email.trim());
  const telOk = digits(ntel) >= 10;
  const npwOk = passwordOk(npw);
  const agOk = AGREEMENTS.every((a, i) => !a.required || ag[i]);
  const agAll = ag.every(Boolean);

  const eE = tried && step === 'email' && !okMail;
  const eP = tried && step === 'pw' && !pw;
  const eN = tried && step === 'new' && !name.trim();
  const eNt = tried && step === 'new' && !telOk;
  const eNp = tried && step === 'new' && !npwOk;
  const eAg = tried && step === 'new' && !agOk;
  const eO = tried && step === 'lookup' && !ord.trim();
  const eT = tried && step === 'lookup' && digits(otel) < 10;

  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    if (!okMail) {
      setTried(true);
      emailRef.current?.focus();
      return;
    }
    go(hasAccount(email) ? 'pw' : 'new');
  };

  const submitPw = (e: FormEvent) => {
    e.preventDefault();
    if (!pw) {
      setTried(true);
      pwRef.current?.focus();
      return;
    }
    // TODO(backend): sign in (check the password, start the member session).
    finish(email.trim());
  };

  const submitNew = (e: FormEvent) => {
    e.preventDefault();
    const firstBad = !name.trim()
      ? nameRef.current
      : !telOk
        ? ntelRef.current
        : !npwOk
          ? npwRef.current
          : !agOk
            ? agRefs.current[AGREEMENTS.findIndex((a, i) => a.required && !ag[i])]
            : null;
    if (firstBad) {
      setTried(true);
      firstBad.focus();
      return;
    }
    // TODO(backend): sign up (name, mobile, password, agreements) and send the email confirmation link.
    const who = email.trim();
    joined.set((list) => [...list.filter((x) => x !== who.toLowerCase()), who.toLowerCase()]);
    finish(who, name.trim());
  };

  const submitLookup = (e: FormEvent) => {
    e.preventDefault();
    const firstBad = !ord.trim() ? ordRef.current : digits(otel) < 10 ? otelRef.current : null;
    if (firstBad) {
      setTried(true);
      setFound(null);
      firstBad.focus();
      return;
    }
    // TODO(backend): guest order lookup (order number + the mobile number it was placed with).
    // The design always finds its sample order; we show the typed order when it exists here.
    setTried(false);
    setFound(getOrder(ord.trim(), mine) ?? SAMPLE_ORDERS[0]);
  };

  const emailLine = (
    <p className={styles.lead}>
      {email.trim()} ·{' '}
      <button type="button" className={styles.inlineBtn} onClick={() => go('email')}>
        change
      </button>
    </p>
  );

  return (
    <main className={styles.main}>
      {step === 'email' && (
        <>
          <h1 className={styles.title}>sign in</h1>
          <p className={styles.lead}>see prices, keep your address for checkout and track your orders. joining is free.</p>
          <form onSubmit={submitEmail} noValidate className={styles.form}>
            <TextField
              ref={emailRef as React.Ref<HTMLInputElement>}
              id="si-email"
              label="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={eE ? 'enter an email like name@example.com.' : null}
            />
            <button type="submit" className={`${ui.btnPrimary} ${styles.submit}`}>
              continue
            </button>
          </form>
          <p className={styles.note}>if you&apos;re new, you&apos;ll make an account in the next step.</p>
          {checkoutConfig.guestCheckout && (
            <div className={styles.guest}>
              <h2 className={styles.guestTitle}>ordered as a guest?</h2>
              <button type="button" className={styles.textBtn} onClick={() => go('lookup')}>
                find your order
              </button>
            </div>
          )}
        </>
      )}

      {step === 'pw' && (
        <>
          <h1 className={styles.title}>welcome back</h1>
          {emailLine}
          <form onSubmit={submitPw} noValidate className={styles.form}>
            {/* For password managers. */}
            <input type="email" autoComplete="username" value={email.trim()} readOnly tabIndex={-1} aria-hidden="true" hidden />
            <label className={f.label} htmlFor="si-pw">
              password
            </label>
            <div className={styles.pwBox}>
              <input
                ref={pwRef}
                id="si-pw"
                className={`${f.input} ${styles.pwInput}`}
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                aria-invalid={eP || undefined}
                aria-describedby={eP ? 'si-pw-err' : undefined}
              />
              <button
                type="button"
                className={styles.pwToggle}
                aria-controls="si-pw"
                aria-pressed={showPw}
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? 'hide' : 'show'}
              </button>
            </div>
            {eP && (
              <p className={f.error} id="si-pw-err">
                enter your password.
              </p>
            )}
            <button type="submit" className={`${ui.btnPrimary} ${styles.submit}`}>
              sign in
            </button>
          </form>
          {/* TODO(backend): password reset (email a reset link). No screen in the design yet. */}
          <a href="#" className={`${styles.textBtn} ${styles.forgot}`} onClick={(e) => e.preventDefault()}>
            forgot your password?
          </a>
        </>
      )}

      {step === 'new' && (
        <>
          <h1 className={styles.title}>create an account</h1>
          {emailLine}
          <form onSubmit={submitNew} noValidate className={`${styles.form} ${styles.stack}`}>
            <TextField
              ref={nameRef as React.Ref<HTMLInputElement>}
              id="si-name"
              label="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={eN ? 'enter your name.' : null}
            />
            <TextField
              ref={ntelRef as React.Ref<HTMLInputElement>}
              id="si-ntel"
              label="mobile number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="010-0000-0000"
              value={ntel}
              onChange={(e) => setNtel(e.target.value)}
              error={eNt ? 'enter a mobile number like 010-0000-0000.' : null}
            />
            <div>
              <label className={f.label} htmlFor="si-npw">
                password
              </label>
              <input
                ref={npwRef}
                id="si-npw"
                className={f.input}
                type="password"
                autoComplete="new-password"
                value={npw}
                onChange={(e) => setNpw(e.target.value)}
                aria-invalid={eNp || undefined}
                aria-describedby="si-npw-help"
              />
              {/* The rule itself turns into the error (README 8-6). */}
              <p className={eNp ? f.error : f.help} id="si-npw-help">
                8 or more characters, with at least two of letters, numbers and symbols.
              </p>
            </div>

            <fieldset className={styles.agree} aria-describedby={eAg ? 'si-ag-err' : undefined}>
              <legend className="visually-hidden">agreements</legend>
              <label className={styles.agAll}>
                <input
                  type="checkbox"
                  className={f.checkbox}
                  checked={agAll}
                  onChange={() => setAg(ag.map(() => !agAll))}
                />
                agree to all
              </label>
              <div aria-hidden="true" className={styles.agRule} />
              <div className={styles.agList}>
                {AGREEMENTS.map((a, i) => {
                  const id = `si-ag-${a.id}`;
                  const link = 'link' in a ? a.link : undefined;
                  return (
                    <div key={a.id} className={styles.agRow}>
                      <input
                        ref={(el) => {
                          agRefs.current[i] = el;
                        }}
                        id={id}
                        type="checkbox"
                        className={f.checkbox}
                        checked={ag[i]}
                        onChange={() => setAg(ag.map((v, j) => (j === i ? !v : v)))}
                        aria-invalid={(eAg && a.required && !ag[i]) || undefined}
                      />
                      <label htmlFor={id} className={styles.agLabel}>
                        {a.label} <span className={styles.agNeed}>{a.required ? '(required)' : '(optional)'}</span>
                        <span lang="ko" className={styles.ko}>
                          {a.ko}
                        </span>
                      </label>
                      {link && (
                        <Link href={link} className={styles.agView} aria-label={`view ${a.label}`}>
                          view
                        </Link>
                      )}
                    </div>
                  );
                })}
                <p className={styles.agNote}>
                  order updates come either way.
                  <span lang="ko" className={styles.koLine}>
                    주문·배송 안내는 동의와 상관없이 보내요.
                  </span>
                </p>
              </div>
            </fieldset>
            {eAg && (
              <p className={`${f.error} ${styles.agErr}`} id="si-ag-err">
                agree to the required items to continue.
              </p>
            )}
            <button type="submit" className={`${ui.btnPrimary} ${styles.create}`}>
              create account
            </button>
          </form>
          {/* TODO(backend): email confirmation link after joining (archivin.kr confirms by email too). */}
          <p className={styles.note}>we&apos;ll send a link to {email.trim()} to confirm it&apos;s yours.</p>
        </>
      )}

      {step === 'lookup' && (
        <>
          <h1 className={styles.title}>find a guest order</h1>
          <p className={styles.lead}>use the order number from your order text or email.</p>
          <form onSubmit={submitLookup} noValidate className={`${styles.form} ${styles.stack}`}>
            <TextField
              ref={ordRef as React.Ref<HTMLInputElement>}
              id="si-ord"
              label="order number"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="20261008-0001"
              value={ord}
              onChange={(e) => setOrd(e.target.value)}
              error={eO ? 'enter the order number.' : null}
            />
            <TextField
              ref={otelRef as React.Ref<HTMLInputElement>}
              id="si-otel"
              label="mobile number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="010-0000-0000"
              value={otel}
              onChange={(e) => setOtel(e.target.value)}
              error={eT ? 'enter the mobile number you ordered with.' : null}
            />
            <button type="submit" className={`${ui.btnPrimary} ${styles.create}`}>
              find order
            </button>
          </form>
          {found && (
            <section role="status" aria-label={`Order ${found.id}`} className={styles.found}>
              <p className={styles.foundNo}>order {found.id}</p>
              <p className={styles.foundStatus}>{statusLine(found, true)}</p>
              <div className={styles.thumbs}>
                {orderPhotos(found).map((p) =>
                  p.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p.id} src={p.src} alt="" className={styles.thumb} />
                  ) : (
                    <span key={p.id} aria-hidden="true" className={styles.thumb} />
                  ),
                )}
              </div>
              <p className={styles.foundSum}>
                {piecesLabel(found)} · {formatPrice(orderTotal(found))}
              </p>
              {found.status === 'waiting for payment' && (
                <Link href={`/order/complete?id=${encodeURIComponent(found.id)}`} className={styles.textBtn}>
                  see the account to pay
                </Link>
              )}
            </section>
          )}
          <button type="button" className={`${styles.textBtn} ${styles.back}`} onClick={() => go('email')}>
            back to sign in
          </button>
        </>
      )}
    </main>
  );
}
