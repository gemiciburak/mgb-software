import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Next.js 16'da bu dosya konvansiyonunun adı `middleware` değil `proxy`.
 * next-intl'in modül adı (`next-intl/middleware`) değişmedi — dosya adı ile
 * paket adı birbirinden bağımsız.
 *
 * Görevi: isteği doğru dile yönlendirmek ve yerelleştirilmiş yolları
 * (`/hizmetler` → `/tr/services`) dahili rotalara çevirmek.
 */
export default createMiddleware(routing);

export const config = {
  /**
   * API rotaları, Next.js iç dosyaları ve uzantılı dosyalar (favicon.ico,
   * robots.txt, görseller) bu katmandan geçmez.
   *
   * Uzantısız metadata görselleri de hariç: `/apple-icon` buradan geçince
   * `/tr/apple-icon`'a yeniden yazılıp catch-all'da 404 oluyordu (iOS ana
   * ekran ikonu kırık), `/tr/opengraph-image` ise öneksiz adrese 307 ile
   * yönlendiriliyordu — paylaşım tarayıcıları yönlendirmeyi her zaman izlemez.
   */
  matcher: ['/((?!api|_next|_vercel|apple-icon|.*opengraph-image|.*\\..*).*)'],
};
