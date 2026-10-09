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
 * Alt sayfaların metadata'sı: başlık, açıklama, canonical/hreflang ve paylaşım
 * kartı (Open Graph + Twitter).
 *
 * Sayfa kendi `openGraph`/`twitter` nesnesini verince layout'takiler
 * birleşmiyor, YERİNE geçiyor — `[locale]/opengraph-image` görseli de onlarla
 * birlikte düşüyordu ve Twitter kartında ana sayfanın başlığı kalıyordu.
 * Bu yüzden görsel burada açıkça eklenir; adresi `metadataBase`'e göre çözülür.
 */
export function subpageMetadata({
  pathname,
  locale,
  title,
  description,
}: {
  pathname: AppPathname;
  locale: Locale;
  title: string;
  description: string;
}): Metadata {
  const image = {
    url: `/${locale}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: SITE_NAME,
    type: 'image/png',
  };

  return {
    title,
    description,
    alternates: buildAlternates(pathname, locale),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: LOCALE_TAGS[locale],
      title,
      description,
      url: `${SITE_URL}${getPathname({ href: pathname, locale })}`,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
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
