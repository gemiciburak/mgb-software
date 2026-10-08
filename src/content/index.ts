import type { Locale } from '@/shared';
import type { LocaleContent } from '@/types/content';
import { about as aboutEn } from './en/about';
import { hero as heroEn } from './en/hero';
import { kvkk as kvkkEn } from './en/kvkk';
import { home as homeEn } from './en/home';
import { meta as metaEn } from './en/meta';
import { about as aboutTr } from './tr/about';
import { hero as heroTr } from './tr/hero';
import { kvkk as kvkkTr } from './tr/kvkk';
import { home as homeTr } from './tr/home';
import { meta as metaTr } from './tr/meta';

/**
 * İki dilli içeriğin tek erişim noktası.
 *
 * Metinler JSON yerine TypeScript dosyalarında tutulur: tip güvenliği,
 * yorum yazabilme ve veri objelerinden türetilen içerik (hizmet listesi gibi)
 * burada mümkün. Kısa arayüz metinleri (buton, aria) ise next-intl'in
 * messages/*.json dosyalarında kalır.
 */
const content: Record<Locale, LocaleContent> = {
  tr: { meta: metaTr, hero: heroTr, home: homeTr, about: aboutTr, kvkk: kvkkTr },
  en: { meta: metaEn, hero: heroEn, home: homeEn, about: aboutEn, kvkk: kvkkEn },
};

export function getContent(locale: Locale): LocaleContent {
  return content[locale];
}
