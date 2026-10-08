'use client';

import { useInView } from 'motion/react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useDocumentVisibility } from '@/hooks/use-document-visibility';
import { useIsTouch } from '@/hooks/use-is-touch';
import { useMediaQuery } from '@/hooks/use-media-query';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/cn';

/**
 * Three.js sahnesi yalnızca gerçekten gerektiğinde indirilir.
 * `ssr: false` ile sunucu çıktısına hiç girmez; ilk boyamayı engellemez.
 */
const InkSurface = dynamic(
  () => import('@/components/animations/ink-surface').then((module) => module.InkSurface),
  { ssr: false },
);

/**
 * Hero'nun arka plan katmanını yönetir.
 *
 * Yükleme sırası:
 *   1. Statik SVG (children) sunucudan gelir, ilk boyamada hazırdır.
 *   2. Tarayıcı boşa çıkınca (requestIdleCallback) ve hero görünür olmuşsa
 *      canvas indirilip monte edilir.
 *   3. Canvas ilk karesini çizdiğini bildirince (onReady) SVG sönümlenir.
 *
 * Canvas bir kez monte edildikten sonra sökülmez — WebGL bağlamını yeniden
 * kurmak pahalıdır. Hero ekrandan çıktığında veya sekme arkaya atıldığında
 * yalnızca render döngüsü durur (`frameloop="never"`).
 *
 * Hareket azaltma açıkken canvas HİÇ indirilmez; statik görsel kalıcıdır.
 * WebGL kullanılamıyorsa `onReady` hiç çağrılmaz, yani SVG görünür kalır —
 * bozulma değil, kademeli geri düşüş.
 */
export function HeroBackdrop({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouch();
  const documentVisible = useDocumentVisibility();
  const isCompact = !useMediaQuery('(min-width: 768px)');

  // `once: true` → bir kez göründü mü? Monte etme kararı buna bakar.
  const hasBeenInView = useInView(containerRef, { once: true, amount: 0.05 });
  // Anlık görünürlük → render döngüsünü aç/kapat.
  const isInView = useInView(containerRef, { amount: 0.05 });

  const [browserIdle, setBrowserIdle] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  // Boşa çıkma anını bekle: ilk boyama ve hidrasyon canvas yüzünden gecikmesin.
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(() => setBrowserIdle(true), { timeout: 1200 });
      return () => window.cancelIdleCallback(handle);
    }

    const timer = window.setTimeout(() => setBrowserIdle(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const handleReady = useCallback(() => {
    // Bir kare daha bekle: onCreated renderer kurulduğunda çalışır,
    // ilk çizimin ekrana düştüğünden emin olmak için.
    requestAnimationFrame(() => setCanvasReady(true));
  }, []);

  const shouldMount = !reducedMotion && browserIdle && hasBeenInView;
  // Canvas hazır olduktan sonra hareket azaltma açılırsa canvas sökülür;
  // statik katman o an geri gelmeli, `canvasReady` tek başına yetmez.
  const canvasVisible = shouldMount && canvasReady;

  return (
    <div ref={containerRef} aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Statik katman: canvas hazır olana kadar görünür, sonra sönümlenir. */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-entrance)]',
          canvasVisible ? 'opacity-0' : 'opacity-100',
        )}
      >
        {children}
      </div>

      {shouldMount && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-entrance)]',
            canvasVisible ? 'opacity-100' : 'opacity-0',
          )}
        >
          <InkSurface
            variant="hero"
            active={isInView && documentVisible}
            compact={isCompact}
            pointerEnabled={!isTouch}
            onReady={handleReady}
          />
        </div>
      )}
    </div>
  );
}
