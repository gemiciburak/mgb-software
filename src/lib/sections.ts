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
  services: 'services',
  work: 'work',
  about: 'about',
  process: 'process',
  faq: 'faq',
  contact: 'contact',
} as const;

export type SectionId = (typeof SECTION_ID)[keyof typeof SECTION_ID];

/** Bölümler sayfadaki sırayla — `SECTION_ID` zaten o sırada tanımlı (bkz. app/[locale]/page.tsx). */
export const SECTION_ORDER = Object.values(SECTION_ID) as readonly SectionId[];

/**
 * Her bölümün navigasyondaki sahibi.
 *
 * Sayfada yedi bölüm var, navigasyonda dört başlık. Bir bölüm yalnızca
 * gerçekten o başlığın içeriğiyse sahiplenilir: her başlığın altında yalnızca
 * kendi bölümü var — Hakkımızda'nın altında stüdyo + kurucu kartı, İletişim'in
 * altında kapanış bölümü.
 *
 * Süreç ve SSS sahipsizdir (`null`): gösterge oradayken hiçbir
 * başlığı işaretlemez. Yanlış başlığı işaretlemektense hiçbirini
 * işaretlememek doğru.
 */
export const SECTION_NAV_OWNER: Record<SectionId, SectionId | null> = {
  [SECTION_ID.hero]: null,
  [SECTION_ID.services]: SECTION_ID.services,
  [SECTION_ID.work]: SECTION_ID.work,
  [SECTION_ID.about]: SECTION_ID.about,
  [SECTION_ID.process]: null,
  [SECTION_ID.faq]: null,
  [SECTION_ID.contact]: SECTION_ID.contact,
};

/**
 * Navigasyon öğeleri — sayfadaki sırayla: Hizmetler, İşler, Hakkımızda,
 * İletişim. Sıra sayfayla aynı olunca kaydırırken gösterge soldan sağa
 * ilerler; geri sıçramaz.
 *
 * Kural: menü ana sayfanın haritasıdır; her öğe ana sayfadaki bölümüne
 * kaydırır. Ayrı sayfa olarak yalnızca teklif formu var (sağdaki
 * "Teklif Al" düğmesi). Hakkımızda bir dönem ayrı sayfaydı; menüde tek
 * öğenin farklı davranması tutarsız durduğu için içeriği ana sayfaya taşındı.
 *
 * `navHref` ileriye dönük: hizmet veya iş sayfaları yayına alınırsa
 * `NAV_PAGES` üzerinden menü kendiliğinden onlara döner.
 *
 * İletişim ile Teklif Al aynı şey değil:
 *   • Teklif Al → yeni proje için yapılandırılmış form (`/teklif-al`).
 *   • İletişim → kapanış bölümü; orada form ile doğrudan kanallar (e-posta,
 *     sosyal hesaplar) yan yana ve ayrı ayrı anlatılır — soru, iş birliği
 *     ya da proje dışı bir konu için forma girmek gerekmez.
 */
export const NAV_ITEMS = [
  { id: SECTION_ID.services, labelKey: 'services' },
  { id: SECTION_ID.work, labelKey: 'work' },
  { id: SECTION_ID.about, labelKey: 'about' },
  { id: SECTION_ID.contact, labelKey: 'contact' },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

/** Kendi sayfası olan menü öğeleri. Yayında olmayan sayfaya link verilmez. */
const NAV_PAGES: Partial<Record<SectionId, AppPathname>> = {
  [SECTION_ID.services]: '/services',
  [SECTION_ID.work]: '/work',
};

/** Menü öğesinin hedefi: sayfası yayındaysa o sayfa, değilse bölüm çapası. */
export function navHref(locale: Locale, id: SectionId): string {
  const page = NAV_PAGES[id];
  return page && isPublished(page) ? getPathname({ href: page, locale }) : sectionHref(locale, id);
}

/** Bulunulan sayfa bir menü öğesinin sayfasıysa o öğe; değilse null. */
export function navItemForPathname(pathname: string): SectionId | null {
  for (const [id, page] of Object.entries(NAV_PAGES)) {
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
