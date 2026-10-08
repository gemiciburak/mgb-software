'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Sayfa belirtilen eşiği geçti mi?
 *
 * Scroll pozisyonu harici bir durum olduğu için `useSyncExternalStore`
 * kullanılıyor: dinleyici her scroll olayında çalışsa da React yalnızca
 * boolean değiştiğinde yeniden render eder. Effect içinde setState yok,
 * zincirleme render yok.
 */
export function useScrolled(threshold = 64): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener('scroll', onStoreChange, { passive: true });
    return () => window.removeEventListener('scroll', onStoreChange);
  }, []);

  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
