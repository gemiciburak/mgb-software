'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { SECTION_NAV_OWNER, SECTION_ORDER, type SectionId } from '@/lib/sections';

/** Bir bölümün "girildi" sayılması için üstünün geçmesi gereken çizgi. */
const LINE_RATIO = 0.4;

/**
 * Şu an bulunulan bölüm.
 *
 * Kural tek cümle: **üstü çizgiyi en son geçen bölüm aktiftir.** Çizgi ekranın
 * %40'ında; bir bölüm oraya ulaştığında artık "içindesiniz" demektir.
 *
 * İlk sürüm IntersectionObserver'ı ekranın ortasında ince bir şeride daraltıp
 * "şeridi kesen bölüm aktiftir" diyordu. İki bölümün sınırı şeritten geçerken
 * ikisi birden kesişiyor ve hangisinin seçileceği gözlemcinin verdiği sıraya
 * kalıyordu — gösterge yanlış linke atlıyordu. Buradaki karşılaştırma ise
 * belirsizlik bırakmaz: `top <= çizgi` olanlar arasında en büyük `top`, yani
 * çizgiyi en son geçen.
 *
 * Bölümlerin hepsi izlenir, yalnızca navigasyonda karşılığı olan dördü
 * değil. Bulunan bölüm `SECTION_NAV_OWNER` üzerinden sahibine çevrilir; yoksa
 * gösterge sayfanın yarısı boyunca bir önceki başlıkta takılı kalırdı.
 *
 * Sayfanın en üstünde hiçbir bölümün üstü çizgiyi geçmemiştir; `null` döner ve
 * gösterge hiç çizilmez.
 *
 * `useSyncExternalStore`: dinleyici her scroll olayında çalışır ama React
 * yalnızca sonuç değiştiğinde yeniden render eder — `useScrolled` ile aynı
 * desen, effect içinde setState yok.
 */
export function useActiveSection(): SectionId | null {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener('scroll', onStoreChange, { passive: true });
    window.addEventListener('resize', onStoreChange, { passive: true });
    return () => {
      window.removeEventListener('scroll', onStoreChange);
      window.removeEventListener('resize', onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    const line = window.innerHeight * LINE_RATIO;
    let current: SectionId | null = null;
    let latest = Number.NEGATIVE_INFINITY;

    for (const id of SECTION_ORDER) {
      const element = document.getElementById(id);
      if (!element) continue;

      const { top } = element.getBoundingClientRect();
      if (top <= line && top > latest) {
        latest = top;
        current = SECTION_NAV_OWNER[id];
      }
    }

    return current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
