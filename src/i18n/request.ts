import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * Her istek için çeviri yapılandırması.
 *
 * Not: `requestLocale` next-intl 4'te `next/root-params` lehine deprecated
 * işaretli, ancak hâlâ desteklenen ve tam tipli yol bu. `next/root-params`
 * tipleri build sırasında üretildiği için ilk derlemeden önce `any` oluyor;
 * temel altyapıda bu riski almıyoruz. Next sürümü ilerlediğinde tek
 * fonksiyon içinde geçiş yapılabilir.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  // [locale] segmenti bilinmeyen rotalar için catch-all gibi davranır;
  // geçersiz değerler varsayılan dile düşer.
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Europe/Istanbul',
  };
});
