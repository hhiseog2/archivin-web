type IconProps = { size?: number; strokeWidth?: number };

const base = (size: number, strokeWidth: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'square' as const,
  'aria-hidden': true,
  focusable: false,
});

export function SearchIcon({ size = 22, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </svg>
  );
}

export function MenuIcon({ size = 22, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  );
}

export function BagIcon({ size = 22, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M4 8h16l-1.2 13H5.2L4 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function CloseIcon({ size = 22, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function PlusIcon({ size = 16, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M12 4v16M4 12h16" />
    </svg>
  );
}

export function MinusIcon({ size = 16, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M4 12h16" />
    </svg>
  );
}

export function CheckIcon({ size = 16, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

export function ChevronLeft({ size = 16, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function ChevronRight({ size = 16, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronDown({ size = 14, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ArrowRight({ size = 22, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function FilterIcon({ size = 16, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M3 6h18M6 12h12M10 18h4" />
    </svg>
  );
}

export function StarIcon({ size = 14, filled, strokeWidth = 1.5 }: { size?: number; filled: boolean; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'var(--color-ink)' : 'none'}
      stroke="var(--color-ink)"
      strokeWidth={strokeWidth}
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2.5l2.9 6.2 6.7.7-5 4.6 1.4 6.6L12 17.3 6 20.6l1.4-6.6-5-4.6 6.7-.7z" />
    </svg>
  );
}

/* ---- Handoff v2 icons (README 7: 1.25–1.5px strokes, currentColor) ---- */

/** ▾ next to "all" (11px). */
export function Caret({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** Check mark in the category menu (14px). */
export function Check({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

/** Intro "shop →" arrow (24×12). */
export function IntroArrow() {
  return (
    <svg width={24} height={12} viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
      <path d="M0 6h22.5M17 1l5.5 5-5.5 5" />
    </svg>
  );
}

/** Accordion ↓ (10×14). Rotates to ↑ when open. */
export function DownArrow({ className }: { className?: string }) {
  return (
    <svg width={10} height={14} viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden="true" className={className}>
      <path d="M5 0.5v12.5M1 9l4 4 4-4" />
    </svg>
  );
}
