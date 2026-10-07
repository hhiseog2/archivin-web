'use client';

import { useId, type CSSProperties } from 'react';
import './exit-door.css';

const SIZES = {
  // height 28 → width 28 × 233 / 182; 2px nudge in viewBox units = 2 × 182 / 28
  mobile: { h: 28, w: 35.846, nudge: '13px', style: undefined as CSSProperties | undefined },
  // height 60 → width 76.813; nudge 6.067; 6px up so its foot meets the logo's thread baseline (README 6, 8-1)
  desktop: { h: 60, w: 76.813, nudge: '6.067px', style: { marginBottom: 6 } as CSSProperties },
};

/**
 * Intro exit-door icon: a figure running right + an arrow into an open door (README 8-1).
 * SVG copied verbatim from design/mobile/A_Intro.dc.html; motion lives in exit-door.css and is driven by
 * `.is-go` on the intro panel and `.ienter` hover / focus on the enter link. Only the size, the nudge,
 * the desktop margin and the clipPath ids differ between instances.
 * TODO: check on a real iPhone (Safari) that the limbs turn in place and the joints don't jump (README 12).
 */
export function ExitDoorIcon({ size }: { size: 'mobile' | 'desktop' }) {
  const s = SIZES[size];
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const clipFigure = `doorclip-${uid}`;
  const clipArrow = `doorclip-${uid}-a`;

  return (
    <span
      className="door"
      style={{ width: `${s.w}px`, height: `${s.h}px`, ['--door-nudge' as string]: s.nudge, ...s.style }}
    >
      <svg
        width={s.w}
        height={s.h}
        viewBox="0 0 233 182"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <clipPath id={clipFigure}>
          <rect x="-80" y="-80" width="224" height="342" />
        </clipPath>
        <g clipPath={`url(#${clipFigure})`}>
          <g className="walker">
            <g className="bob">
              <g className="thB">
                <line x1="66" y1="111.5" x2="66" y2="138.5" strokeWidth="13.95" />
                <g className="knB">
                  <line x1="66" y1="138.5" x2="66" y2="165.5" strokeWidth="13.95" />
                </g>
              </g>
              <g className="thF">
                <line x1="66" y1="111.5" x2="66" y2="138.5" strokeWidth="13.95" />
                <g className="knF">
                  <line x1="66" y1="138.5" x2="66" y2="165.5" strokeWidth="13.95" />
                </g>
              </g>
              <g className="upper">
                <g className="arB">
                  <line x1="54" y1="65" x2="34.5" y2="81.5" strokeWidth="13.95" />
                </g>
                <line x1="72.5" y1="63" x2="63" y2="101" strokeWidth="24.3" />
                <circle cx="81.5" cy="32" r="15" fill="currentColor" stroke="none" />
                <g className="arF">
                  <line x1="79" y1="66" x2="99" y2="79" strokeWidth="13.95" />
                  <g className="elF">
                    <line x1="99" y1="79" x2="114.5" y2="72" strokeWidth="13.95" />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
        <clipPath id={clipArrow}>
          <rect x="98" y="-80" width="115.75" height="342" />
        </clipPath>
        <g clipPath={`url(#${clipArrow})`}>
          <g className="nudge">
            <g className="arrow">
              <line x1="136.25" y1="91" x2="174" y2="91" strokeWidth="15" strokeLinecap="butt" />
              <path d="M170.5 71.5 L170.5 110.5 L197.5 91 Z" fill="currentColor" strokeWidth="5" />
            </g>
          </g>
        </g>
        <line x1="221.5" y1="12.75" x2="221.5" y2="170.25" strokeWidth="15.5" />
        <g className="dTop">
          <line x1="132" y1="12.75" x2="221.5" y2="12.75" strokeWidth="15.5" />
        </g>
        <g className="dBot">
          <line x1="132" y1="170.25" x2="221.5" y2="170.25" strokeWidth="15.5" />
        </g>
        <g className="dA">
          <line x1="132" y1="12.75" x2="132" y2="57.25" strokeWidth="15.5" />
        </g>
        <g className="dB">
          <line x1="132" y1="46.5" x2="132" y2="91" strokeWidth="15.5" />
        </g>
        <g className="dC">
          <line x1="132" y1="125.75" x2="132" y2="170.25" strokeWidth="15.5" />
        </g>
        <g className="dD">
          <line x1="132" y1="91" x2="132" y2="135.5" strokeWidth="15.5" />
        </g>
      </svg>
    </span>
  );
}
