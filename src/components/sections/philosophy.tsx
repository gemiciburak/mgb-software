import { InkPolyhedra } from '@/components/animations/ink-polyhedra';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Container } from '@/components/ui/container';
import { FounderPortrait } from '@/components/ui/founder-portrait';
import { MailIcon } from '@/components/ui/icons';
import { CONTACT_EMAIL } from '@/lib/constants';
import { SECTION_ID } from '@/lib/sections';
import type { FounderContent, PhilosophyContent } from '@/types/content';

/**
 * Hakkımızda — stüdyo ve arkasındaki kişi, tek blokta.
 *
 * Solda iki katman üst üste: önce stüdyonun sesiyle ("biz") ne yaptığımız,
 * hemen altında kurucunun sesiyle (birinci tekil) kısa bir tanışma. İkisi
 * aynı sütunda, aralarında yalnızca bir hairline var — şirket öne çıkar,
 * kişi gizlenmez, ama ayrı bir bölüm gibi de durmaz.
 *
 * Sağda çizim kendi sütununda; iki alan birbirine değmez, ortak bir dikey
 * çizgiyi paylaşır — teknik çizim paftalarındaki gibi. Çizim metnin görsel
 * karşılığı: aynı iskelet, üzerine çekilen mürekkeple okunur hale geliyor —
 * tasarım ve yazılımın aynı işin iki yüzü olması. İmlece göre eğiliyor.
 *
 * Bölümün eskiden ekranı domine eden bir açılış cümlesi vardı; kurucu
 * tanışması eklenince bölüm iki ekrana yayılıyordu, kaldırıldı.
 */
export function Philosophy({
  content,
  founder,
}: {
  content: PhilosophyContent;
  founder: FounderContent;
}) {
  return (
    <section id={SECTION_ID.about} className="anchor-target border-t border-line py-section">
      <Container>
        <ScrollReveal>
          <p className="font-mono text-label text-accent">{content.eyebrow}</p>
        </ScrollReveal>

        <div className="mt-10 grid gap-y-14 md:grid-cols-12 md:gap-y-0 lg:mt-14">
          <div className="md:col-span-6">
            {/* 1 — Stüdyo. */}
            <ScrollReveal>
              <div className="space-y-6 text-body-lg text-fg-muted">
                {content.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </ScrollReveal>

            {/* 2 — Kurucu. */}
            <ScrollReveal delay={0.08} className="mt-12 border-t border-line pt-10">
              <div role="group" aria-labelledby="founder-name">
                <p className="font-mono text-mono-sm text-fg-subtle">{founder.eyebrow}</p>

                <div className="mt-6 flex items-center gap-5">
                  <FounderPortrait founder={founder} className="w-16 shrink-0 sm:w-20" />
                  <div>
                    <h3 id="founder-name" className="text-title">
                      {founder.name}
                    </h3>
                    <p className="mt-1.5 font-mono text-mono-sm text-fg-subtle">{founder.role}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4 border-l border-accent pl-5 text-body text-fg-muted">
                  {founder.bio.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
                </div>

                {CONTACT_EMAIL !== null && (
                  <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-body-sm text-fg-muted">
                    {founder.contactLine}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="group/mail inline-flex items-center gap-2 rounded-xs break-all text-fg transition-colors hover:text-accent"
                    >
                      <MailIcon className="size-4 shrink-0 text-fg-subtle transition-colors group-hover/mail:text-accent" />
                      {CONTACT_EMAIL}
                    </a>
                  </p>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* Çizim sütunu. Dikey çizgi md'den itibaren; altında mobilde yatay
              ayırıcı var, yani iki alan her boyutta ayrı okunuyor. */}
          <div className="flex flex-col border-t border-line pt-10 md:col-span-5 md:col-start-8 md:self-start md:border-t-0 md:border-l md:pt-0 md:pl-10 lg:pl-14">
            <InkPolyhedra className="aspect-square w-full" />
            <p className="mt-6 border-t border-line pt-4 font-mono text-mono-sm text-fg-subtle">
              {content.caption}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
