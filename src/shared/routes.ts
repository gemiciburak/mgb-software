import type { Locale } from './locale';

/**
 * Yerelleştirilmiş yollar.
 *
 * Anahtarlar dosya sistemi rotalarıdır (İngilizce, geliştirici tarafı);
 * değerler kullanıcının adres çubuğunda gördüğü yollardır.
 * next-intl bu haritayı doğrudan tüketir; sitemap ve hreflang da buradan türer.
 */
export const PATHNAMES = {
  '/': '/',
  '/services': { tr: '/hizmetler', en: '/services' },
  '/work': { tr: '/isler', en: '/work' },
  '/about': { tr: '/hakkimizda', en: '/about' },
  '/start': { tr: '/proje-baslat', en: '/start' },
  '/privacy': { tr: '/gizlilik', en: '/privacy' },
  '/kvkk': { tr: '/kvkk', en: '/data-protection' },
} as const satisfies Record<string, string | Record<Locale, string>>;

export type AppPathname = keyof typeof PATHNAMES;

/** Bir rotanın belirli dildeki kullanıcıya görünen yolunu döner. */
export function localizedPath(pathname: AppPathname, locale: Locale): string {
  const entry = PATHNAMES[pathname];
  return typeof entry === 'string' ? entry : entry[locale];
}
