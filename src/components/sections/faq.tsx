import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Container } from '@/components/ui/container';
import { MailIcon } from '@/components/ui/icons';
import { CONTACT_EMAIL } from '@/lib/constants';
import { SECTION_ID } from '@/lib/sections';
import type { FaqContent } from '@/types/content';

/**
 * Sıkça sorulan sorular.
 *
 * Solda yapışkan başlık ve "cevap burada yoksa yazın" çıkışı, sağda sorular.
 * Açılır yapı tarayıcının yerleşik <details>/<summary> öğesi: klavye ve
 * ekran okuyucu desteği hazır gelir, JavaScript gerekmez, sayfa içi arama
 * (Ctrl+F) kapalı cevapları da bulur. Açılma yüksekliği CSS ile yumuşatılır
 * (bkz. base.css `faq-item`); destek olmayan tarayıcıda anında açılır.
 *
 * Sunucu bileşeni; cevaplar sunucu HTML'inde gelir — arama motoru ve
 * FAQPage yapılandırılmış verisi (page.tsx) aynı metni görür.
 */
export function Faq({ content }: { content: FaqContent }) {
  return (
    <section id={SECTION_ID.faq} className="anchor-target border-t border-line py-section">
      <Container>
        <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-y-0">
          <div className="lg:col-span-4">
            <ScrollReveal className="lg:sticky lg:top-32">
              <p className="font-mono text-label text-accent">{content.eyebrow}</p>
              <h2 className="mt-5 max-w-[14ch] text-display-2 text-balance">{content.title}</h2>
              {content.description && (
                <p className="mt-5 max-w-[34ch] text-body-lg text-fg-muted">
                  {content.description}
                </p>
              )}

              {CONTACT_EMAIL !== null && (
                <div className="mt-10 border-t border-line pt-6">
                  <p className="text-body-sm text-fg-muted">{content.contactLine}</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="group/mail mt-3 inline-flex items-center gap-2.5 rounded-xs text-body-sm break-all text-fg transition-colors hover:text-accent"
                  >
                    <MailIcon className="size-4 shrink-0 text-fg-subtle transition-colors group-hover/mail:text-accent" />
                    {CONTACT_EMAIL}
                  </a>
                </div>
              )}
            </ScrollReveal>
          </div>

          <ul className="border-t border-line lg:col-span-7 lg:col-start-6">
            {content.entries.map((entry, index) => (
              <li key={entry.question} className="border-b border-line">
                <details className="group faq-item">
                  <summary className="flex cursor-pointer list-none items-baseline gap-5 rounded-xs py-6 lg:gap-7 lg:py-7 [&::-webkit-details-marker]:hidden">
                    <span className="w-8 shrink-0 font-mono text-mono-sm text-fg-subtle tabular-nums transition-colors group-open:text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-title text-fg">{entry.question}</span>
                    {/* Artı → eksi: dikey çizgi açılınca döner ve kaybolur. */}
                    <span aria-hidden="true" className="relative size-3.5 shrink-0 self-center">
                      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-fg-muted" />
                      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-fg-muted transition-transform duration-[var(--duration-base)] ease-[var(--ease-transition)] group-open:scale-y-0" />
                    </span>
                  </summary>
                  {/* Girinti = numara sütunu (w-8) + boşluk; cevap sorunun hizasında başlar. */}
                  <p className="max-w-[62ch] pb-7 pl-13 text-body text-fg-muted lg:pl-15">
                    {entry.answer}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
