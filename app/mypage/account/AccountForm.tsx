'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { Checkbox, TextField, formClasses as f } from '@/components/Form/Form';
import { signIn, type Session } from '@/lib/auth';
import { checkoutConfig } from '@/lib/catalog';
import { passwordOk } from '../../signin/SignInForm';
import { MemberGate } from '../MemberGate';
import ui from '@/components/ui.module.css';
import styles from '../mypage.module.css';

const digits = (v: string) => v.replace(/\D/g, '').length;
/** The two optional sign-up agreements (SMS · email news) can be changed here. */
const NEWS = checkoutConfig.signUpAgreements.filter((a) => !a.required);

/**
 * my page → account details. TODO(design): no screen in the handoff (README 12) — the sign-up fields
 * (A21_SignIn ③) with the same form elements. Email is the member ID, so it is read-only.
 */
function Account({ session }: { session: NonNullable<Session> }) {
  const [name, setName] = useState(session.name ?? '');
  const [tel, setTel] = useState('');
  const [npw, setNpw] = useState('');
  const [news, setNews] = useState<boolean[]>(() => NEWS.map(() => false));
  const [tried, setTried] = useState(false);
  const [saved, setSaved] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const telRef = useRef<HTMLInputElement>(null);
  const npwRef = useRef<HTMLInputElement>(null);

  // Mobile number and a new password are optional here; when given they follow the sign-up rules.
  const telBad = tel.trim() !== '' && digits(tel) < 10;
  const npwBad = npw !== '' && !passwordOk(npw);
  const eName = tried && !name.trim();
  const eTel = tried && telBad;
  const eNpw = tried && npwBad;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const firstBad = !name.trim() ? nameRef.current : telBad ? telRef.current : npwBad ? npwRef.current : null;
    if (firstBad) {
      setTried(true);
      setSaved(false);
      firstBad.focus();
      return;
    }
    // TODO(backend): update the member (name, mobile, password, SMS · email news agreements).
    signIn(session.email, name.trim());
    setNpw('');
    setTried(false);
    setSaved(true);
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>account details</h1>
      <form onSubmit={submit} noValidate className={styles.form} onChange={() => setSaved(false)}>
        <TextField id="ac-email" label="email" type="email" autoComplete="username" value={session.email} readOnly />
        <TextField
          ref={nameRef as React.Ref<HTMLInputElement>}
          id="ac-name"
          label="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={eName ? 'enter your name.' : null}
        />
        <TextField
          ref={telRef as React.Ref<HTMLInputElement>}
          id="ac-tel"
          label="mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="010-0000-0000"
          value={tel}
          onChange={(e) => setTel(e.target.value)}
          error={eTel ? 'enter a mobile number like 010-0000-0000.' : null}
        />
        <div>
          <label className={f.label} htmlFor="ac-npw">
            new password
          </label>
          <input
            ref={npwRef}
            id="ac-npw"
            className={f.input}
            type="password"
            autoComplete="new-password"
            value={npw}
            onChange={(e) => setNpw(e.target.value)}
            aria-invalid={eNpw || undefined}
            aria-describedby="ac-npw-help"
          />
          <p className={eNpw ? f.error : f.help} id="ac-npw-help">
            8 or more characters, with at least two of letters, numbers and symbols.
          </p>
        </div>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>news</legend>
          {NEWS.map((a, i) => (
            <Checkbox key={a.id} checked={news[i]} onChange={() => setNews(news.map((v, j) => (j === i ? !v : v)))}>
              {a.label}
              <span lang="ko" className={styles.ko}>
                {a.ko}
              </span>
            </Checkbox>
          ))}
        </fieldset>
        <button type="submit" className={`${ui.btnPrimary} ${styles.save}`}>
          save
        </button>
      </form>
      <p role="status" className={styles.saved}>
        {saved ? 'saved.' : ''}
      </p>
      <Link href="/mypage" className={`${styles.textBtn} ${styles.back}`}>
        back to my page
      </Link>
    </main>
  );
}

export function AccountForm() {
  return <MemberGate path="/mypage/account">{(s) => <Account session={s} />}</MemberGate>;
}
