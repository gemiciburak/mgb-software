import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { ComponentProps } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

/**
 * Buton stilleri.
 *
 * Köşe yuvarlaklığı 4px — blueprint hassasiyeti için bilinçli olarak dar,
 * pill buton yok. Birincil butonda koyu temada vurgu zemini üzerine ink
 * metin kullanılır: beyaz metin o zeminde AA'yı geçmiyor (3.69:1).
 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-sm font-sans font-medium ' +
  'transition-colors duration-[var(--duration-fast)] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent ' +
  'disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
  secondary: 'border border-line-strong text-fg hover:border-accent hover:text-accent',
  ghost: 'text-fg-muted hover:bg-accent-wash hover:text-fg',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-body-sm',
  md: 'h-12 px-6 text-body',
};

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <button className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

/**
 * Dil farkında buton bağlantısı. `next/link` yerine next-intl'in `Link`'i
 * kullanılır, böylece yollar aktif dile çevrilir.
 */
export function ButtonLink({
  variant,
  size,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <Link className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
