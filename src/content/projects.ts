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
export const projects: readonly Project[] = [
  {
    // Hayali bir mimarlık stüdyosu için konsept site. Fotoğraflar Unsplash'ten,
    // binalar başkalarının işi — Daphne sitesinde her proje sayfasında atıf var.
    // Kapak, sitenin ana sayfasından alınmış ekran görüntüsü.
    id: 'daphne',
    slug: 'daphne',
    title: { tr: 'Daphne Atelier', en: 'Daphne Atelier' },
    summary: {
      tr: 'Hayali bir mimarlık ve iç mimarlık stüdyosu için sinematik portfolyo sitesi.',
      en: 'A cinematic portfolio site for a fictional architecture and interiors studio.',
    },
    services: ['web-development', 'ui-ux-design'],
    year: 2026,
    concept: true,
    cover: {
      url: '/work/daphne.webp',
      alt: {
        tr: 'Daphne Atelier ana sayfası: brüt beton bir avlunun üzerinde “Architecture Beyond Form.” başlığı.',
        en: 'Daphne Atelier home page: the headline “Architecture Beyond Form.” over a board-formed concrete courtyard.',
      },
      width: 960,
      height: 720,
      // Kare kartta başlığın tamamı kalsın diye sola yakın kırpılır.
      focus: '30% 50%',
    },
    liveUrl: 'https://daphne-atelier.vercel.app',
  },
];
