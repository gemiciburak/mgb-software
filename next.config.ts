import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/i18n/request.ts',
});

/**
 * İçerik Güvenlik Politikası (CSP).
 *
 * Nonce'suz, statik bir politika — bilinçli olarak. Nonce her istekte yeni
 * üretilmeli, bu da bütün sayfaları dinamik render'a zorlar; site SSG ve
 * Cloudflare'de önbellekten sunuluyor. Bu yüzden `script-src`'de
 * `'unsafe-inline'` var: Next'in RSC yükü (`self.__next_f.push`), tema betiği
 * ve JSON-LD satır içi script. `style-src`'deki `'unsafe-inline'` ise Motion'ın
 * `style` attribute'ları için şart.
 *
 * Yine de kazanç büyük: dış kaynaktan script, font, görsel veya bağlantı
 * yüklenemez; `object`/`base` enjeksiyonu kapalı; site yalnızca kendi
 * alanında çerçevelenebilir. Tek dış kaynak teşekkür ekranındaki Calendly
 * iframe'i (`frame-src`).
 *
 * Yeni bir dış servis (analitik, harita, video) eklenirse ilgili satıra
 * alan adı yazılmalı — yoksa tarayıcı sessizce engeller. Cloudflare Web
 * Analytics açılırsa: script-src ve connect-src'ye
 * https://static.cloudflareinsights.com ve https://cloudflareinsights.com.
 *
 * Geliştirmede `'unsafe-eval'` gerekiyor: React sunucu hata yığınlarını
 * tarayıcıda eval ile kuruyor. Üretimde yok.
 */
const isDev = process.env.NODE_ENV === 'development';

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  'frame-src https://calendly.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

/** Üretim için güvenlik başlıkları. */
const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // CSP'deki frame-ancestors'ın eski tarayıcılar için karşılığı.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Tarayıcı bir yıl boyunca bu alan adına (ve alt alan adlarına) yalnızca
  // HTTPS ile bağlanır. `preload` bilinçli olarak yok: listeye girmek geri
  // alınması aylar süren bir taahhüt. Yerelde (http://localhost) etkisiz.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // three.js ağaç sarsıntısını iyileştirir ve paket boyutunu düşürür.
  experimental: {
    optimizePackageImports: ['three', '@react-three/drei', 'motion'],

    /**
     * İstemcinin daha önce gördüğü URL'lerden route kalıbı "tahmin etmesi"
     * kapalı. Dil öneki `as-needed` olduğu için `/en` gerçekten `[locale]`
     * segmenti, ama `/kvkk` proxy'de `/tr/kvkk`'ye yeniden yazılıyor. Router
     * `/en`den öğrendiği kalıbı `/kvkk`ye uygulayıp onu `locale=kvkk` sanıyor,
     * sunucu başka bir ağaç dönünce de prefetch'i durmadan tekrarlıyordu:
     * footer'daki KVKK linki ekrana girince birkaç saniyede ~2.400 istek.
     * Kapalıyken her link için bir `/_tree` isteği daha gider, o kadar.
     */
    optimisticRouting: false,
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
