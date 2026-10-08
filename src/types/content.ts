import type { ServiceSlug } from '@/shared';

import type { TechSlug } from '@/lib/tech-marks';

/**
 * İçerik dosyalarının (content/tr, content/en) paylaştığı şekiller.
 * Her iki dilin aynı anahtarları taşıdığı tip düzeyinde garanti edilir —
 * bir dilde eksik alan derleme hatası olur.
 */

export interface PageMeta {
  title: string;
  description: string;
}

export interface MetaContent {
  /** OG görselinde ve arama sonuçlarında kullanılan kısa marka cümlesi. */
  tagline: string;
  home: PageMeta;
}

export interface HeroContent {
  /** Mono etiket. İçerik dosyasında ZATEN büyük harfle yazılır — bkz. aşağıdaki not. */
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Alt kenardaki mono satır: hizmet eksenini tek satırda özetler. */
  axis: string;
}

export interface PhilosophyContent {
  eyebrow: string;
  title: string;
  body: readonly string[];
  /** Mürekkep küplerinin altındaki teknik çizim etiketi. */
  caption: string;
}

export interface ServiceEntry {
  /** src/shared'daki birleşimle eşleşir; numara sıradan türetilir. */
  slug: ServiceSlug;
  title: string;
  /** Hover/açılır panelde görünen tek paragraf. */
  summary: string;
  /** Üç-dört kısa çıktı. Liste değil, kapsamın sınırı. */
  deliverables: readonly string[];
}

export interface SectionIntro {
  eyebrow: string;
  title: string;
  /** İsteğe bağlı tek cümlelik açıklama. */
  description?: string;
}

export interface ProcessStep {
  title: string;
  description: string;
  /** Adımın sonunda elinize ne geçiyor. */
  deliverable: string;
}

export interface TechEntry {
  /** Marka işaretini seçer (lib/tech-marks.ts). */
  slug: TechSlug;
  /** Marka adı — çevrilmez. */
  name: string;
  /** Tek kelimelik rol — çevrilir. */
  role: string;
}

/** Dört değerin sabit kimlikleri; izometrik çizimler bunlara bağlı. */
export type ValueSlug = 'direct' | 'transparent' | 'tailored' | 'quality';

export interface ValueEntry {
  slug: ValueSlug;
  title: string;
  description: string;
}

export interface WorkContent extends SectionIntro {
  /** Boş durum metni. Sahte proje yerine dürüst bir cümle. */
  body: string;
  /** Mono durum göstergesi. */
  status: string;
}

export interface CtaContent {
  title: string;
  description: string;
}

export interface HomeContent {
  philosophy: PhilosophyContent;
  /** Hakkımızda bölümünün ikinci yarısı — kurucu kartı. */
  founder: FounderContent;
  services: SectionIntro & { entries: readonly ServiceEntry[] };
  build: SectionIntro & { entries: readonly string[] };
  work: WorkContent;
  process: SectionIntro & { steps: readonly ProcessStep[] };
  technology: SectionIntro & { entries: readonly TechEntry[] };
  values: SectionIntro & { entries: readonly ValueEntry[] };
  cta: CtaContent;
}

/** Yasal metin bloğu: paragraf ya da madde listesi. */
export type LegalBlock = { type: 'p'; text: string } | { type: 'list'; items: readonly string[] };

export interface LegalDocument {
  title: string;
  /** ISO tarih (YYYY-AA-GG); ekranda dile göre biçimlenir. */
  updated: string;
  intro: string;
  sections: readonly { heading: string; blocks: readonly LegalBlock[] }[];
  /** İsteğe bağlı kapanış notu (ör. çeviri önceliği). */
  note?: string;
}

export interface FounderContent {
  eyebrow: string;
  name: string;
  /** Unvan — iki dilde de İngilizce kalabilir, kartvizitteki gibi. */
  role: string;
  /** Birinci ağızdan, kısa. Kurumsal metnin "biz"inden bilinçli olarak ayrılır. */
  bio: readonly string[];
  /**
   * İsteğe bağlı portre. `public/` altına konur (ör. `/founder.jpg`).
   * Yokken yerinde baş harfler görünür — sahte/stok fotoğraf kullanılmaz.
   */
  photo?: { src: string; width: number; height: number; alt: string };
  /** Kurucuya doğrudan ulaşma cümlesi; e-posta linkinin üstünde durur. */
  contactLine: string;
}

export interface LocaleContent {
  meta: MetaContent;
  hero: HeroContent;
  home: HomeContent;
  kvkk: LegalDocument;
}
