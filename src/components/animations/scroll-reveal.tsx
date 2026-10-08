'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { DURATION, EASE_ENTRANCE } from '@/lib/motion';

/**
 * Görünüme girince bir kez beliren sarmalayıcı.
 *
 * Hareket azaltma açıkken animasyon kurulmaz — öğe doğrudan son hâliyle
 * render edilir, "0ms süreli animasyon" numarası yapılmaz. Sunucudan gelen
 * children burada sarmalanır ama sunucu bileşeni olarak kalır.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** Saniye cinsinden gecikme — sıralı girişler için. */
  delay?: number;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -10% 0px' }}
      transition={{ duration: DURATION.slow, ease: EASE_ENTRANCE, delay }}
    >
      {children}
    </motion.div>
  );
}
