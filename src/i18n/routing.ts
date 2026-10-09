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
   * açık seçimidir; adres (`/` ya da `/en`) seçimin kendisini taşır.
   */
  localeDetection: false,

  /**
   * Dil çerezi KAPALI. Algılama kapalıyken next-intl çerezi hiç okumuyor;
   * açık kalsaydı her ziyarette işe yaramayan bir çerez yazılırdı (KVKK
   * metninde de anlatılması gerekirdi).
   */
  localeCookie: false,

  /**
   * `Link` HTTP başlığındaki hreflang'ler KAPALI. Aynı bilgi sayfa
   * metadata'sında `tr-TR` etiketiyle zaten var (lib/seo.ts); başlık ise `tr`
   * yazıyordu — arama motoruna çelişen iki sinyal gidiyordu.
   */
  alternateLinks: false,
});
