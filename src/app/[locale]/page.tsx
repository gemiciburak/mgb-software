import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Faq } from '@/components/sections/faq';
import { FinalCta } from '@/components/sections/final-cta';
import { Hero } from '@/components/sections/hero';
import { Philosophy } from '@/components/sections/philosophy';
import { ProcessTimeline } from '@/components/sections/process-timeline';
import { SelectedWork } from '@/components/sections/selected-work';
import { Services } from '@/components/sections/services';
import { WhatWeBuild } from '@/components/sections/what-we-build';
import { getContent } from '@/content';
import { fetchPublishedProjects } from '@/services/projects';
import { routing } from '@/i18n/routing';
import { faqJsonLd, websiteJsonLd } from '@/lib/seo';

/**
 * Ana sayfa.
 *
 * Sunucu bileşeni: tüm metin sunucu HTML'inde gelir. İstemci bileşenleri
 * (Services, WhatWeBuild, SelectedWork, ProcessTimeline) içeriği prop olarak
 * alır — düz veri olduğu için serileştirilebilir ve bileşenler içerik bilmez.
 *
 * Bölüm sırası ziyaretçinin sorduğu sırayla: ne yapıyorsunuz (Hizmetler) →
 * kanıtı ne (İşler) → kimsiniz (Hakkımızda) → nasıl çalışıyorsunuz (Süreç) →
 * sorularım var / başlayalım (SSS + İletişim). Hakkımızda bilinçli olarak
 * işlerin arkasında: ziyaretçi önce ne aldığını görür, sonra kimden aldığını.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const { home } = getContent(locale);
  const projects = await fetchPublishedProjects(locale);

  return (
    // tabIndex: skip link odağı gerçekten içeriğe taşısın, yalnızca kaydırmasın.
    <main id="main" tabIndex={-1} className="outline-none">
      <Hero locale={locale} />
      {/* 2 — Hizmetler: ne yapıyoruz ve elle tutulur çıktılar. */}
      <Services content={home.services} />
      <WhatWeBuild content={home.build} />
      {/*
        3 — Seçilmiş işler. Projeler content/projects.ts'ten gelir (services/projects.ts üzerinden).
        Dizi boşken bileşen bilinçli boş durumu render ediyor; proje eklenince
        burada hiçbir şey değişmiyor.
      */}
      <SelectedWork
        content={home.work}
        projects={projects}
        serviceLabels={Object.fromEntries(
          home.services.entries.map((service) => [service.slug, service.title]),
        )}
      />
      {/* 4 — Hakkımızda: stüdyo ve kurucu. */}
      <Philosophy content={home.philosophy} founder={home.founder} />
      {/* 5 — Çalışma süreci. */}
      <ProcessTimeline content={home.process} />
      {/* 6 — SSS ve iletişim. */}
      <Faq content={home.faq} />
      <FinalCta content={home.cta} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(home.faq.entries)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd(locale)) }}
      />
    </main>
  );
}
