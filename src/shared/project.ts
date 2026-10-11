import type { LocalizedText } from './locale';
import type { ServiceSlug } from './service';

export interface ProjectImage {
  /** Tam URL veya site köküne göreli yol. */
  url: string;
  /** Erişilebilirlik için zorunlu — boş alt metni olan proje görseli kabul edilmez. */
  alt: LocalizedText;
  width: number;
  height: number;
  /**
   * Kare kartta kırpılırken görselin hangi kısmı kalsın (CSS
   * `object-position`, örn. '30% 50%'). Verilmezse ortası.
   */
  focus?: string;
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
  /**
   * Gerçek bir müşteri için değil, stüdyonun kendi yaptığı konsept iş.
   * Künyede her zaman "Konsept" olarak yazılır — müşteri işi gibi sunulmaz.
   */
  concept?: boolean;
  cover?: ProjectImage;
  /** Yayındaki projenin adresi, varsa. */
  liveUrl?: string;
}
