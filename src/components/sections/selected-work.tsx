'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { Fragment, type PointerEvent, useId, useState } from 'react';
import type { Locale, Project, ServiceSlug } from '@/shared';
import { ProjectDeck } from '@/components/animations/project-deck';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { WordReveal } from '@/components/animations/word-reveal';
import { Container } from '@/components/ui/container';
import { ArrowRightIcon, ArrowUpRightIcon, PauseIcon, PlayIcon } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/section-heading';
import { useIsTouch } from '@/hooks/use-is-touch';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/cn';
import { EASE_ENTRANCE } from '@/lib/motion';
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

const FOLLOW_SPRING = { stiffness: 140, damping: 22, mass: 0.5 } as const;
const PARALLAX = 18;
/** Dizinde ilk anda görünen proje sayısı; gerisi "hepsini göster" ile açılır. */
const INDEX_PREVIEW = 3;

/**
 * Seçilmiş İşler.
 *
 * Bileşen `projects` dizisini alır: doluysa döner proje destesi ve proje
 * dizini, boşsa bilinçli bir bekleme durumu render eder. Proje eklemek için
 * bu dosyaya dokunmaya gerek yok — veri content/projects.ts'ten gelir.
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
   Dolu durum — deste + proje dizini
   --------------------------------------------------------------------------- */

/**
 * Bölümün gösterisi döner deste (`ProjectDeck`); proje kapakları ve henüz
 * dolmamış yerler için "Yakında" kartları aynı halkada döner.
 *
 * Deste dekoratif kaldığı için asıl bağlantılar altındaki dizinde: numara,
 * başlık, özet ve künye. Satırlar hareket etmiyor ve önizleme açmıyor — görsel
 * zaten destede. Dizin ilk `INDEX_PREVIEW` projeyle başlar; fazlası varsa
 * sağ alttaki düğme kalanını açar. Deste her zaman bütün projeleri döndürür.
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
  const t = useTranslations('actions');
  const reducedMotion = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const collapsible = projects.length > INDEX_PREVIEW;
  const visibleProjects = expanded ? projects : projects.slice(0, INDEX_PREVIEW);

  return (
    <section
      id={SECTION_ID.work}
      className="anchor-target overflow-hidden border-t border-line py-section"
    >
      <Container>
        <ScrollReveal className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow={content.eyebrow} title={content.indexTitle} />
          {/* WCAG 2.2.2: kendiliğinden dönen deste için herkese açık durdurma. */}
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
              aria-label={t('pauseMotion')}
              title={paused ? t('playMotion') : t('pauseMotion')}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm border border-line text-fg-muted transition-colors duration-[var(--duration-fast)] hover:border-accent hover:text-accent"
            >
              {paused ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />}
            </button>
          )}
        </ScrollReveal>
      </Container>

      <ProjectDeck
        projects={projects}
        locale={locale}
        soonLabel={content.soon}
        paused={paused}
        className="mt-8 lg:mt-10"
      />

      <Container>
        <ul id={listId} className="mt-8 border-t border-line lg:mt-10">
          {visibleProjects.map((project, index) => {
            const row = (
              <>
                <span className="font-mono text-label text-fg-subtle tabular-nums transition-colors duration-[var(--duration-fast)] group-hover:text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="min-w-0 flex-1 lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-8">
                  <span className="block lg:col-span-6">
                    <span className="block text-display-3 text-fg">{project.title[locale]}</span>
                    {/* Künye. Konsept etiketi hep görünür: iş müşteri işi gibi
                        okunmasın. Her parça kendi içinde kırılmaz ve ayırıcı
                        noktayı sonunda taşır: dar ekranda alt satır "·" ile
                        başlamasın. */}
                    <span className="mt-3 block font-mono text-mono-sm text-fg-subtle tabular-nums">
                      {[
                        String(project.year),
                        ...(project.concept ? [content.concept] : []),
                        ...project.services.map((slug) => serviceLabels[slug] ?? slug),
                      ].map((part, partIndex, parts) => (
                        <Fragment key={part}>
                          {partIndex > 0 && ' '}
                          <span className="whitespace-nowrap">
                            {part}
                            {partIndex < parts.length - 1 && ' ·'}
                          </span>
                        </Fragment>
                      ))}
                    </span>
                  </span>
                  <span className="mt-4 block max-w-[46ch] text-body text-fg-muted lg:col-span-5 lg:mt-0">
                    {project.summary[locale]}
                  </span>
                </span>

                {project.liveUrl && (
                  <span className="mt-2 inline-flex shrink-0 items-center gap-2 self-start font-mono text-mono-sm text-fg-muted transition-colors duration-[var(--duration-fast)] group-hover:text-accent lg:mt-0 lg:self-center">
                    <span className="hidden sm:inline">{content.visit}</span>
                    <ArrowUpRightIcon className="size-3.5" />
                  </span>
                )}
              </>
            );

            const className = 'group flex items-baseline gap-5 py-8 lg:gap-8 lg:py-10';

            // Sonradan açılan satırlar yerine oturarak girsin; ilk üçü sayfayla
            // birlikte zaten görünür.
            const revealed = index >= INDEX_PREVIEW && !reducedMotion;

            return (
              <motion.li
                key={project.id}
                className="border-b border-line"
                initial={revealed ? { opacity: 0, y: 16 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: EASE_ENTRANCE,
                  delay: (index - INDEX_PREVIEW) * 0.06,
                }}
              >
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={className}
                  >
                    {row}
                  </a>
                ) : (
                  <div className={className}>{row}</div>
                )}
              </motion.li>
            );
          })}
        </ul>

        {collapsible && (
          <div className="mt-6 flex justify-end lg:mt-8">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-controls={listId}
              className="group inline-flex min-h-11 items-center gap-3 font-mono text-mono-sm text-fg-muted transition-colors duration-[var(--duration-fast)] hover:text-accent"
            >
              {expanded ? content.showLess : content.showAll}
              <ArrowRightIcon
                className={cn(
                  'size-3.5 transition-transform duration-[var(--duration-fast)]',
                  expanded ? '-rotate-90' : 'rotate-90',
                )}
              />
            </button>
          </div>
        )}
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
