import { defineRouting } from 'next-intl/routing';
import { DEFAULT_LOCALE, LOCALES, PATHNAMES } from '@/shared';

/**
 * Yönlendirme yapılandırması.
 *
 * - `localePrefix: 'as-needed'` → Türkçe öneksiz (`/hizmetler`),
 *   İngilizce `/en` altında (`/en/services`).
 * - `pathnames` src/shared'dan gelir; sitemap ve hreflang da aynı
 *   haritayı kullanır, yollar iki yerde ayrı tanımlanmaz.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  pathnames: PATHNAMES,

  /**
   * Otomatik dil algılama KAPALI — bilinçli karar.
   *
   * Açık olsaydı, İngilizce kurulu bir işletim sistemi kullanan Türk ziyaretçi
   * (macOS'ta çok yaygın) `/` adresinden `/en`'e yönlendirilirdi. Hedef kitlenin
   * ağırlığı Türkiye olduğu için `/` her zaman Türkçedir ve dil, kullanıcının
   * açık seçimidir. Seçim aşağıdaki çerezde hatırlanır.
   */
  localeDetection: false,

  localeCookie: {
    name: 'MGB_LOCALE',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  },
});
