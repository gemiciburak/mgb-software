'use client';

import { motion } from 'motion/react';
import type { ServiceSlug } from '@/shared';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { DURATION, EASE_ENTRANCE } from '@/lib/motion';

/**
 * Hizmet başına küçük wireframe çizim.
 *
 * Hepsi 120×88 kutuda, yalnızca konturdan oluşuyor — hero'daki tel kafes
 * diliyle aynı aile. Aktif hizmet değişince çizgiler yeniden "çizilir"
 * (pathLength 0 → 1), yani teknik bir çizim yapılıyormuş gibi görünür.
 */
const GLYPHS: Record<ServiceSlug, readonly string[]> = {
  // tarayıcı penceresi
  'web-development': [
    'M4 10h112v68H4z',
    'M4 24h112',
    'M12 17h6M22 17h6M32 17h6',
    'M16 36h40M16 46h56M16 56h32',
    'M76 36h28v30H76z',
  ],
  // üst üste binen artboard'lar ve imleç
  'ui-ux-design': [
    'M8 14h64v48H8z',
    'M44 30h64v48H44z',
    'M44 30v32M72 30v32',
    'M86 50l12 14 3-6 6-2z',
  ],
  // bağlı sistem düğümleri
  'software-backend': [
    'M10 12h44v20H10zM66 12h44v20H66z',
    'M10 56h44v20H10zM66 56h44v20H66z',
    'M32 32v24M88 32v24M54 22h12M54 66h12',
    'M18 22h8M74 22h8M18 66h8M74 66h8',
  ],
  // telefon çerçevesi
  'mobile-apple': [
    'M44 6h32v76H44z',
    'M44 18h32M44 70h32',
    'M52 12h16',
    'M52 30h16M52 40h16M52 50h10',
  ],
  // ürün kartları ve sepet
  'e-commerce': [
    'M8 14h30v28H8zM45 14h30v28H45zM82 14h30v28H82z',
    'M8 52h30v8H8zM45 52h20v8H45zM82 52h24v8H82z',
    'M8 70h18l6 12h48l6-12',
    'M40 70h4',
  ],
  // izometrik küp
  'technical-design-3d': [
    'M60 8L104 32v36L60 92 16 68V32z',
    'M60 8v40M60 48l44-16M60 48L16 32',
    'M60 48v44',
    'M16 68l44-20 44 20',
  ],
};

export function ServiceGlyph({ slug, className }: { slug: ServiceSlug; className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const paths = GLYPHS[slug];

  return (
    <svg
      viewBox="0 0 120 88"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
      strokeLinejoin="miter"
      vectorEffect="non-scaling-stroke"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: reducedMotion ? 0 : DURATION.slow,
            ease: EASE_ENTRANCE,
            delay: reducedMotion ? 0 : index * 0.07,
          }}
        />
      ))}
    </svg>
  );
}
