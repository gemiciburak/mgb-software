import type { HeroContent } from '@/types/content';

/**
 * NOT — Türkçe büyük harf kuralı:
 * `text-transform: uppercase` Türkçe "i" harfini İ değil I yapar
 * ("İletişim" → "ILETIŞIM"). Bu yüzden mono etiketler burada ZATEN büyük
 * harfle yazılır ve dönüştürme CSS'e bırakılmaz.
 */
export const hero: HeroContent = {
  eyebrow: 'DİJİTAL TEKNOLOJİ STÜDYOSU',
  title: 'Dijital deneyimler tasarlıyor ve inşa ediyoruz.',
  subtitle: 'Fikirden arayüze, altyapıdan yayına. Tasarım, yazılım ve mühendislik tek elden yürür.',
  axis: 'TASARIM / YAZILIM / MÜHENDİSLİK',
};
