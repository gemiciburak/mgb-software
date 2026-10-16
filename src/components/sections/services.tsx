'use client';

import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { useTranslations } from 'next-intl';
import { type PointerEvent, useId, useState } from 'react';
import { serviceNumber } from '@/shared';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ServiceGlyph } from '@/components/ui/service-glyph';
import { useIsTouch } from '@/hooks/use-is-touch';
import { useMediaQuery } from '@/hooks/use-media-query';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/cn';
import { DURATION, EASE_ENTRANCE } from '@/lib/motion';
import { SECTION_ID } from '@/lib/sections';
import type { SectionIntro, ServiceEntry } from '@/types/content';

type ServicesContent = SectionIntro & { entries: readonly ServiceEntry[] };

/** Çizimin imleçle kayabileceği azami mesafe (px). */
const PARALLAX = 16;
const PARALLAX_SPRING = { stiffness: 70, damping: 18, mass: 0.7 } as const;

/**
 * Hizmetler — kart ızgarası değil, tipografik bir sahne.
 *
 * Bölümün tek fikri şu: seçili olmayan hizmetler İÇİ BOŞ harflerle, seçili
 * olan DOLU harflerle yazılır. Liste böylece durağan bir menü olmaktan çıkıp
 * tek bir şeye odaklanan bir sahneye dönüşüyor — ve "diğerlerini soldurma"
 * işini opaklık düşürerek değil, tipografinin kendisiyle yapıyor. Üstüne
 * opaklık da bindirseydik etiketler okunmaz hale gelirdi. (Ölçüldü: kontur
 * açık temada 7.24:1, koyuda 8.51:1 — büyük metin eşiği 3:1.)
 *
 * Kontur yalnızca lg ve üzerinde. Mobilde hover yok, yani altı satırın beşi
 * kalıcı olarak kontur kalırdı; üstelik 24px'te 1px'lik kontur 64px'tekinin
 * sağlamlığını vermiyor. Küçük ekranda satırlar dolu yazılıyor.
 *
 * Sağ tarafta o hizmetin wireframe çizimi büyük ölçekte duruyor, imleçle
 * birkaç piksel kayıyor ve hizmet değişince yeniden çiziliyor. Çizim ile
 * metin aynı alanı PAYLAŞMIYOR: aralarında dikey bir hairline var.
 *
 * İki davranış, tek işaretleme — masaüstü/mobil arasında yerleşim sıçraması
 * olmasın diye:
 *   • lg ve üzeri → satıra gelince (hover veya klavye odağı) sağdaki yapışkan
 *     sütun o hizmete geçer.
 *   • lg altı → satır bir accordion; dokununca altında solda küçük bir çizim,
 *     sağda çıktılar açılır. Açıklama yalnızca masaüstünde.
 *
 * TODO: hizmet detay sayfaları yayına alınınca satırlar onlara bağlanacak
 * (`/hizmetler/[slug]` ↔ `/en/services/[slug]`). O zaman <button> yerine
 * next-intl <Link> kullanılacak.
 */
