'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Bir medya sorgusunu React durumu olarak okur.
 *
 * `useSyncExternalStore` kullanılır: sunucuda `false` döner, hidrasyonda
 * gerçek değere tek adımda geçer — ara bir kare yanlış değerle boyanmaz.
 * Bileşenler doğrudan `matchMedia` çağırmaz, hareketle ilgili her karar
 * bu hook'tan geçer.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', onStoreChange);
      return () => mediaQueryList.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
