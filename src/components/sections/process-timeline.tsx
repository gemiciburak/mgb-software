'use client';

import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { useMediaQuery } from '@/hooks/use-media-query';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/cn';
import { SECTION_ID } from '@/lib/sections';
import type { ProcessStep, SectionIntro } from '@/types/content';

type ProcessContent = SectionIntro & { steps: readonly ProcessStep[] };

/**
 * Süreç — scroll'a bağlı yapışkan zaman çizelgesi.
 *
 * Projedeki TEK GSAP kullanımı. Scrub'lı ilerleme çizgisi ve adım geçişleri
 * ScrollTrigger'ın net üstün olduğu iş; geri kalan her yerde Motion veya saf
 * CSS yetiyor. GSAP bu yüzden:
 *   • dinamik import ile yükleniyor, ana pakete girmiyor,
 *   • yalnızca bölüm görünüme yaklaşınca indiriliyor,
 *   • yalnızca masaüstünde ve hareket azaltma kapalıyken kuruluyor.
 *
 * Masaüstü dışında yapışkan davranış yok: adımlar normal bir dikey liste
 * olarak akıyor, aynı bilgi aynı sırayla okunuyor.
 */
export function ProcessTimeline({ content }: { content: ProcessContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  // Bölüm ekranın yarım boy altına yaklaşınca GSAP indirilmeye başlar.
  const isApproaching = useInView(sectionRef, { once: true, margin: '0px 0px 60% 0px' });

  useEffect(() => {
    if (reducedMotion || !isDesktop || !isApproaching) return;

    let cancelled = false;
    let context: { revert: () => void } | undefined;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        // İlerleme çizgisi scroll'a bağlı dolar (scrub).
        gsap.fromTo(
          progressRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 40%',
              end: 'bottom 70%',
              scrub: true,
            },
          },
        );

        // Her adım bloğu, ekranın ortasını geçerken aktif olur.
        stepRefs.current.forEach((element, index) => {
          if (!element) return;
          ScrollTrigger.create({
            trigger: element,
            start: 'top 55%',
            end: 'bottom 55%',
            onEnter: () => setActiveIndex(index),
            onEnterBack: () => setActiveIndex(index),
          });
        });
      }, sectionRef);
    })();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, [reducedMotion, isDesktop, isApproaching]);

  return (
    <section ref={sectionRef} id={SECTION_ID.process} className="border-t border-line py-section">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Yapışkan sol kolon: başlık, ilerleme rayı ve aktif adım. */}
          <div className="lg:sticky lg:top-32 lg:col-span-5 lg:self-start">
            <ScrollReveal>
              <SectionHeading
                eyebrow={content.eyebrow}
                title={content.title}
                {...(content.description ? { description: content.description } : {})}
              />
            </ScrollReveal>

            <div className="mt-12 hidden gap-6 lg:flex">
              {/* Dikey ray: sönük zemin + scroll ile dolan vurgu çizgisi. */}
              <div className="relative w-px shrink-0 bg-line">
                <span
                  ref={progressRef}
                  aria-hidden="true"
                  className="absolute inset-0 origin-top bg-accent"
                  style={{ transform: 'scaleY(0)' }}
                />
              </div>

              <ol className="space-y-4">
                {content.steps.map((step, index) => (
                  <li
                    key={step.title}
                    aria-current={index === activeIndex ? 'step' : undefined}
                    className={cn(
                      'flex items-baseline gap-4 font-mono text-mono-sm transition-colors duration-[var(--duration-fast)]',
                      index === activeIndex ? 'text-fg' : 'text-fg-subtle',
                    )}
                  >
                    <span className={index === activeIndex ? 'text-accent' : ''}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{step.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Adımlar. Masaüstünde her biri ekranın yarısı kadar yer kaplar ki
              scroll ile tek tek öne çıksınlar; mobilde sıradan bir liste. */}
          <ol className="lg:col-span-6 lg:col-start-7">
            {content.steps.map((step, index) => {
              /**
               * Aktif olmayan adım opaklıkla DEĞİL renkle geri çekilir.
               * `opacity-45` açıklamayı 2.08:1'e, numarayı 2.15:1'e düşürüyordu
               * (Lighthouse/axe ölçümü). Renk kademesinde en sönük metin
               * `--fg-subtle`: açıkta 4.51:1, koyuda 5.37:1 — AA içinde.
               */
              const dimmed = isDesktop && !reducedMotion && index !== activeIndex;
              const tone = 'transition-colors duration-[var(--duration-base)]';

              return (
                <li key={step.title}>
                  <div
                    ref={(element) => {
                      stepRefs.current[index] = element;
                    }}
                    className={cn(
                      'border-t border-line py-10',
                      'lg:flex lg:min-h-[52vh] lg:flex-col lg:justify-center lg:py-16',
                    )}
                  >
                    <p
                      className={cn(
                        'font-mono text-mono-sm tabular-nums',
                        tone,
                        dimmed ? 'text-fg-subtle' : 'text-accent',
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3
                      className={cn(
                        'mt-4 text-display-3',
                        tone,
                        dimmed ? 'text-fg-muted' : 'text-fg',
                      )}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={cn(
                        'mt-5 max-w-[46ch] text-body-lg',
                        tone,
                        dimmed ? 'text-fg-subtle' : 'text-fg-muted',
                      )}
                    >
                      {step.description}
                    </p>
                    <p className="mt-6 font-mono text-mono-sm text-fg-subtle">{step.deliverable}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
