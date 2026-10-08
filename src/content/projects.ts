import type { Project } from '@/shared';

/**
 * Seçilmiş işler — sitenin proje kaynağı.
 *
 * Veritabanı yok: projeler diğer içerik gibi burada, tip güvenli olarak durur.
 * Yeni proje eklemek bu diziye bir nesne eklemektir; kapak görseli
 * `public/work/` altına konur ve `cover.url` oradan verilir (`/work/x.webp`).
 * Uydurma proje eklenmez — dizi boşken ana sayfa bilinçli bekleme durumunu
 * gösterir.
 *
 * Örnek:
 *   {
 *     id: 'ornek-proje',
 *     slug: 'ornek-proje',
 *     title: { tr: 'Örnek Proje', en: 'Sample Project' },
 *     summary: { tr: '…', en: '…' },
 *     services: ['web-development', 'ui-ux-design'],
 *     year: 2026,
 *     cover: { url: '/work/ornek.webp', alt: { tr: '…', en: '…' }, width: 1600, height: 1200 },
 *     liveUrl: 'https://…',
 *   }
 */
export const projects: readonly Project[] = [];
