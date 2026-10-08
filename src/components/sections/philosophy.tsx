import { InkPolyhedra } from '@/components/animations/ink-polyhedra';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Container } from '@/components/ui/container';
import { FounderPortrait } from '@/components/ui/founder-portrait';
import { ArrowUpRightIcon, MailIcon, SocialIcon } from '@/components/ui/icons';
import { CONTACT_EMAIL, SITE_NAME, SOCIAL_LINKS } from '@/lib/constants';
import { SECTION_ID } from '@/lib/sections';
import type { FounderContent, PhilosophyContent } from '@/types/content';

/**
 * Hakkımızda — stüdyo ve arkasındaki kişi.
 *
 * İki satır:
 *   1. Stüdyo (kurumsal "biz"). Solda başlık, koyu bir giriş
 *      cümlesi, gri açıklama ve üç kısa gerçek; sağda çizim. Başlık diğer
 *      bölüm başlıklarıyla aynı ölçekte (display-2); ekranı domine etmiyor — sayfanın
 *      "büyük an"ı hero.
 *   2. Kurucu şeridi (birinci tekil). Tam genişlikte, teknik çizimdeki antet
 *      kutusu gibi üç hücre: portre | isim + biyografi | doğrudan iletişim.
 *      Şirket öne çıkar, kişi gizlenmez; şerit ayrı bir bölüm gibi değil,
 *      paftanın alt kenarı gibi durur.
 *
 * Çizim metnin görsel karşılığı: aynı iskelet, üzerine çekilen mürekkeple
 * okunur hale geliyor — tasarım ve yazılımın aynı işin iki yüzü olması.
 */
export function Philosophy({
  content,
  founder,
}: {
  content: PhilosophyContent;
  founder: FounderContent;
}) {
  const [lead, ...rest] = content.body;
  const hasChannels = CONTACT_EMAIL !== null || SOCIAL_LINKS.length > 0;

  return (
    // Üst boşluk genel `py-section`dan dar: başlık bölüm çizgisine bağlı
    // okunsun, üstünde kopuk bir boşluk kalmasın.
    <section
      id={SECTION_ID.about}
      className="anchor-target border-t border-line pt-20 pb-section lg:pt-28"
    >
      <Container>
        {/* 1 — Stüdyo. */}
        {/* Üstten hizalı: ortalanınca uzun çizim başlığı aşağı itiyordu. */}
        <div className="grid gap-y-14 md:grid-cols-12 md:items-start md:gap-y-0">
          <ScrollReveal className="md:col-span-6">
            <p className="font-mono text-label text-accent">{content.eyebrow}</p>
            <h2 className="mt-6 max-w-[14ch] text-display-2 text-balance">{content.title}</h2>

            {lead && <p className="mt-8 max-w-[40ch] text-body-lg text-fg">{lead}</p>}
            {rest.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="mt-4 max-w-[52ch] text-body text-fg-muted">
                {paragraph}
              </p>
            ))}

            <dl className="mt-10 grid grid-cols-1 border-t border-line sm:grid-cols-3">
              {content.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="border-b border-line py-4 sm:border-b-0 sm:py-5 sm:pr-4 sm:not-first:border-l sm:not-first:pl-4"
                >
                  <dt className="font-mono text-mono-sm text-fg-subtle">{fact.label}</dt>
                  <dd className="mt-1.5 text-body-sm text-fg">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </ScrollReveal>

          {/* Çizim kanvasın ortasında durur, üstünde boşluk kalır; negatif
              kenar boşluğu küpün tepesini soldaki etiketle aynı hizaya alır. */}
          <div className="border-t border-line pt-10 md:col-span-5 md:col-start-8 md:-mt-9 md:border-t-0 md:pt-0">
            <InkPolyhedra className="mx-auto aspect-square w-full max-w-[28rem]" />
            <p className="mt-4 border-t border-line pt-4 font-mono text-mono-sm text-fg-subtle">
              {content.caption}
            </p>
          </div>
        </div>

        {/* 2 — Kurucu şeridi. */}
        <ScrollReveal className="mt-20 lg:mt-24">
          <div
            role="group"
            aria-labelledby="founder-name"
            className="grid border border-line bg-bg md:grid-cols-12"
          >
            {/* Portre hücreyi kenardan kenara doldurur; çerçeveyi hücre taşır. */}
            <div className="border-b border-line md:col-span-4 md:border-r md:border-b-0 lg:col-span-3">
              <FounderPortrait
                founder={founder}
                className="w-full border-0 md:aspect-auto md:h-full md:min-h-72"
                initialsClassName="text-display-2"
              />
            </div>

            <div className="p-6 md:col-span-8 md:p-8 lg:col-span-5 lg:p-10">
              <p className="font-mono text-label text-accent">{founder.eyebrow}</p>
              <h3 id="founder-name" className="mt-5 text-display-3">
                {founder.name}
              </h3>
              <p className="mt-2 font-mono text-mono-sm text-fg-subtle">{founder.role}</p>

              {founder.bio.map((paragraph, index) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className={
                    index === 0 ? 'mt-6 text-body text-fg' : 'mt-3 text-body-sm text-fg-muted'
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {hasChannels && (
              <div className="flex flex-col border-t border-line p-6 md:col-span-12 md:p-8 lg:col-span-4 lg:border-t-0 lg:border-l lg:p-10">
                <p className="font-mono text-mono-sm text-fg-subtle">{founder.contactLabel}</p>
                <ul className="mt-5 space-y-3">
                  {CONTACT_EMAIL !== null && (
                    <li>
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="group/link inline-flex items-center gap-2.5 rounded-xs text-body-sm break-all text-fg transition-colors hover:text-accent lg:break-normal"
                      >
                        <MailIcon className="size-4 shrink-0 text-fg-subtle transition-colors group-hover/link:text-accent" />
                        {CONTACT_EMAIL}
                      </a>
                    </li>
                  )}
                  {SOCIAL_LINKS.map((social) => (
                    <li key={social.href}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`${social.label} — ${social.handle}`}
                        className="group/link inline-flex items-center gap-2.5 rounded-xs text-body-sm text-fg transition-colors hover:text-accent"
                      >
                        <SocialIcon
                          id={social.id}
                          className="size-4 shrink-0 text-fg-subtle transition-colors group-hover/link:text-accent"
                        />
                        {social.handle}
                        <ArrowUpRightIcon className="size-3 shrink-0 text-fg-subtle" />
                      </a>
                    </li>
                  ))}
                </ul>
                {/* Antet kutusunun alt satırı. Marka adı çevrilmez. */}
                <p className="mt-8 font-mono text-mono-sm text-fg-subtle lg:mt-auto">
                  {SITE_NAME.toUpperCase()}
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
