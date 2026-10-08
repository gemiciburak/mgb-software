import type { AppPathname } from '@/shared';

/**
 * Site genelinde kullanılan sabitler.
 *
 * Henüz belirlenmemiş bilgiler `null` / boş dizi olarak durur ve ilgili arayüz
 * parçası hiç render edilmez — uydurma değer veya kırık link üretilmez.
 * Bilgi geldiğinde yalnızca bu dosya güncellenir.
 */

/** Yayındaki tam adres. canonical, hreflang, sitemap ve OG görseli bundan üretilir. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

export const SITE_NAME = 'MGB Software';

/**
 * İletişim e-postası.
 *
 * `null` bırakılırsa footer ve Final CTA'daki e-posta satırı hiç render
 * edilmez — kırık bir `mailto:` üretilmez.
 */
export const CONTACT_EMAIL: string | null = 'mgbsoftware.tr@gmail.com';

/**
 * Ön görüşme takvimi (Calendly, 30 dk).
 *
 * `?month=` gibi parametreler bilinçli olarak yok: takvim her zaman bugünden
 * açılsın. Form teşekkür ekranında ad ve e-posta bu adrese önceden doldurulmuş
 * olarak eklenir. `null` bırakılırsa görüşme seçeneği hiç render edilmez.
 */
export const CALENDLY_URL: string | null = 'https://calendly.com/mgbsoftware-tr/30min';

/**
 * WhatsApp numarası, uluslararası biçimde ve yalnızca rakam (`905xxxxxxxxx`).
 *
 * `null` iken formdaki "WhatsApp'tan dönün" seçeneği render edilmez — numara
 * olmadan sunulan bir kanal kullanıcıyı boşa çıkarır.
 */
export const WHATSAPP_NUMBER: string | null = null;

/** İkonu olan hesap türleri. Yeni bir ağ eklerken ikonu da eklenmeli. */
export type SocialId = 'instagram';

export interface SocialLink {
  /** Hangi ikonun çizileceğini seçer (bkz. ui/icons.tsx). */
  id: SocialId;
  /** Ağın adı — erişilebilir isimde kullanılır. */
  label: string;
  /** Kullanıcı adı; ekranda ham URL yerine bu görünür. */
  handle: string;
  href: string;
}

/** Sosyal hesaplar. Dizi boşken footer'daki blok hiç render edilmez. */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@mgbsoftware.tr',
    href: 'https://www.instagram.com/mgbsoftware.tr/',
  },
];

/** Marka imzası. Footer ve OG görselinde kullanılır; çevrilmez. */
export const BRAND_SIGNATURE = 'Design. Build. Evolve.';

/**
 * GERÇEKTEN yayında olan rotalar.
 *
 * `PATHNAMES` haritası ileride gelecek sayfaları da içeriyor. Sitemap ve
 * footer'daki yasal linkler bu listeden okur: listede olmayan bir sayfaya
 * link verilmez, arama motorlarına da 404 adresi bildirilmez. Yeni bir sayfa
 * yayına alındığında yolu buraya eklenir.
 *
 * TODO: '/services', '/work', '/about' ve '/privacy' sayfaları yayına
 * alındıkça buraya eklenecek.
 */
export const PUBLISHED_ROUTES: readonly AppPathname[] = ['/', '/contact', '/kvkk'];

export function isPublished(pathname: AppPathname): boolean {
  return PUBLISHED_ROUTES.includes(pathname);
}
