import type { Locale, Project } from '@/shared';
import { projects } from '@/content/projects';

/**
 * Proje (Selected Work) verisi.
 *
 * Kaynak `content/projects.ts`. Ana sayfa veriyi doğrudan dosyadan değil bu
 * fonksiyondan alır: ileride projeler bir içerik yönetim sistemine (Sanity,
 * Payload vb.) taşınırsa yalnızca bu fonksiyonun gövdesi değişir, çağıran
 * taraf ve `SelectedWork` bileşeni aynı kalır.
 *
 * `locale` bugün kullanılmıyor (metinler `LocalizedText` olarak iki dili de
 * taşıyor); dile göre içerik dönen bir kaynağa geçişte imza değişmesin diye
 * duruyor.
 */
export async function fetchPublishedProjects(_locale: Locale): Promise<Project[]> {
  return [...projects];
}
