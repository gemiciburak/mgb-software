import { InkPolyhedra } from '@/components/animations/ink-polyhedra';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { WordReveal } from '@/components/animations/word-reveal';
import { Container } from '@/components/ui/container';
import { FounderPortrait } from '@/components/ui/founder-portrait';
import { MailIcon } from '@/components/ui/icons';
import { CONTACT_EMAIL } from '@/lib/constants';
import { SECTION_ID } from '@/lib/sections';
import type { FounderContent, PhilosophyContent } from '@/types/content';

/**
 * Hakkımızda — sayfanın tezi ve arkasındaki kişi.
 *
 * Bölümün açılışı tek bir cümle ve sayfadaki en büyük tipografi. Kelimeler
 * scroll ile sırayla maskenin altından çıkıyor; yani cümle okunmuyor,
 * kuruluyor. Sayfadaki tek "ekranı domine eden" an burası — ikincisi
 * olsaydı ikisi de sıradanlaşırdı.
 *
 * Cümlenin altında iki alan var ve BİRBİRİNE DEĞMİYORLAR: solda destekleyici
 * metin, sağda çizim. Önceki denemelerde küp metnin arkasına alınmıştı ve tel
 * kafes paragrafın tam üstünden geçiyordu. Şimdi küp kendi sütununda, kendi
 * tuvaline kırpılmış halde; iki alan hiçbir noktada kesişmiyor.
 *
 * Ama kopuk da değil: iki sütun ortak bir dikey çizgiyi paylaşıyor. Bağlantıyı
 * üst üste binme değil, o çizgi kuruyor — teknik çizim paftalarındaki gibi.
 * Mono etiket de çizimin altına bağlandı, bir şekil altyazısı gibi.
 *
 * Çizimin kendisi cümlenin görsel karşılığı: aynı iskelet, üzerine çekilen
 * mürekkeple okunur hale geliyor — tasarım ve yazılımın aynı işin iki yüzü
 * olması. İmlece göre eğiliyor, yani bakan kişi onu çeviriyormuş gibi.
 *
 * Bölümün ikinci yarısı kurucu kartı: MGB Software bir marka, Burak Gemici
 * markanın kurucusu. Üstteki metin stüdyonun sesiyle ("biz"), kart kişinin
 * sesiyle (birinci tekil) konuşur. Kart bilinçli olarak kompakt — ana sayfa
 * şirketi öne çıkarır, kişiyi gizlemez.
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

        <h2 className="mt-8 max-w-[15ch] text-display-1 text-balance">
          <WordReveal text={content.title} stagger={0.07} />
        </h2>

        <div className="mt-20 grid gap-y-14 md:grid-cols-12 md:gap-y-0">
          {/* Destekleyici metin — çizimin ortasıyla hizalanır. */}
          <div className="md:col-span-5 md:self-center">
            <ScrollReveal>
              <div className="space-y-6 text-body-lg text-fg-muted">
                {content.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Çizim sütunu. Dikey çizgi md'den itibaren; altında mobilde yatay
              ayırıcı var, yani iki alan her boyutta ayrı okunuyor. */}
          <div className="flex flex-col border-t border-line pt-10 md:col-span-5 md:col-start-8 md:border-t-0 md:border-l md:pt-0 md:pl-10 lg:pl-14">
            <InkPolyhedra className="aspect-square w-full" />
            <p className="mt-auto border-t border-line pt-4 font-mono text-mono-sm text-fg-subtle">
              {content.caption}
            </p>
          </div>
        </div>

        {/* Kurucu kartı. */}
        <div
          aria-labelledby="founder-name"
          role="group"
          className="mt-24 grid gap-y-10 border-t border-line pt-14 md:grid-cols-12 md:gap-y-0 lg:mt-32 lg:pt-20"
        >
          <ScrollReveal className="md:col-span-12">
            <p className="font-mono text-label text-accent">{founder.eyebrow}</p>
          </ScrollReveal>

          <div className="max-w-64 md:col-span-4 md:mt-10 md:max-w-none lg:col-span-3">
            <FounderPortrait founder={founder} />
          </div>

          <ScrollReveal className="md:col-span-7 md:col-start-6 md:mt-10 md:self-center lg:col-span-6 lg:col-start-5">
            <h3 id="founder-name" className="text-display-3">
              {founder.name}
            </h3>
            <p className="mt-3 font-mono text-mono-sm text-fg-subtle">{founder.role}</p>

            <div className="mt-7 space-y-4 border-l border-accent pl-6 text-body text-fg-muted">
              {founder.bio.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>

            {CONTACT_EMAIL !== null && (
              <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-body-sm text-fg-muted">
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
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
