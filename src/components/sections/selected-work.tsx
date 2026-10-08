'use client';

import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { useLocale } from 'next-intl';
import { type PointerEvent, useState } from 'react';
import type { Locale, Project, ServiceSlug } from '@/shared';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { WordReveal } from '@/components/animations/word-reveal';
import { Container } from '@/components/ui/container';
import { useIsTouch } from '@/hooks/use-is-touch';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/cn';
import { DURATION, EASE_ENTRANCE } from '@/lib/motion';
import { SECTION_ID } from '@/lib/sections';
import type { WorkContent } from '@/types/content';

/** Proje kartı iskeletinin çizgileri — tarayıcı/uygulama çerçevesi. */
const CARD_PATHS = [
  'M1 1h318v196H1z',
  'M1 29h318',
  'M13 15h8M27 15h8M41 15h8',
  'M25 53h120v88H25z',
  'M165 53h130v12H165z',
  'M165 77h130v8H165z',
  'M165 97h92v8h-92z',
  'M165 125h62v16h-62z',
  'M25 161h270',
];

/** Önizleme görselinin boyutu (px) — konum ofseti buradan hesaplanır. */
const PREVIEW = { width: 320, height: 240 } as const;
const FOLLOW_SPRING = { stiffness: 140, damping: 22, mass: 0.5 } as const;
const PARALLAX = 18;

/**
 * Seçilmiş İşler.
 *
 * Bileşen `projects` dizisini alır: doluysa editorial proje dizini, boşsa
 * bilinçli bir bekleme durumu render eder. Proje eklemek için bu dosyaya
 * dokunmaya gerek yok — veri content/projects.ts'ten gelir.
 */
export function SelectedWork({
  content,
  projects = [],
  serviceLabels,
}: {
  content: WorkContent;
  projects?: readonly Project[];
  /** slug → okunur hizmet adı. Künyede "05" yerine "E-Ticaret" yazsın diye. */
  serviceLabels: Readonly<Partial<Record<ServiceSlug, string>>>;
}) {
  return projects.length > 0 ? (
    <WorkIndex content={content} projects={projects} serviceLabels={serviceLabels} />
  ) : (
    <WorkPending content={content} />
  );
}

/* ---------------------------------------------------------------------------
   Dolu durum — proje dizini
   --------------------------------------------------------------------------- */

/**
 * Projeler kart ızgarası olarak değil, numaralı bir dizin olarak duruyor:
 * bir yayınevi künyesi gibi. Görsel satırın içinde değil, imlecin peşinde —
 * böylece liste tipografik ve sakin kalıyor, görsel ise yalnızca ilgilenilen
 * satır için ortaya çıkıyor.
 *
 * Satır başlıkları hiçbir zaman soldurulmuyor. "Diğerlerini karart" kalıbı
 * iyi görünür ama okunabilirliği bozar; ayrım bunun yerine hareketle
 * kuruluyor: ilgilenilen satır sağa kayıyor, soldan vurgu çizgisi çıkıyor ve
 * künyesi açılıyor.
 */
