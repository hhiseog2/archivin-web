import styles from './PhotoBarsVertical.module.css';

type Props = {
  count: number;
  index: number;
  onIndex: (i: number) => void;
  /** The 92px rail it sits in (grid area `bars`); the group sticks to the top inside it. */
  className?: string;
};

/**
 * Desktop photo bars (README 8-3 `.pbars`): a sticky column of 28×28 buttons with 4×16 bars, 20px in from
 * the rail's right edge. The navy bar slides to `top: 6 + 28 × i` px (0.3s). Hidden with one photo.
 */
export function PhotoBarsVertical({ count, index, onIndex, className }: Props) {
  return (
    <div className={className}>
      {count > 1 && (
        <div role="group" aria-label="Choose photo" className={styles.group}>
          <div className={styles.column}>
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`photo ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={styles.button}
                onClick={() => onIndex(i)}
              >
                <span aria-hidden="true" className={styles.bar} />
              </button>
            ))}
            <span aria-hidden="true" className={styles.thumb} style={{ top: 6 + 28 * index }} />
          </div>
        </div>
      )}
    </div>
  );
}
