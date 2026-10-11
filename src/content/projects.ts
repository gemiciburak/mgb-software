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
  {
    // Hayali bir restoran için uçtan uca sipariş platformu (NestJS + Next.js).
    // Yemek fotoğrafları Unsplash'ten; sitedeki puan ve müşteri sayıları demo
    // verisi. Kapak, sitenin ana sayfasından alınmış ekran görüntüsü.
    id: 'pierre-kitchen',
    slug: 'pierre-kitchen',
    title: { tr: 'Pierre Kitchen', en: 'Pierre Kitchen' },
    summary: {
      tr: 'Hayali bir restoran için menü, sepet, canlı sipariş takibi ve yönetim paneli olan sipariş platformu.',
      en: 'An ordering platform for a fictional restaurant, with menu, cart, live order tracking and an admin panel.',
    },
    services: ['web-development', 'software-backend', 'e-commerce'],
    year: 2026,
    concept: true,
    cover: {
      url: '/work/pierre.webp',
      alt: {
        tr: 'Pierre Kitchen ana sayfası: “Canın ne çekiyorsa, kapına gelsin” başlığının yanında bir tabak dilimlenmiş biftek.',
        en: 'Pierre Kitchen home page: the headline “Canın ne çekiyorsa, kapına gelsin” beside a plate of sliced steak.',
      },
      width: 960,
      height: 720,
      // Kare kartta başlık ve yemek fotoğrafı birlikte kalsın diye sola yakın kırpılır.
      focus: '15% 50%',
    },
    liveUrl: 'https://pierre.burakgemici.com.tr',
  },
  {
    // Gerçek bir çift için dijital düğün davetiyesi; bağlantı çiftin onayıyla
    // paylaşılıyor. Çizimler ve monogram çiftin gönderdiği PDF'lerden. Kapak,
    // davetiyenin açılış ekranından alınmış ekran görüntüsü.
    id: 'gizem-ahmet',
    slug: 'gizem-ahmet',
    title: { tr: 'Gizem & Ahmet', en: 'Gizem & Ahmet' },
    summary: {
      tr: 'Damgaya dokununca açılan, geri sayımlı, yol tarifi ve takvim kaydı olan dijital düğün davetiyesi.',
      en: 'A digital wedding invitation that opens at a tap on its seal, with a countdown, directions and a calendar entry.',
    },
    services: ['web-development'],
    year: 2026,
    cover: {
      url: '/work/gizem-ahmet.webp',
      alt: {
        tr: 'Gizem & Ahmet davetiyesinin kapağı: üstte ve altta çiçek bantları, ortada yeşil çerçeveli G ve A monogramı.',
        en: 'Cover of the Gizem & Ahmet invitation: floral bands above and below, a green-framed G and A monogram in the middle.',
      },
      width: 960,
      height: 720,
    },
    liveUrl: 'https://gizemveahmet.vercel.app',
  },
];