function WorkIndex({
  content,
  projects,
  serviceLabels,
}: {
  content: WorkContent;
  projects: readonly Project[];
  serviceLabels: Readonly<Partial<Record<ServiceSlug, string>>>;
}) {
  const locale = useLocale() as Locale;
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouch();
  const follows = !reducedMotion && !isTouch;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : projects[activeIndex];

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const previewX = useSpring(rawX, FOLLOW_SPRING);
  const previewY = useSpring(rawY, FOLLOW_SPRING);

  /**
   * Önizleme imlecin TAM ÜSTÜNDE durmuyor: sağ kenara demirli, dikeyde imleci
   * izliyor ve yatayda birkaç piksel sürükleniyor. Tam imleç altında olsaydı
   * okumaya çalıştığınız proje adının üstünü kapatırdı.
   */
  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (!follows) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const drift = ((event.clientX - rect.left) / rect.width - 0.5) * 2 * PARALLAX;
    rawX.set(rect.width - PREVIEW.width - 48 + drift);
    rawY.set(
      Math.min(
        Math.max(event.clientY - rect.top - PREVIEW.height / 2, 16),
        rect.height - PREVIEW.height - 16,
      ),
    );
  }

  return (
    <section
      id={SECTION_ID.work}
      className="relative anchor-target border-t border-line py-section"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setActiveIndex(null)}
    >
      {/* İmleci takip eden önizleme. Yayda gecikmeli olduğu için imlecin
          arkasından sürükleniyor; anında yapışsaydı ucuz görünürdü. */}
      {follows && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-10"
          style={{ x: previewX, y: previewY, width: PREVIEW.width, height: PREVIEW.height }}
        >
          <AnimatePresence>
            {active?.cover && (
              <motion.img
                key={active.id}
                src={active.cover.url}
                alt=""
                width={active.cover.width}
                height={active.cover.height}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: DURATION.base, ease: EASE_ENTRANCE }}
                className="size-full object-cover"
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <Container className="relative">
        <ScrollReveal>
          <p className="font-mono text-label text-accent">{content.eyebrow}</p>
        </ScrollReveal>

        <ul className="mt-12 border-t border-line">
          {projects.map((project, index) => {
            const isActive = activeIndex === index;

            return (
              <li key={project.id} className="border-b border-line">
                <a
                  href={project.liveUrl ?? `#${SECTION_ID.work}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onBlur={() => setActiveIndex(null)}
                  className="group relative flex items-baseline gap-5 py-7 lg:gap-8 lg:py-9"
                >
                  <span
                    className={cn(
                      'font-mono text-label tabular-nums transition-colors duration-[var(--duration-base)]',
                      isActive ? 'text-accent' : 'text-fg-subtle',
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <motion.div
                    animate={reducedMotion || !isActive ? { x: 0 } : { x: 18 }}
                    transition={{ duration: DURATION.base, ease: EASE_ENTRANCE }}
                  >
                    <span className="block text-display-3 text-fg">{project.title[locale]}</span>

                    {/* Künye başlığın ALTINDA: sağ taraf tamamen boş kalsın ki
                        önizleme hiçbir metnin üstünü kapatmasın. Hizmet adı
                        görünmezken de yerini koruyor, satır yüksekliği sabit. */}
                    <span className="mt-3 block font-mono text-mono-sm text-fg-subtle">
                      <span className="tabular-nums">{project.year}</span>
                      <motion.span
                        animate={{ opacity: isActive ? 1 : 0 }}
                        transition={{ duration: DURATION.fast }}
                      >
                        {' · '}
                        {project.services.map((slug) => serviceLabels[slug] ?? slug).join(' · ')}
                      </motion.span>
                    </span>
                  </motion.div>
                </a>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Boş durum — henüz yayında proje yok
   --------------------------------------------------------------------------- */

/**
 * Sahte içerik üretmiyoruz ama boş da görünmüyor.
 *
 * Cümle kelime kelime açılıyor ve sayfanın en büyük tipografisini kullanıyor:
 * bu bir özür değil, bir duruş. Yanındaki wireframe bir proje kartı çiziyor,
 * bekliyor, çözülüyor ve yeniden başlıyor — imleçle birlikte hafifçe kayıyor.
 * Çerçeveli kutusu kaldırıldı; çizim artık sayfanın üstünde duruyor.
 */
function WorkPending({ content }: { content: WorkContent }) {
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouch();
  const parallax = !reducedMotion && !isTouch;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const driftX = useSpring(pointerX, FOLLOW_SPRING);
  const driftY = useSpring(pointerY, FOLLOW_SPRING);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (!parallax) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2 * PARALLAX);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2 * PARALLAX);
  }

  return (
    <section
      id={SECTION_ID.work}
      className="anchor-target border-t border-line py-section"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <Container>
        <ScrollReveal>
          <p className="font-mono text-label text-accent">{content.eyebrow}</p>
        </ScrollReveal>

        <h2 className="mt-8 max-w-[18ch] text-display-2 text-balance">
          <WordReveal text={content.title} />
        </h2>

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-0">
          <div className="lg:col-span-5">
            <ScrollReveal>
              <p className="max-w-[44ch] text-body-lg text-fg-muted">{content.body}</p>

              <div className="mt-10 flex items-center gap-4">
                <span className="font-mono text-mono-sm text-accent">{content.status}</span>
                {/* İlerleme çizgisi: tamamlanmayan, dönen bir gösterge —
                    sahte bir yüzde vaat etmiyor, "çalışıyor" diyor. */}
                <span aria-hidden="true" className="relative h-px w-28 overflow-hidden bg-line">
                  {!reducedMotion && (
                    <motion.span
                      className="absolute inset-y-0 left-0 w-1/3 bg-accent"
                      animate={{ x: ['-100%', '300%'] }}
                      transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
                    />
                  )}
                </span>
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <motion.div style={parallax ? { x: driftX, y: driftY } : undefined}>
              <svg
                viewBox="0 0 320 198"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="square"
                className="w-full text-line-strong"
                role="img"
                aria-label={content.title}
              >
                {CARD_PATHS.map((d, index) => (
                  <motion.path
                    key={d}
                    d={d}
                    vectorEffect="non-scaling-stroke"
                    // Çiz → bekle → çöz → yeniden. Sabit bir döngü değil,
                    // her parça kendi gecikmesiyle giriyor.
                    initial={reducedMotion ? false : { pathLength: 0, opacity: 0.2 }}
                    animate={
                      reducedMotion
                        ? { pathLength: 1, opacity: 1 }
                        : { pathLength: [0, 1, 1, 0], opacity: [0.2, 1, 1, 0.2] }
                    }
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : {
                            duration: 7,
                            times: [0, 0.34, 0.74, 1],
                            ease: EASE_ENTRANCE,
                            repeat: Infinity,
                            delay: index * 0.12,
                          }
                    }
                    stroke={index === 0 ? 'var(--accent)' : 'currentColor'}
                  />
                ))}
              </svg>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
