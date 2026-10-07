import styles from './Popup.module.css';

/** Plain navy check, 16×12 (README 7). The include-sold box uses it at 10×8. */
export function Check({ small }: { small?: boolean }) {
  return (
    <svg
      className={styles.check}
      width={small ? 10 : 16}
      height={small ? 8 : 12}
      viewBox="0 0 16 12"
      aria-hidden="true"
      style={small ? { top: 4, left: 3 } : undefined}
    >
      <path d="M1.5 6.5l4 4 9-9" />
    </svg>
  );
}
