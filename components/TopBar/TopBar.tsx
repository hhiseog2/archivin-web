import { HANDWRITING_PATHS } from './handwriting';
import hw from './handwriting.module.css';
import styles from './TopBar.module.css';

/**
 * Black 52px bar with the handwritten "hello my name is Archivin".
 * `animated` (home only) writes the strokes on; reduced-motion users get the still line.
 */
export function TopBar({ animated = false }: { animated?: boolean }) {
  return (
    <div className={styles.bar}>
      <svg
        role="img"
        aria-label="hello my name is Archivin"
        viewBox="-6 -41 576 71"
        width="288"
        height="35.5"
        className={styles.svg}
      >
        <g className={`${styles.strokes} ${animated ? hw.animated : ''}`}>
          {HANDWRITING_PATHS.map((d, i) => (
            <path key={i} d={d} className={`${hw.hw} ${hw[`hw${i}`] ?? ''}`} />
          ))}
        </g>
      </svg>
    </div>
  );
}
