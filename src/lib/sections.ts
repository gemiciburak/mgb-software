import type { AppPathname, Locale } from '@/shared';
import { getPathname } from '@/i18n/navigation';
import { isPublished } from './constants';

/**
 * Ana sayfa bölüm kimlikleri.
 *
 * Çapa linkleri ve bölümlerin `id`'leri tek kaynaktan gelir ki navigasyon ile
 * bölümler asla kaymasın. Kimlikler bilinçli olarak İngilizce ve dilden
 * bağımsız: `/#services` her iki dilde aynı çalışır, dil değişince çapa kırılmaz.
 */
export const SECTION_ID = {
  hero: 'hero',
  about: 'about',
  services: 'services',
  build: 'build',
  work: 'work',
  process: 'process',
  technology: 'technology',
  why: 'why',
  contact: 'contact',
} as const;

export type SectionId = (typeof SECTION_ID)[keyof typeof SECTION_ID];

/** Bölümler sayfadaki sırayla — `SECTION_ID` zaten o sırada tanımlı. */
export const SECTION_ORDER = Object.values(SECTION_ID) as readonly SectionId[];

/**
 * Her bölümün navigasyondaki sahibi.
 *
 * Sayfada dokuz bölüm var, navigasyonda dört başlık. Bir bölüm yalnızca
 * gerçekten o başlığın içeriğiyse sahiplenilir: Hizmetler'in altında
 * "Ürettiklerimiz", İşler'in altında yalnızca İşler, Hakkımızda'nın altında
 * yalnızca Yaklaşım (Hakkımızda sayfasına giden link orada), İletişim'in
 * altında kapanış bölümü.
 *
 * Süreç, Teknoloji ve Neden MGB sahipsizdir (`null`): gösterge
 * oradayken hiçbir başlığı işaretlemez. Önceki sürümde bu üçü Hakkımızda'ya
 * bağlıydı; bölümler İşler'in iki yanına dağıldığı için gösterge kaydırırken
 * sürekli Hakkımızda'ya geri dönüyordu. Yanlış başlığı işaretlemektense
 * hiçbirini işaretlememek doğru.
 */
export const SECTION_NAV_OWNER: Record<SectionId, SectionId | null> = {
  [SECTION_ID.hero]: null,
  [SECTION_ID.about]: SECTION_ID.about,
  [SECTION_ID.services]: SECTION_ID.services,
  [SECTION_ID.build]: SECTION_ID.services,
  [SECTION_ID.work]: SECTION_ID.work,
  [SECTION_ID.process]: null,
  [SECTION_ID.technology]: null,
  [SECTION_ID.why]: null,
  [SECTION_ID.contact]: SECTION_ID.contact,
};

/**
 * Navigasyon öğeleri: İşler, Hizmetler, Hakkımızda, İletişim.
 *
 * Tek kural — **menü ana sayfanın haritasıdır.** Her öğe ana sayfadaki bir
 * bölüme kaydırır; ayrıntılı sayfalar o bölümün İÇİNDEN açılır (ör. Yaklaşım
 * bölümündeki "MGB Software'i tanıyın →" Hakkımızda sayfasına gider). Hizmet
 * ve iş sayfaları geldiğinde de aynı desen: menü değişmez, bölüme link eklenir.
 *
 * İletişim ile Proje Başlat aynı şey değil:
 *   • Proje Başlat → yeni proje için yapılandırılmış form (`/start`).
 *   • İletişim → kapanış bölümü; orada form ile doğrudan kanallar (e-posta,
 *     sosyal hesaplar) yan yana ve ayrı ayrı anlatılır — soru, iş birliği
 *     ya da proje dışı bir konu için forma girmek gerekmez.
 */
export const NAV_ITEMS = [
  { id: SECTION_ID.work, labelKey: 'work' },
  { id: SECTION_ID.services, labelKey: 'services' },
  { id: SECTION_ID.about, labelKey: 'about' },
  { id: SECTION_ID.contact, labelKey: 'contact' },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

/**
 * Bir bölümün derinleştiği alt sayfalar. O sayfadayken menüde bölümün
 * başlığı işaretli kalır — bir içindekiler listesinde bulunulan bölüm gibi.
 * Link yine ana sayfadaki bölüme gider; alt sayfa bölümün içinden açılır.
 */
const SECTION_PAGES: Partial<Record<SectionId, AppPathname>> = {
  [SECTION_ID.about]: '/about',
};

/** Bulunulan sayfa bir bölümün alt sayfasıysa o bölüm; değilse null. */
export function navItemForPathname(pathname: string): SectionId | null {
  for (const [id, page] of Object.entries(SECTION_PAGES)) {
    if (page === pathname && isPublished(page)) return id as SectionId;
  }
  return null;
}

/**
 * Bir bölümün mutlak çapası: `/#services`, `/en#services`.
 *
 * Yalın `#services` yalnızca ana sayfada çalışır; navigasyon ve footer 404
 * sayfasında da render edildiği için orada boşa düşüyordu. Ana sayfadayken
 * tarayıcı bunu aynı belge içinde kaydırma olarak işler — yeniden yükleme yok.
 */
export function sectionHref(locale: Locale, id: SectionId): string {
  return `${getPathname({ href: '/', locale })}#${id}`;
}
