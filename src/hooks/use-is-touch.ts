'use client';

import { useMediaQuery } from './use-media-query';

/**
 * Hassas işaretleyici (fare/trackpad) YOK mu?
 *
 * Özel imleç, manyetik buton ve hover'a bağlı efektler yalnızca
 * `pointer: fine` olduğunda çalışır. Sunucuda `pointer: fine` sorgusu
 * `false` döndüğü için bu hook `true` başlar — yani efektler varsayılan
 * olarak KAPALI başlar ve ancak fare doğrulanınca açılır. Güvenli yön bu.
 */
export function useIsTouch(): boolean {
  return !useMediaQuery('(pointer: fine)');
}
