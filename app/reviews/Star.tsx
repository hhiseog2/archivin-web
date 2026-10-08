/** Review star (README 7): 12px in the list (line 1.6), 24px in the write form (line 1.4). */
export function Star({ size, fill, stroke, strokeWidth }: { size: number; fill: string; stroke: string; strokeWidth: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.1 6.3 20.3l1.2-6.4-4.7-4.4 6.4-.8z" />
    </svg>
  );
}
