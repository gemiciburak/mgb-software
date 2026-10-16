import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Container } from '@/components/ui/container';
import { MailIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { CONTACT_EMAIL } from '@/lib/constants';
import { SECTION_ID } from '@/lib/sections';
import type { FaqContent } from '@/types/content';

/**
 * Sıkça sorulan sorular.
 *
 * Solda yapışkan başlık ve "cevap burada yoksa yazın" çıkışı, sağda sorular.
 * Mobilde satırlar sıkılaşır, `hideOnMobile` işaretli sorular gizlenir ve
 * iletişim çıkışı listenin sonuna iner.
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
        <div className="grid gap-y-8 sm:gap-y-12 lg:grid-cols-12 lg:gap-y-0">
          <div className="lg:col-span-4">
            <ScrollReveal className="lg:sticky lg:top-32">
              <p className="font-mono text-label text-accent">{content.eyebrow}</p>
              <h2 className="mt-5 max-w-[14ch] text-display-2 text-balance">{content.title}</h2>
              {content.description && (
                <p className="mt-5 max-w-[34ch] text-body-lg text-fg-muted">
                  {content.description}
                </p>
              )}

              <ContactLine
                text={content.contactLine}
                className="mt-10 hidden border-t border-line pt-6 lg:block"
              />
            </ScrollReveal>
          </div>

          <ul className="border-t border-line [counter-reset:faq] lg:col-span-7 lg:col-start-6">
            {content.entries.map((entry) => (
              <li
                key={entry.question}
                className={cn(
                  'border-b border-line [counter-increment:faq]',
                  entry.hideOnMobile && 'max-sm:hidden',
                )}
              >
                <details className="group faq-item">
                  <summary className="flex cursor-pointer list-none items-baseline gap-3 rounded-xs py-4 sm:gap-5 sm:py-6 lg:gap-7 lg:py-7 [&::-webkit-details-marker]:hidden">
                    {/* Numara CSS sayacından: mobilde gizlenen sorular sırayı bozmaz. */}
                    <span
                      aria-hidden="true"
                      className="w-6 shrink-0 font-mono text-mono-sm text-fg-subtle tabular-nums transition-colors group-open:text-accent before:content-[counter(faq,decimal-leading-zero)] sm:w-8"
                    />
                    <span className="flex-1 text-[1.0625rem]/[1.35] font-semibold tracking-[-0.01em] text-fg sm:text-title">
                      {entry.question}
                    </span>
                    {/* Artı → eksi: dikey çizgi açılınca döner ve kaybolur. */}
                    <span aria-hidden="true" className="relative size-3.5 shrink-0 self-center">
                      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-fg-muted" />
                      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-fg-muted transition-transform duration-[var(--duration-base)] ease-[var(--ease-transition)] group-open:scale-y-0" />
                    </span>
                  </summary>
                  {/* Girinti = numara sütunu + boşluk; cevap sorunun hizasında başlar. */}
                  <p className="max-w-[62ch] pb-5 pl-9 text-body text-fg-muted sm:pb-7 sm:pl-13 lg:pl-15">
                    {entry.answer}
                  </p>
                </details>
              </li>
            ))}
          </ul>

          {/* Mobilde iletişim çıkışı soruların ardında: önce cevaplar, sonra
              "burada yoksa yazın". Masaüstünde soldaki yapışkan başlıkta. */}
          <ContactLine text={content.contactLine} className="lg:hidden" />
        </div>
      </Container>
    </section>
  );
}

function ContactLine({ text, className }: { text: string; className?: string }) {
  if (CONTACT_EMAIL === null) return null;

  return (
    <div className={className}>
      <p className="text-body-sm text-fg-muted">{text}</p>
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="group/mail mt-3 inline-flex items-center gap-2.5 rounded-xs text-body-sm break-all text-fg transition-colors hover:text-accent"
      >
        <MailIcon className="size-4 shrink-0 text-fg-subtle transition-colors group-hover/mail:text-accent" />
        {CONTACT_EMAIL}
      </a>
    </div>
  );
}
