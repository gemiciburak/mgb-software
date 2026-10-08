'use client';

import { motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/cn';
import { EASE_ENTRANCE } from '@/lib/motion';
import { VALUE_GLYPH_PATHS } from '@/lib/value-glyphs';
import type { ValueSlug } from '@/types/content';

/**
 * Bir değerin izometrik hairline çizimi.
 *
 * Kenarlar tek tek çizilir — teknik bir çizim yapılıyormuş gibi. Çizgiler tek
 * bir `d` içinde geldiği için her kenarı ayrı animasyonlamak yerine tüm yolu
 * `pathLength` ile açıyoruz: aynı etki, tek bir SVG elemanı.
 *
 * `revealed` verilirse çizim dışarıdan yönetilir (kademeli açılmada sıra ona
 * gelince çizilir); verilmezse çizim kendi görünürlüğünü izler.
 */
export function ValueGlyph({
  slug,
  className,
  revealed,
}: {
  slug: ValueSlug;
  className?: string;
  revealed?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();

  const drawn = { pathLength: 1, opacity: 1 };
  const control =
    revealed === undefined
      ? ({ whileInView: drawn, viewport: { once: true, amount: 0.6 } } as const)
      : ({ animate: revealed ? drawn : { pathLength: 0, opacity: 0 } } as const);

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
      vectorEffect="non-scaling-stroke"
      className={cn('text-line-strong', className)}
      aria-hidden="true"
      focusable="false"
    >
      <motion.path
        d={VALUE_GLYPH_PATHS[slug]}
        initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
        {...control}
        transition={{ duration: reducedMotion ? 0 : 1.1, ease: EASE_ENTRANCE }}
      />
    </svg>
  );
}
