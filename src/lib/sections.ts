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
 * Sayfada dokuz bölüm var, navigasyonda dört başlık. Aradaki bölümleri
 * sahipsiz bırakırsak konum göstergesi sayfanın yarısı boyunca bir önceki
 * başlıkta takılı kalır — ki ilk sürümde tam olarak bu oluyordu.
 *
 * Sahiplik anlamca kurulur, sayfadaki sıraya göre değil: Süreç, Teknoloji ve
 * Neden MGB stüdyonun kendisini anlatır, yani "Hakkımızda"ya aittir. Bu yüzden
 * gösterge İşler'den sonra Hakkımızda'ya geri döner. Geri dönmesi doğrudur:
 * navigasyon bir ilerleme çubuğu değil, bir içindekiler listesi — gösterge
 * "ne kadar ilerledin"i değil, "okuduğun şey hangi başlığın altında"yı söyler.
 * Hakkımızda sayfası yayına alınınca bu bölümler oraya taşınacak.
 */
export const SECTION_NAV_OWNER: Record<SectionId, SectionId | null> = {
  [SECTION_ID.hero]: null,
  [SECTION_ID.about]: SECTION_ID.about,
  [SECTION_ID.services]: SECTION_ID.services,
  [SECTION_ID.build]: SECTION_ID.services,
  [SECTION_ID.work]: SECTION_ID.work,
  [SECTION_ID.process]: SECTION_ID.about,
  [SECTION_ID.technology]: SECTION_ID.about,
  [SECTION_ID.why]: SECTION_ID.about,
  [SECTION_ID.contact]: SECTION_ID.contact,
};

/**
 * Navigasyon öğeleri — brief'teki sıra: İşler, Hizmetler, Hakkımızda, İletişim.
 *
 * Varsayılan hedef ana sayfadaki bölüm çapası. Öğenin kendi sayfası
 * (`NAV_PAGES`) yayına alındığında link kendiliğinden o sayfaya döner —
 * bkz. `navHref`.
 */
export const NAV_ITEMS = [
  { id: SECTION_ID.work, labelKey: 'work' },
  { id: SECTION_ID.services, labelKey: 'services' },
  { id: SECTION_ID.about, labelKey: 'about' },
  { id: SECTION_ID.contact, labelKey: 'contact' },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

/**
 * Kendi sayfası olan navigasyon öğeleri. İletişim bilinçli olarak yok:
 * menüdeki "İletişim" sayfanın sonundaki çağrıya iner, form sayfasına
 * birincil düğme götürür.
 */
const NAV_PAGES: Partial<Record<SectionId, AppPathname>> = {
  [SECTION_ID.about]: '/about',
  [SECTION_ID.services]: '/services',
  [SECTION_ID.work]: '/work',
};

/**
 * Navigasyon öğesinin hedefi: sayfası yayındaysa o sayfa, değilse ana
 * sayfadaki bölüm çapası. Yayında olmayan sayfaya link verilmez.
 */
export function navHref(locale: Locale, id: SectionId): string {
  const page = NAV_PAGES[id];
  return page && isPublished(page) ? getPathname({ href: page, locale }) : sectionHref(locale, id);
}

/** Bulunulan sayfa bir navigasyon öğesinin sayfasıysa o öğe; değilse null. */
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
