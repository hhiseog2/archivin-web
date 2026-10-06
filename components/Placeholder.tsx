import type { CSSProperties } from 'react';
import ui from './ui.module.css';

type Props = {
  /** Text shown inside the grey well, e.g. "[FRONT 4:5]". Hidden from screen readers. */
  label?: string;
  /** Real image URL. When missing, the grey placeholder from the design shows. */
  src?: string | null;
  alt?: string;
  ratio?: string;
  className?: string;
  style?: CSSProperties;
};

/** Image well: photo when there is one, otherwise the design's grey placeholder. */
export function Placeholder({ label, src, alt = '', ratio, className, style }: Props) {
  return (
    <div className={`${ui.well} ${className ?? ''}`} style={{ aspectRatio: ratio, ...style }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} />
      ) : label ? (
        <span aria-hidden="true">{label}</span>
      ) : null}
    </div>
  );
}
