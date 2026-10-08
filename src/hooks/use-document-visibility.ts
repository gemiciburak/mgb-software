'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Sekme görünür mü?
 *
 * Hero canvas'ı sekme arkaya atıldığında render döngüsünü durdurur —
 * pil ve CPU boşa harcanmaz. Görünürlük harici bir durum olduğu için
 * `useSyncExternalStore` ile okunur.
 */
export function useDocumentVisibility(): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    document.addEventListener('visibilitychange', onStoreChange);
    return () => document.removeEventListener('visibilitychange', onStoreChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => document.visibilityState === 'visible',
    () => true,
  );
}
