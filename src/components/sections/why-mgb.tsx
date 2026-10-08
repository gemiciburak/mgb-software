'use client';

import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useCallback, useRef, useState } from 'react';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { StageDial, STEPS } from '@/components/animations/stage-dial';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ValueGlyph } from '@/components/ui/value-glyph';
import { useMediaQuery } from '@/hooks/use-media-query';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/cn';
import { EASE_ENTRANCE } from '@/lib/motion';
import { SECTION_ID } from '@/lib/sections';
import type { SectionIntro, ValueEntry } from '@/types/content';

type ValuesContent = SectionIntro & { entries: readonly ValueEntry[] };

/**
 * Son kademenin tamamlandığı scroll oranı. Kalan %22 "tutma payı": dördü de
 * görünürken okumaya zaman kalıyor.
 */
const REVEAL_END = 0.78;

/**
 * Kademelerin açıldığı scroll oranları — eşit dörtte birlik dilimler.
 *
 * Eşit olmaları şart: kadranın çeyrek işaretleriyle taahhütlerin açılması aynı
 * ana denk gelmeli, yoksa düğme yalan söyler.
 */
const STEP_AT = Array.from({ length: STEPS }, (_, index) => ((index + 1) / STEPS) * REVEAL_END);

/**
 * Neden MGB — kademeli açılan kadran.
 *
 * Bölüm boş başlar: dört taahhüdün ÇERÇEVESİ (hairline satırlar ve mono
 * numaraları) baştan görünür, içeriği görünmez. Scroll ilerledikçe kademeler
 * tek tek açılır ve her taahhüt kendi satırına yerleşir.
 *
 * Çerçevenin baştan durması bilinçli: "henüz gelmedi" ile "bozuk" arasındaki
 * farkı o kuruyor. Boş satırlar beklenen bir şeyin yerini tutuyor, eksik bir
 * şeyin boşluğunu değil. Satır yükseklikleri de sabit — içerik görünmezken de
 * yerleşimde yer kaplıyor, böylece kademeler açılırken sayfa zıplamıyor.
 *
 * İçerik hiçbir zaman DOM'dan çıkarılmaz ve `aria-hidden` yapılmaz; yalnızca
 * opaklık ve dönüşümle gizlenir. Yani ekran okuyucu ve arama motoru dört
 * taahhüdü de ilk andan itibaren görür — açılma görsel bir anlatım, içeriğin
 * varlık koşulu değil.
 *
 * Numaralandırma burada anlamlı: dördü eşit ağırlıkta taahhüt, bir öncelik
 * sırası değil — ama kademeli açılma bir sıra kuruyor ve numara o sıranın
 * neresinde olduğunuzu söylüyor. Kadranla aynı sayıyı gösterirler.
 *
 * İki yerleşim, aynı fikir:
 *   • lg ve üzeri → bölüm ekrana sabitlenir, kadran solda durur, taahhütler
 *     sağda birer birer açılır.
 *     Kısa pencerede yerleşim kaybolmaz, KÜÇÜLÜR: 48rem'in altında başlık bir
 *     kademe iner, satır boşlukları ve çizimler daralır. Sabitlenmiş blok
 *     ekran boyu olduğu için içerik oraya sığmak zorunda.
 *   • dar pencerede ve hareket azaltmada → sabitleme yok; satırlar kendi
 *     görünürlükleriyle açılır, hareket azaltmada hepsi doğrudan görünür.
 */
export function WhyMgb({ content }: { content: ValuesContent }) {
  const reducedMotion = usePrefersReducedMotion();
  /**
   * Sabitlenmiş blok ekran boyu olduğu için içerik oraya SIĞMAK zorunda.
   *
   * Önce bu sorunu 48rem'lik bir yükseklik eşiğiyle çözmüştüm ama o eşik
   * sıradan bir dizüstü penceresinin (≈700–760px) tam ortasına düşüyordu:
   * kırpılmayı önlerken kadranı komple kapatıyordu. Doğrusu eşik değil,
   * içeriğin yüksekliğe göre küçülmesi — aşağıdaki `max-height` varyantları
   * bunu yapıyor. Eşik yalnızca gerçekten sığmayacak pencereler için kaldı.
   */
  const hasRoom = useMediaQuery('(min-width: 64rem) and (min-height: 40rem)');

  return reducedMotion || !hasRoom ? (
    <FlowStage content={content} />
  ) : (
    <PinnedStage content={content} />
  );
}

/* ---------------------------------------------------------------------------
   Geniş ekran — sabitlenmiş kadran
   --------------------------------------------------------------------------- */

