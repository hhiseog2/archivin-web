'use client';

import { useState } from 'react';
import styles from './complete.module.css';

// TODO: real bank account details (README 10).
const ACCOUNT = { bank: '[BANK]', number: '[ACCOUNT NO.]', holder: '[ACCOUNT HOLDER]' };

export function CopyAccount() {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <dl className={styles.dl}>
        <div>
          <dt>Bank</dt>
          <dd>{ACCOUNT.bank}</dd>
        </div>
        <div className={styles.accRow}>
          <dt>Account no.</dt>
          <dd className={styles.accDd}>
            <span className={styles.accNo}>{ACCOUNT.number}</span>
            <button
              type="button"
              className={`${styles.copy} ${copied ? styles.copied : ''}`}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(ACCOUNT.number);
                } catch {
                  // Clipboard blocked: the number is still on screen to copy by hand.
                }
                setCopied(true);
              }}
            >
              {copied ? 'Copied' : 'Copy'}
              <span className="visually-hidden"> account number</span>
            </button>
          </dd>
        </div>
        <div>
          <dt>Account holder</dt>
          <dd>{ACCOUNT.holder}</dd>
        </div>
        <div>
          <dt>Amount</dt>
          <dd className={styles.strong}>₩ 000,000</dd>
        </div>
        <div>
          <dt>Pay by</dt>
          <dd>[DATE] 23:59</dd>
        </div>
      </dl>
      <p lang="ko" className={styles.ko}>
        입금자명이 주문자명과 다르면 확인이 늦어질 수 있어요.
      </p>
      <p role="status" className={styles.copyStatus}>
        {copied ? 'Account number copied.' : ''}
      </p>
    </>
  );
}
