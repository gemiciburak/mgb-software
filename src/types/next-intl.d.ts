import type messages from '@/messages/tr.json';
import type { routing } from '@/i18n/routing';

/**
 * next-intl'e tip bilgisi verir: `t('nav.work')` gibi çağrılarda anahtarlar
 * otomatik tamamlanır ve var olmayan anahtar derleme hatası olur.
 * Türkçe dosyası referans alınır — yeni bir anahtar önce oraya eklenir.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
