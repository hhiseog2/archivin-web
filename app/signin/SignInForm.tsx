'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ui from '@/components/ui.module.css';
import parked from '@/components/parked.module.css';
import styles from './signin.module.css';

export function SignInForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  return (
    <main className={`${parked.column} ${styles.main}`}>
      <h1 className={ui.pageTitle}>Sign in</h1>
      <p className={parked.lead}>See your orders and check out with a saved address.</p>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          // TODO: authenticate (ID/email + password) against the account API, then redirect.
          router.push('/mypage');
        }}
      >
        <div>
          <label htmlFor="si-id" className={ui.fieldLabel}>
            ID or email
          </label>
          <input id="si-id" type="text" autoComplete="username" autoCapitalize="none" className={ui.input} />
        </div>
        <div className={styles.pw}>
          <label htmlFor="si-pw" className={ui.fieldLabel}>
            Password
          </label>
          <div className={styles.pwBox}>
            <input
              id="si-pw"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              className={styles.pwInput}
            />
            <button
              type="button"
              aria-controls="si-pw"
              aria-pressed={show}
              className={styles.pwToggle}
              onClick={() => setShow(!show)}
            >
              {show ? 'Hide' : 'Show'}
              <span className="visually-hidden"> password</span>
            </button>
          </div>
        </div>
        <label className={`${ui.checkRow} ${styles.keep}`}>
          <input type="checkbox" className={ui.checkbox} />
          Keep me signed in on this device
        </label>

        <button type="submit" className={`${ui.btnPrimary} ${styles.submit}`}>
          Sign in
        </button>
      </form>
      <div className={styles.help}>
        {/* TODO: ID lookup / password reset flows */}
        <a href="#">Find my ID</a>
        <a href="#">Reset password</a>
      </div>

      <section aria-labelledby="new" className={parked.rule}>
        <h2 id="new" className={parked.sectionTitle}>
          New to ARCHIVIN?
        </h2>
        <p className={styles.note}>You don&apos;t need an account to buy. Make one to track orders and save your address.</p>
        {/* TODO: sign-up */}
        <a href="#" className={`${ui.btnSecondary} ${styles.create}`}>
          Create account
        </a>
      </section>

      <section aria-labelledby="guest" className={parked.rule}>
        <h2 id="guest" className={parked.sectionTitle}>
          Ordered as a guest?
        </h2>
        {/* TODO: guest order lookup */}
        <a href="#" className={styles.lookup}>
          Look up your order with the order number
        </a>
      </section>
    </main>
  );
}
