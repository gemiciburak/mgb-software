'use client';

import { useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';

const subscribeNothing = () => () => {};
const currentYear = () => new Date().getFullYear();

/**
 * Telif satırı.
 *
 * Sayfalar build sırasında statik üretildiği için sunucudaki yıl build anında
 * donuyordu: yeniden deploy edilmezse 2027'de de "© 2026" yazardı. Sunucu
 * HTML'i build yılıyla gelir (`buildYear`), hidrasyonda ziyaretçinin saatine
 * göre güncel yıla geçer — `useSyncExternalStore` sunucu değeriyle başladığı
 * için hidrasyon uyuşmazlığı oluşmaz.
 */
export function Copyright({ buildYear }: { buildYear: number }) {
  const t = useTranslations('footer');
  const year = useSyncExternalStore(subscribeNothing, currentYear, () => buildYear);

  return <span>{t('copyright', { year })}</span>;
}
