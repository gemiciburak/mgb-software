import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { FinalCta } from '@/components/sections/final-cta';
import { Hero } from '@/components/sections/hero';
import { Philosophy } from '@/components/sections/philosophy';
import { ProcessTimeline } from '@/components/sections/process-timeline';
import { SelectedWork } from '@/components/sections/selected-work';
import { Services } from '@/components/sections/services';
import { TechnologyGrid } from '@/components/sections/technology-grid';
import { WhatWeBuild } from '@/components/sections/what-we-build';
import { WhyMgb } from '@/components/sections/why-mgb';
import { getContent } from '@/content';
import { fetchPublishedProjects } from '@/services/projects';
import { routing } from '@/i18n/routing';

/**
 * Ana sayfa.
 *
 * Sunucu bileşeni: tüm metin sunucu HTML'inde gelir. İstemci bileşenleri
 * (Services, WhatWeBuild, SelectedWork, ProcessTimeline) içeriği prop olarak
 * alır — düz veri olduğu için serileştirilebilir ve bileşenler içerik bilmez.
 *
 * Bölüm sırası brief'teki bilgi mimarisiyle birebir aynı.
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
      <Philosophy content={home.philosophy} />
      <Services content={home.services} />
      <WhatWeBuild content={home.build} />
      {/*
        Projeler content/projects.ts'ten gelir (services/projects.ts üzerinden).
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
      <ProcessTimeline content={home.process} />
      <TechnologyGrid content={home.technology} />
      <WhyMgb content={home.values} />
      <FinalCta content={home.cta} />
    </main>
  );
}
