import { InkPolyhedra } from '@/components/animations/ink-polyhedra';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { WordReveal } from '@/components/animations/word-reveal';
import { Container } from '@/components/ui/container';
import { SECTION_ID } from '@/lib/sections';
import type { PhilosophyContent } from '@/types/content';

/**
 * Yaklaşım — sayfanın tezi.
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
 */
export function Philosophy({ content }: { content: PhilosophyContent }) {
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
      </Container>
    </section>
  );
}
