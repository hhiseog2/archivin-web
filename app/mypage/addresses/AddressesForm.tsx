'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { Select, TextField, formClasses as f } from '@/components/Form/Form';
import { checkoutConfig } from '@/lib/catalog';
import { MemberGate } from '../MemberGate';
import ui from '@/components/ui.module.css';
import styles from '../mypage.module.css';

const digits = (v: string) => v.replace(/\D/g, '').length;

/**
 * my page → addresses. TODO(design): no screen in the handoff (README 12) — the checkout shipping fields
 * (A21_Checkout) with the same form elements.
 */
function Addresses({ defaultName }: { defaultName: string }) {
  const [name, setName] = useState(defaultName);
  const [tel, setTel] = useState('');
  const [post, setPost] = useState('');
  const [street, setStreet] = useState('');
  const [addr2, setAddr2] = useState('');
  const [note, setNote] = useState('none');
  const [tried, setTried] = useState(false);
  const [saved, setSaved] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const telRef = useRef<HTMLInputElement>(null);
  const findRef = useRef<HTMLButtonElement>(null);

  const eName = tried && !name.trim();
  const eTel = tried && digits(tel) < 10;
  const eAddr = tried && (!post || !street);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const firstBad = !name.trim() ? nameRef.current : digits(tel) < 10 ? telRef.current : !post || !street ? findRef.current : null;
    if (firstBad) {
      setTried(true);
      setSaved(false);
      firstBad.focus();
      return;
    }
    // TODO(backend): save the member's shipping address (checkout fills it in for signed-in members).
    setTried(false);
    setSaved(true);
  };

  const edit = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setSaved(false);
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>addresses</h1>
      <form onSubmit={submit} noValidate className={styles.form}>
        <TextField
          ref={nameRef as React.Ref<HTMLInputElement>}
          id="ad-name"
          label="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => edit(setName)(e.target.value)}
          error={eName ? 'enter your name.' : null}
        />
        <TextField
          ref={telRef as React.Ref<HTMLInputElement>}
          id="ad-tel"
          label="mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="010-0000-0000"
          value={tel}
          onChange={(e) => edit(setTel)(e.target.value)}
          error={eTel ? 'enter a mobile number like 010-0000-0000.' : null}
        />
        <div>
          <label className={f.label} htmlFor="ad-post">
            address
          </label>
          <div className={styles.addrRow}>
            <input
              id="ad-post"
              className={f.input}
              type="text"
              readOnly
              autoComplete="postal-code"
              placeholder="postcode"
              value={post}
              aria-invalid={eAddr || undefined}
              aria-describedby={eAddr ? 'ad-addr-err' : undefined}
            />
            <button
              ref={findRef}
              type="button"
              className={styles.findBtn}
              onClick={() => {
                // TODO(backend): Kakao (Daum) postcode window fills postcode + street address. Fake value like the checkout design.
                edit(setPost)('04029');
                setStreet('서울 마포구 와우산로 00');
              }}
            >
              find address
            </button>
          </div>
          <input
            className={`${f.input} ${styles.street}`}
            type="text"
            readOnly
            aria-label="street address"
            autoComplete="address-line1"
            placeholder="street address shows after you search"
            value={street}
            aria-invalid={eAddr || undefined}
          />
          {eAddr && (
            <p className={f.error} id="ad-addr-err">
              search for your address.
            </p>
          )}
        </div>
        <TextField
          id="ad-addr2"
          label="apt, unit, floor"
          type="text"
          autoComplete="address-line2"
          value={addr2}
          onChange={(e) => edit(setAddr2)(e.target.value)}
        />
        <Select
          id="ad-note"
          label="delivery note (optional)"
          value={note}
          onChange={(e) => edit(setNote)(e.target.value)}
          options={checkoutConfig.deliveryNotes.map((n) => ({ value: n.id, label: n.label }))}
        />
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

export function AddressesForm() {
  return <MemberGate path="/mypage/addresses">{(s) => <Addresses defaultName={s.name ?? ''} />}</MemberGate>;
}
