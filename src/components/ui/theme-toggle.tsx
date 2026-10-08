'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/cn';
import { MoonIcon, SunIcon, SystemIcon } from './icons';

/**
 * Üç durumlu tema düğmesi: sistem → açık → koyu → sistem.
 *
 * Üç durum bilinçli: "sistem tercihini izle" gerçek bir durumdur ve iki
 * durumlu bir anahtarla ifade edilemez. Seçim localStorage'da saklanır,
 * ilk boyamadan önce inline script uygular — flash olmaz.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations('theme');
  const { choice, cycle } = useTheme();

  const labels = {
    system: t('system'),
    light: t('light'),
    dark: t('dark'),
  } as const;

  const Icon = { system: SystemIcon, light: SunIcon, dark: MoonIcon }[choice];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={t('cycle', { current: labels[choice] })}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-sm text-fg-muted',
        'transition-colors duration-[var(--duration-fast)]',
        'hover:bg-accent-wash hover:text-fg',
        className,
      )}
    >
      <Icon />
    </button>
  );
}
