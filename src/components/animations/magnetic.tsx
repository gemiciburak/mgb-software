'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { useIsTouch } from '@/hooks/use-is-touch';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

/**
 * Manyetik sarmalayıcı: imleç yaklaştıkça içerik hafifçe ona doğru kayar.
 *
 * Yalnızca hassas işaretleyicide (fare/trackpad) çalışır. Dokunmatikte ve
 * hareket azaltma açıkken sarmalayıcı hiç kurulmaz — children doğrudan
 * render edilir, boşa motion value ve spring oluşturulmaz.
 *
 * Kayma miktarı bilinçli olarak küçük: düğme imlecin altından kaçmamalı,
 * yalnızca "farkında" görünmeli.
 */
export function Magnetic({
  children,
  strength = 0.22,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const reducedMotion = usePrefersReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 230, damping: 20, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 230, damping: 20, mass: 0.35 });

  if (isTouch || reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const element = ref.current;
    if (!element) return;

    const bounds = element.getBoundingClientRect();
    x.set((event.clientX - (bounds.left + bounds.width / 2)) * strength);
    y.set((event.clientY - (bounds.top + bounds.height / 2)) * strength);
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </motion.div>
  );
}
