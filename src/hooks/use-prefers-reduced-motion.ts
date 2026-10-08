'use client';

import { useMediaQuery } from './use-media-query';

/**
 * Kullanıcı hareketin azaltılmasını istiyor mu?
 *
 * `true` döndüğünde bileşenler animasyonu yavaşlatmaz — yapısal olarak
 * atlar: hero canvas'ı hiç monte edilmez, sticky timeline düz listeye döner,
 * marquee durur. Sunucuda `false` döner, yani ilk boyama hareketli varyantla
 * yapılır ve hidrasyonda tek adımda sadeleşir.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
