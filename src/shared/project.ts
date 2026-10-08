import type { LocalizedText } from './locale';
import type { ServiceSlug } from './service';

export interface ProjectImage {
  /** Tam URL veya site köküne göreli yol. */
  url: string;
  /** Erişilebilirlik için zorunlu — boş alt metni olan proje görseli kabul edilmez. */
  alt: LocalizedText;
  width: number;
  height: number;
}

export interface Project {
  id: string;
  /** URL'de kullanılan sabit kimlik; dile göre değişmez. */
  slug: string;
  title: LocalizedText;
  /** Kart üzerindeki tek cümlelik özet. */
  summary: LocalizedText;
  /** Projede verilen hizmetler — ana sayfadaki filtreleme buradan beslenir. */
  services: ServiceSlug[];
  year: number;
  cover?: ProjectImage;
  /** Yayındaki projenin adresi, varsa. */
  liveUrl?: string;
}
