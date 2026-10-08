import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { LOCALE_TAGS } from '@/shared';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Footer } from '@/components/sections/footer';
import { NavBar } from '@/components/sections/nav-bar';
import { SkipLink } from '@/components/ui/skip-link';
import { getContent } from '@/content';
import { routing } from '@/i18n/routing';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { fontVariables } from '@/lib/fonts';
import { buildAlternates, organizationJsonLd } from '@/lib/seo';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import '@/styles/globals.css';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/** İki dil de build sırasında statik üretilir. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const { meta } = getContent(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: meta.home.title,
      // Alt sayfalar yalnızca kendi başlığını verir: "Hizmetler · MGB Software"
      template: `%s · ${SITE_NAME}`,
    },
    description: meta.home.description,
    applicationName: SITE_NAME,
    alternates: buildAlternates('/', locale),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: LOCALE_TAGS[locale],
      title: meta.home.title,
      description: meta.home.description,
      url: `${SITE_URL}${locale === routing.defaultLocale ? '' : `/${locale}`}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.home.title,
      description: meta.home.description,
    },
    // `robots` bilinçli olarak yazılmıyor: indekslenmek zaten varsayılan, açık
    // `index, follow` ise 404 sayfalarında Next'in eklediği `noindex` ile
    // çelişen ikinci bir etiket üretiyordu.
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  // [locale] segmenti bilinmeyen rotalar için catch-all gibi davranır.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Statik render için aktif dili istek bağlamına yazar.
  setRequestLocale(locale);

  const { meta } = getContent(locale);

  return (
    // suppressHydrationWarning: aşağıdaki script, hidrasyondan önce
    // <html> üzerindeki data-theme attribute'unu değiştiriyor.
    <html lang={LOCALE_TAGS[locale]} className={fontVariables} suppressHydrationWarning>
      <body className="bg-bg font-sans text-body text-fg antialiased">
        {/*
          Temayı ilk boyamadan ÖNCE uygular. <body>'nin ilk çocuğu olarak
          senkron çalıştığı için yanlış temanın tek karesi bile görünmez.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />

        <NextIntlClientProvider>
          <SkipLink />
          <NavBar />
          {children}
          <Footer />
        </NextIntlClientProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd(meta.home.description)),
          }}
        />
      </body>
    </html>
  );
}
