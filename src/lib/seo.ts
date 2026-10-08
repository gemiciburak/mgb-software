import type { Metadata } from 'next';
import { DEFAULT_LOCALE, LOCALE_TAGS, LOCALES, type Locale } from '@/shared';
import type { AppPathname } from '@/shared';
import { getPathname } from '@/i18n/navigation';
import { CONTACT_EMAIL, CONTACT_PHONE, FOUNDER, SITE_NAME, SITE_URL } from './constants';

/**
 * Bir rotanın canonical ve hreflang bağlantılarını üretir.
 *
 * Yollar `getPathname` üzerinden çözülür; yerelleştirilmiş yol haritası
 * tek kaynaktan geldiği için `/hizmetler` ↔ `/en/services` eşlemesi
 * metadata'da da kendiliğinden doğru olur.
 */
export function buildAlternates(pathname: AppPathname, locale: Locale): Metadata['alternates'] {
  const languages: Record<string, string> = {};

  for (const candidate of LOCALES) {
    languages[LOCALE_TAGS[candidate]] =
      `${SITE_URL}${getPathname({ href: pathname, locale: candidate })}`;
  }

  // Dil eşleşmeyen ziyaretçiler için varsayılan: Türkçe (bkz. i18n/routing.ts).
  languages['x-default'] = `${SITE_URL}${getPathname({ href: pathname, locale: DEFAULT_LOCALE })}`;

  return {
    canonical: `${SITE_URL}${getPathname({ href: pathname, locale })}`,
    languages,
  };
}

/**
 * SSS yapılandırılmış verisi (FAQPage). Metin ekrandakiyle birebir aynı —
 * yalnızca sayfada görünen soru ve cevaplar işaretlenir.
 */
export function faqJsonLd(entries: readonly { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

/** Organizasyon yapılandırılmış verisi. Uydurma veri içermez — yalnızca doğrulanabilir alanlar. */
export function organizationJsonLd(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description,
    logo: `${SITE_URL}/icon.svg`,
    founder: { '@type': 'Person', name: FOUNDER.name, jobTitle: FOUNDER.jobTitle },
    ...(CONTACT_EMAIL !== null ? { email: CONTACT_EMAIL } : {}),
    ...(CONTACT_PHONE !== null ? { telephone: `+${CONTACT_PHONE.digits}` } : {}),
  };
}
