'use client';

import { useState } from 'react';
import { checkoutConfig } from '@/lib/catalog';
import styles from './complete.module.css';

// TODO(client): the real bank account (bank · number · holder) — data/checkout.json bankAccount.
const ACCOUNT = checkoutConfig.bankAccount;

/** Bank-transfer box (A21_OrderDone): key-value rows, `copy` for the account number, then the depositor note. */
export function CopyAccount({ amount, payBy, depositor }: { amount: string; payBy: string; depositor?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <section aria-label="Bank transfer" className={styles.bankBox}>
        <dl className={styles.kv}>
          <div>
            <dt>bank</dt>
            <dd>{ACCOUNT.bank}</dd>
          </div>
          <div className={styles.accountRow}>
            <dt>account</dt>
            <dd className={styles.accountDd}>
              <span>{ACCOUNT.number}</span>
              <button
                type="button"
                className={styles.copy}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(ACCOUNT.number);
                  } catch {
                    // Clipboard blocked: the number is still on screen to copy by hand.
                  }
                  setCopied(true);
                }}
              >
                {copied ? 'copied' : 'copy'}
                <span className="visually-hidden"> account number</span>
              </button>
            </dd>
          </div>
          <div>
            <dt>holder</dt>
            <dd>{ACCOUNT.holder}</dd>
          </div>
          <div>
            <dt>amount</dt>
            <dd>{amount}</dd>
          </div>
          <div>
            <dt>pay by</dt>
            <dd>{payBy} 23:59</dd>
          </div>
          {depositor && (
            <div>
              <dt>depositor</dt>
              <dd>{depositor}</dd>
            </div>
          )}
        </dl>
        <p className={styles.bankNote}>
          send it under this name. if it&apos;s different, text us so we can match it. unpaid orders are cancelled after{' '}
          {checkoutConfig.depositDays} days.
        </p>
        <p lang="ko" className={styles.bankKo}>
          입금자명이 다르면 확인이 늦어질 수 있어요. {checkoutConfig.depositDays}일 안에 입금하지 않으면 주문이 취소돼요.
        </p>
      </section>
      <p role="status" className="visually-hidden">
        {copied ? 'account number copied.' : ''}
      </p>
    </>
  );
}
