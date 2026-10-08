'use client';

import { useLocale, useTranslations } from 'next-intl';
import { LOCALES } from '@/shared';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/**
 * Dil seçici — TR | EN.
 *
 * Aktif dil link değil, `aria-current` taşıyan bir metindir; yalnızca diğer
 * dil tıklanabilir. `usePathname` next-intl'in dahili yolunu döndürdüğü için
 * kullanıcı bulunduğu sayfanın karşılığına gider (`/hizmetler` → `/en/services`),
 * ana sayfaya düşmez.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('locale');
  const activeLocale = useLocale();
  const pathname = usePathname();

  return (
    <div
      className={cn('flex items-center gap-1 font-mono text-mono-sm', className)}
      role="group"
      aria-label={t('label')}
    >
      {LOCALES.map((locale, index) => {
        const isActive = locale === activeLocale;
        const label = locale.toUpperCase();

        return (
          <span key={locale} className="flex items-center gap-1">
            {index > 0 && (
              <span aria-hidden="true" className="text-line-strong">
                /
              </span>
            )}
            {isActive ? (
              <span aria-current="true" className="text-fg">
                {label}
              </span>
            ) : (
              <Link
                href={pathname}
                locale={locale}
                // Görünen etiket erişilebilir ismin başında kalmalı (WCAG 2.5.3):
                // sesli komutla "EN" diyen kullanıcı linki bulabilsin.
                aria-label={`${label} — ${t('switchTo')}`}
                hrefLang={locale}
                lang={locale}
                className="rounded-xs text-fg-subtle transition-colors duration-[var(--duration-fast)] hover:text-fg"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