export function Services({ content }: { content: ServicesContent }) {
  const t = useTranslations('actions');
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouch();
  const panelId = useId();
  // Hangi panelin gerçekten görünür olduğu ARIA ilişkisini belirler: mobilde
  // satır içi accordion, masaüstünde sağdaki yapışkan sütun.
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  const desktopPanelId = `${panelId}-desktop`;

  // Masaüstünde hover/odak, mobilde açılan satır; hiçbiri yoksa ilki.
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const activeIndex = focusedIndex ?? expandedIndex ?? 0;
  const active = content.entries[activeIndex];

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const glyphX = useSpring(pointerX, PARALLAX_SPRING);
  const glyphY = useSpring(pointerY, PARALLAX_SPRING);
  const parallax = !reducedMotion && !isTouch;

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (!parallax) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2 * PARALLAX);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2 * PARALLAX);
  }

  return (
    <section
      id={SECTION_ID.services}
      className="anchor-target border-t border-line py-section"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <Container>
        <ScrollReveal>
          <SectionHeading eyebrow={content.eyebrow} title={content.title} />
        </ScrollReveal>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-0">
          <ul className="border-t border-line lg:col-span-6">
            {content.entries.map((service, index) => {
              const isExpanded = expandedIndex === index;
              const isActive = activeIndex === index;

              return (
                <li key={service.slug} className="border-b border-line">
                  <button
                    type="button"
                    data-active={isActive}
                    onMouseEnter={() => setFocusedIndex(index)}
                    onFocus={() => setFocusedIndex(index)}
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    id={`${panelId}-${service.slug}-trigger`}
                    {...(isDesktop
                      ? {
                          // Masaüstünde açılıp kapanan bir şey yok; satır sağdaki
                          // sütunu seçer. Seçili satır aria-current ile bildirilir.
                          'aria-controls': desktopPanelId,
                          ...(isActive ? { 'aria-current': 'true' as const } : {}),
                        }
                      : {
                          'aria-expanded': isExpanded,
                          'aria-controls': `${panelId}-${service.slug}`,
                        })}
                    className="group relative flex w-full items-baseline gap-5 py-6 text-left lg:gap-7 lg:py-8"
                  >
                    <span
                      className={cn(
                        'font-mono text-label tabular-nums transition-colors duration-[var(--duration-base)]',
                        isActive ? 'text-accent' : 'text-fg-subtle',
                      )}
                    >
                      {serviceNumber(service.slug)}
                    </span>
                    <span className="text-display-3 text-fg lg:type-outline">{service.title}</span>
                    {/* Mobil: satırın açılabildiğini gösteren artı → eksi (SSS ile aynı
                        işaret). Masaüstünde satır açılmaz, işaret de yok. */}
                    <span
                      aria-hidden="true"
                      className="relative ml-auto size-3.5 shrink-0 self-center lg:hidden"
                    >
                      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-fg-muted" />
                      <span
                        className={cn(
                          'absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-fg-muted transition-transform duration-[var(--duration-base)] ease-[var(--ease-transition)]',
                          isExpanded && 'scale-y-0',
                        )}
                      />
                    </span>
                    {/* Aktif satırın altını süpüren vurgu çizgisi. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-px h-px sweep-rule bg-accent"
                    />
                  </button>

                  {/* Mobil: satır içi açılır detay. Masaüstünde hiç görünmez. */}
                  <div
                    id={`${panelId}-${service.slug}`}
                    hidden={!isExpanded}
                    className="pb-7 lg:hidden"
                  >
                    {/* Açıklama mobilde görünmüyor: ilk cümlesi çıktıları tekrar
                        ediyor. Yine de ekran okuyucular ve arama motorları için
                        işaretlemede duruyor. */}
                    <p className="sr-only">{service.summary}</p>
                    {/* Solda çizimin küçük hali, sağda çıktılar. Çizim yalnızca
                        açıkken bağlanıyor ki her açılışta yeniden çizilsin. */}
                    <div className="flex items-center gap-6 pt-5">
                      <div className="w-28 shrink-0 text-line-strong">
                        {isExpanded && <ServiceGlyph slug={service.slug} className="w-full" />}
                      </div>
                      <ul className="min-w-0 space-y-1.5">
                        {service.deliverables.map((item) => (
                          <li
                            key={item}
                            className="pl-[2ch] indent-[-2ch] font-mono text-mono-sm tracking-[0.06em] text-fg-subtle"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Masaüstü sütunu — çerçeveli kart değil, dikey hairline ile ayrılmış
              bir pafta. Yapışkan, satır değiştikçe içeriği yenilenir. */}
          <div className="hidden lg:col-span-5 lg:col-start-8 lg:block lg:border-l lg:border-line lg:pl-10 xl:pl-14">
            <div
              id={desktopPanelId}
              role="region"
              {...(active ? { 'aria-labelledby': `${panelId}-${active.slug}-trigger` } : {})}
              className="sticky top-32"
            >
              <motion.div style={parallax ? { x: glyphX, y: glyphY } : undefined}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active?.slug ?? 'empty'}
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reducedMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0 : DURATION.fast }}
                    className="text-line-strong"
                  >
                    {active && <ServiceGlyph slug={active.slug} className="w-full" />}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active?.slug ?? 'empty-copy'}
                  initial={reducedMotion ? false : 'hidden'}
                  animate="shown"
                  exit={reducedMotion ? undefined : 'hidden'}
                  variants={{
                    hidden: { opacity: 0 },
                    shown: { opacity: 1, transition: { staggerChildren: 0.05 } },
                  }}
                  transition={{ duration: reducedMotion ? 0 : DURATION.fast }}
                  className="mt-10"
                >
                  <motion.p
                    variants={LINE_VARIANTS}
                    transition={{ duration: DURATION.base, ease: EASE_ENTRANCE }}
                    className="text-body text-fg-muted"
                  >
                    {active?.summary}
                  </motion.p>

                  <ul className="mt-8 space-y-3 border-t border-line pt-6">
                    {active?.deliverables.map((item) => (
                      <motion.li
                        key={item}
                        variants={LINE_VARIANTS}
                        transition={{ duration: DURATION.base, ease: EASE_ENTRANCE }}
                        className="flex items-center gap-3 font-mono text-mono-sm text-fg-subtle"
                      >
                        <span aria-hidden="true" className="h-0.5 w-4 shrink-0 bg-accent" />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Ekran okuyucular için: panelin ne işe yaradığını açıklayan gizli metin. */}
        <p className="sr-only">{t('viewService')}</p>
      </Container>
    </section>
  );
}

/** Açıklama ve çıktı satırlarının sıralı girişi. */
const LINE_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0 },
} as const;
