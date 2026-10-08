'use client';

import type { ButtonHTMLAttributes } from 'react';
import s from './SizeChip.module.css';

/** Size chip (README 8-2, `.szchip`): pill, 44px mobile / 40px desktop, navy fill when picked. */
export function SizeChip({
  pressed,
  className,
  children,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> & { pressed: boolean }) {
  return (
    <button type="button" {...rest} aria-pressed={pressed} className={[s.chip, className].filter(Boolean).join(' ')}>
      {children}
    </button>
  );
}
