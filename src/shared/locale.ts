/**
 * Dil tanımları. Türkçe varsayılan ve öneksiz; İngilizce `/en` altında.
 * Bu dosya tek doğruluk kaynağı — yönlendirme, içerik ve form aynı listeyi kullanır.
 */

export const LOCALES = ['tr', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'tr';

/** Çok dilli metin alanları için ortak şekil. */
export type LocalizedText = Record<Locale, string>;

/** `<html lang>` ve hreflang için tam dil etiketleri. */
export const LOCALE_TAGS: Record<Locale, string> = {
  tr: 'tr-TR',
  en: 'en',
};

/** Dil seçicide gösterilen etiketler. */
export const LOCALE_LABELS: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
