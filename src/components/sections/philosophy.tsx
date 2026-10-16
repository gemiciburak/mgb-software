import { InkPolyhedra } from '@/components/animations/ink-polyhedra';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Container } from '@/components/ui/container';
import { ContactChannels, HAS_CONTACT_CHANNELS } from '@/components/ui/contact-channels';
import { FounderPortrait } from '@/components/ui/founder-portrait';
import { SITE_NAME } from '@/lib/constants';
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

  return (
    // Üst boşluk genel `py-section`dan dar: başlık bölüm çizgisine bağlı
    // okunsun, üstünde kopuk bir boşluk kalmasın.
    <section
      id={SECTION_ID.about}
      className="anchor-target overflow-x-clip border-t border-line pt-20 pb-section lg:pt-28"
    >
      <Container>
        {/* 1 — Stüdyo. */}
        {/* Üstten hizalı: ortalanınca uzun çizim başlığı aşağı itiyordu. */}
        <div className="relative grid md:grid-cols-12 md:items-start">
          <ScrollReveal className="relative z-10 md:col-span-6">
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
              kenar boşluğu küpün tepesini soldaki etiketle aynı hizaya alır.
              Mobilde ayrı bir blok değil: başlığın sağındaki boşlukta küçük
              bir işaret olarak durur, metin akışına yer kaplamaz. */}
          <div className="pointer-events-none absolute -top-18 -right-12 w-48 min-[375px]:w-52 md:pointer-events-auto md:static md:col-span-5 md:col-start-8 md:-mt-9 md:w-auto">
            <InkPolyhedra className="mx-auto aspect-square w-full max-w-md" />
            <p className="mt-4 hidden border-t border-line pt-4 font-mono text-mono-sm text-fg-subtle md:block">
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
            {/*
              Portre hücreyi kenardan kenara doldurur; çerçeveyi hücre taşır.
              Hücre 4 sütun (tablette 5): 3 sütunda metin satırının boyu hücreyi fotoğrafın
              4:5 oranından çok daha dar-uzun yapıyor ve `object-cover` omuzları
              yandan kesiyordu (1024px'te genişliğin yalnızca %64'ü görünüyordu).
              Bu yüzden üç sütunlu şerit xl'den itibaren; altında iletişim
              hücresi alta iner.
            */}
            <div className="border-b border-line md:col-span-5 md:border-r md:border-b-0 lg:col-span-4">
              <FounderPortrait
                founder={founder}
                className="w-full border-0 md:aspect-auto md:h-full md:min-h-72"
                initialsClassName="text-display-2"
              />
            </div>

            <div className="p-6 md:col-span-7 md:p-8 lg:col-span-8 lg:p-10 xl:col-span-5">
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

            {HAS_CONTACT_CHANNELS && (
              <div className="flex flex-col border-t border-line p-6 md:col-span-12 md:p-8 lg:p-10 xl:col-span-3 xl:border-t-0 xl:border-l xl:p-8">
                <p className="font-mono text-mono-sm text-fg-subtle">{founder.contactLabel}</p>
                <ContactChannels className="mt-5" />
                {/* Antet kutusunun alt satırı. Marka adı çevrilmez. */}
                <p className="mt-8 font-mono text-mono-sm text-fg-subtle xl:mt-auto">
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