function PinnedStage({ content }: { content: ValuesContent }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  // Kadran son kademede dolar, tutma payında değil.
  const arc = useTransform(scrollYProgress, [0, REVEAL_END], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    setStep(STEP_AT.filter((threshold) => value >= threshold - 0.001).length);
  });

  /**
   * Düğmeyi çevirmek sayfayı kaydırır.
   *
   * Kadranın kendi durumu yok: tek doğruluk kaynağı scroll konumu. Sürükleme
   * ve ok tuşları da oraya yazdığı için üç giriş yolu (scroll, sürükleme,
   * klavye) hiçbir zaman birbiriyle çelişmez.
   */
  const scrub = useCallback((value: number, instant: boolean) => {
    const track = trackRef.current;
    if (!track) return;

    const top = track.getBoundingClientRect().top + window.scrollY;
    const travel = track.offsetHeight - window.innerHeight;
    // Sürüklemede `instant` şart: html'deki `scroll-behavior: smooth` her
    // pointer olayında yumuşak kaydırmayı baştan başlatıyor, kadran imlecin
    // gerisinde kalıp takılıyordu.
    window.scrollTo({
      top: top + value * REVEAL_END * travel,
      behavior: instant ? 'instant' : 'smooth',
    });
  }, []);

  return (
    <section id={SECTION_ID.why} className="border-t border-line">
      <div ref={trackRef} className="h-[300vh]">
        <div className="sticky top-0 flex h-screen items-center pt-16">
          <Container className="w-full">
            {/* Paylaşılan SectionHeading yerine satır içi: sabitlenmiş blokta
                başlığın da yüksekliğe göre küçülmesi gerekiyor. Tipografi yine
                token'lardan geliyor, elle punto yazılmıyor. */}
            <p className="font-mono text-label text-accent">{content.eyebrow}</p>
            <h2 className="mt-5 max-w-[20ch] text-display-2 [@media(max-height:48rem)]:mt-3 [@media(max-height:48rem)]:text-display-3">
              {content.title}
            </h2>

            <div className="mt-6 grid grid-cols-12 items-center gap-10 [@media(max-height:48rem)]:mt-4 [@media(max-height:48rem)]:gap-8">
              <div className="col-span-4">
                <StageDial
                  step={step}
                  progress={arc}
                  labels={content.entries.map((value) => value.title)}
                  title={content.title}
                  onScrub={scrub}
                  reducedMotion={false}
                />
              </div>

              <ul className="col-span-7 col-start-6 border-t border-line">
                {content.entries.map((value, index) => (
                  <li key={value.slug} className="border-b border-line">
                    <ValueBody value={value} index={index} revealed={step > index} />
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Dar ekran ve hareket azaltma — akışta
   --------------------------------------------------------------------------- */

function FlowStage({ content }: { content: ValuesContent }) {
  return (
    <section id={SECTION_ID.why} className="border-t border-line py-section">
      <Container>
        <ScrollReveal>
          <SectionHeading eyebrow={content.eyebrow} title={content.title} />
        </ScrollReveal>

        <ul className="mt-12 border-t border-line">
          {content.entries.map((value, index) => (
            <li key={value.slug} className="border-b border-line">
              <ScrollReveal delay={index * 0.06}>
                <ValueBody value={value} index={index} revealed />
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Ortak satır
   --------------------------------------------------------------------------- */

function ValueBody({
  value,
  index,
  revealed,
}: {
  value: ValueEntry;
  index: number;
  revealed: boolean;
}) {
  return (
    <div className="flex items-start gap-5 py-5 lg:gap-7 lg:py-5 [@media(max-height:48rem)]:py-3.5">
      {/* Numara çerçevenin parçası: kademe açılmadan da duruyor, açılınca vurgu
          rengine geçiyor. Boş satır böylece "bekliyor" diyor. */}
      <span
        className={cn(
          'shrink-0 pt-1.5 font-mono text-mono-sm tabular-nums transition-colors duration-[var(--duration-base)]',
          // Açılmamış numara `--fg-subtle`: `--line-strong` 11px metinde 3.01:1
          // veriyordu (AA 4.5:1 ister). Ayrım vurgu renginden geliyor.
          revealed ? 'text-accent' : 'text-fg-subtle',
        )}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <ValueGlyph
        slug={value.slug}
        revealed={revealed}
        className="size-12 shrink-0 lg:size-14 [@media(max-height:48rem)]:size-10"
      />

      <motion.div
        animate={revealed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.55, ease: EASE_ENTRANCE }}
        className="min-w-0 origin-left"
      >
        <h3 className="text-title">{value.title}</h3>
        {/* min-w-0 üstte: uzun Türkçe kelimeler ("Ölçeklenebilir") dar sütunda
            taşmasın. */}
        <p className="mt-2 max-w-[40ch] text-body text-fg-muted">{value.description}</p>
      </motion.div>
    </div>
  );
}
