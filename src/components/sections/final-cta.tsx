import { getTranslations } from 'next-intl/server';
import { Magnetic } from '@/components/animations/magnetic';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { buttonStyles } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ContactChannels, HAS_CONTACT_CHANNELS } from '@/components/ui/contact-channels';
import { ArrowRightIcon } from '@/components/ui/icons';
import { Link } from '@/i18n/navigation';
import { SECTION_ID } from '@/lib/sections';
import type { CtaContent } from '@/types/content';

/**
 * Kapanış çağrısı.
 *
 * Arka planda çok hafif bir teknik çizim ızgarası var; `blueprint-grid`
 * yardımcı sınıfı `--line` token'ını kullandığı için her iki temada da
 * doğru renkte. Yavaş kayma CSS animasyonu ile yapılır ve hareket azaltma
 * modunda genel kural tarafından durdurulur.
 *
 * Menüdeki "İletişim" buraya iner; bu yüzden bölüm iki AYRI yolu yan yana
 * ve adıyla gösterir — "İletişim" ile "Teklif Al" aynı şey değil:
 *   1. Yeni proje → "Teklif Al" düğmesi, dört adımlı form (`/teklif-al`).
 *   2. Doğrudan ulaşın → e-posta ve sosyal hesaplar. Kısa soru, iş birliği
 *      ya da proje dışı bir konu için forma girmek gerekmez.
 *
 * Kanallar lib/constants.ts'ten gelir ve yalnızca tanımlıysa görünür —
 * uydurma adres ya da boş `mailto:` üretilmez; hiçbiri yoksa sağ sütun
 * hiç render edilmez.
 */
export async function FinalCta({ content }: { content: CtaContent }) {
  const t = await getTranslations('actions');
  const tReach = await getTranslations('reach');

  return (
    <section
      id={SECTION_ID.contact}
      className="relative anchor-target overflow-hidden border-t border-line py-section"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 cta-grid blueprint-grid opacity-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--bg)_72%)]"
      />

      <Container className="relative">
        <div className="grid gap-y-16 lg:grid-cols-12 lg:gap-y-0">
          {/* 1 — Yeni proje: yapılandırılmış form. */}
          <ScrollReveal className="lg:col-span-7">
            <h2 className="max-w-[16ch] text-display-1">{content.title}</h2>
            <p className="mt-7 max-w-[44ch] text-body-lg text-fg-muted">{content.description}</p>

            <Magnetic className="mt-11 w-fit">
              <Link href="/quote" className={buttonStyles()}>
                {t('getQuote')}
                <ArrowRightIcon className="size-4" />
              </Link>
            </Magnetic>
            <p className="mt-4 font-mono text-mono-sm text-fg-subtle">{tReach('projectHint')}</p>
          </ScrollReveal>

          {/* 2 — Doğrudan kanallar: soru, iş birliği, proje dışı konular. */}
          {HAS_CONTACT_CHANNELS && (
            <ScrollReveal
              delay={0.1}
              className="border-t border-line pt-10 lg:col-span-4 lg:col-start-9 lg:self-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10"
            >
              <h3 className="font-mono text-label text-accent">{tReach('eyebrow')}</h3>
              <p className="mt-4 max-w-[34ch] text-body text-fg-muted">{tReach('body')}</p>

              <ContactChannels size="md" className="mt-7" />
            </ScrollReveal>
          )}
        </div>
      </Container>
    </section>
  );
}
