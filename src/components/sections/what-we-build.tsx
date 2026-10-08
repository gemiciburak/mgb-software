'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Container } from '@/components/ui/container';
import { PauseIcon, PlayIcon } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/section-heading';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { SECTION_ID } from '@/lib/sections';
import type { SectionIntro } from '@/types/content';

type BuildContent = SectionIntro & { entries: readonly string[] };

/**
 * Ürettiklerimiz — hareketli tipografi.
 *
 * Jenerik bir marquee yerine "teknik şerit": her çıktı mono bir indeks
 * numarası ve hairline ayırıcıyla birlikte akıyor. İki sıra ters yönlerde
 * ve farklı hızlarda ilerliyor, böylece tek yönlü kayan bant hissi kırılıyor.
 * Üzerine gelince akış duruyor — okumak isteyen durdurabilmeli.
 *
 * Hover yalnızca fare kullanıcısına yetiyor. Kendiliğinden başlayan ve beş
 * saniyeden uzun süren hareket için WCAG 2.2.2 herkese açık bir durdurma yolu
 * istiyor; dokunmatik ve klavye kullanıcıları için başlığın yanında bir
 * durdur/başlat düğmesi var (`aria-pressed`).
 *
 * Hareket azaltma açıkken animasyon "hızlandırılmıyor", bileşen tamamen
 * farklı bir şey render ediyor: sabit bir ızgara listesi. Global CSS kuralı
 * marquee'yi durdursa da içeriğin yarısı görünmez kalırdı.
 */
export function WhatWeBuild({ content }: { content: BuildContent }) {
  const t = useTranslations('actions');
  const reducedMotion = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const half = Math.ceil(content.entries.length / 2);
  const rows = [content.entries.slice(0, half), content.entries.slice(half)];

  return (
    <section id={SECTION_ID.build} className="overflow-hidden border-t border-line py-section">
      <Container>
        <ScrollReveal className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow={content.eyebrow} title={content.title} />
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

      {reducedMotion ? (
        <Container className="mt-14">
          <ul className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {content.entries.map((entry, index) => (
              <li key={entry} className="flex items-baseline gap-4 bg-bg px-6 py-7">
                <span className="font-mono text-mono-sm text-accent tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-title">{entry}</span>
              </li>
            ))}
          </ul>
        </Container>
      ) : (
        <div className="mt-14 space-y-7">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="group flex w-max marquee-track"
              style={{
                // İki sıra ters yönde ve farklı hızda akar.
                animation: `${rowIndex === 0 ? 'marquee-left' : 'marquee-right'} ${
                  rowIndex === 0 ? 46 : 58
                }s linear infinite`,
                animationPlayState: paused ? 'paused' : undefined,
              }}
            >
              {/* İçerik iki kez basılır; ilk kopya bitince ikincisi kusursuz devralır. */}
              {[0, 1].map((copy) => (
                <ul key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
                  {row.map((entry, index) => (
                    <li
                      key={entry}
                      className="flex items-baseline gap-4 border-l border-line px-8 lg:px-12"
                    >
                      <span className="font-mono text-mono-sm text-fg-subtle tabular-nums transition-colors duration-[var(--duration-fast)] group-hover:text-accent">
                        {String(rowIndex * half + index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-display-3 whitespace-nowrap text-fg">{entry}</span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
