import { getTranslations } from 'next-intl/server';
import { Magnetic } from '@/components/animations/magnetic';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { buttonStyles } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ArrowRightIcon, MailIcon } from '@/components/ui/icons';
import { Link } from '@/i18n/navigation';
import { CONTACT_EMAIL } from '@/lib/constants';
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
 * Birincil düğme proje başlatma sayfasına (`/iletisim`) gider — dört adımlı
 * form orada. Yanındaki e-posta adresi ikincil kanal: dosya ve şartname
 * göndermek isteyenler için düz metin olarak yazılır, kopyalanabilir.
 *
 * E-posta yalnızca gerçek bir adres tanımlıysa görünür (bkz. lib/constants.ts)
 * — uydurma adres ya da boş `mailto:` üretilmez.
 */
export async function FinalCta({ content }: { content: CtaContent }) {
  const t = await getTranslations('actions');

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
        <ScrollReveal>
          <h2 className="max-w-[16ch] text-display-1">{content.title}</h2>
          <p className="mt-7 max-w-[44ch] text-body-lg text-fg-muted">{content.description}</p>

          <div className="mt-11 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
            <Magnetic className="w-fit">
              <Link href="/contact" className={buttonStyles()}>
                {t('startProject')}
                <ArrowRightIcon className="size-4" />
              </Link>
            </Magnetic>

            {CONTACT_EMAIL !== null && (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="group/mail inline-flex items-center gap-2.5 rounded-xs text-body-sm break-all text-fg-muted transition-colors hover:text-fg"
              >
                <MailIcon className="size-4 shrink-0 text-fg-subtle transition-colors group-hover/mail:text-accent" />
                {CONTACT_EMAIL}
              </a>
            )}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
