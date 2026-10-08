/**
 * ===========================================================================
 * MGB harf formları — modüler ızgarada çizilmiş, tipografiden alınmamış
 * ---------------------------------------------------------------------------
 * Üç harf de aynı modülü paylaşır: 12 birim yükseklik, 2.4 birim kontur,
 * 9 birim genişlik, 2.2 birim harf arası. Bir tipografiyi "MGB" yazıp
 * kullanmak yerine harfleri aynı birkaç geometrik parçadan (dikey, yatay,
 * köşegen) kurmak, markaya çizilmiş bir işaret kazandırıyor — teknik çizim
 * diliyle de tutarlı.
 *
 * Kararlar:
 *   • M'nin tepesi sivri değil, kontur genişliğinde düz kesik — diğer tüm
 *     uçlar gibi.
 *   • B'nin orta yatayı merkezden yukarı kaydırıldı (üst göz kısa, alt göz
 *     uzun). Eşit gözlerde harf 16–20px'te "8" gibi okunuyordu.
 *   • Yollar ızgara biriminde; ölçek `viewBox` ile verilir, böylece kontur
 *     kalınlığı her boyutta harfle orantılı kalır.
 * =========================================================================== */

/** Izgara birimi cinsinden ölçüler. */
export const LOGO_GRID = {
  height: 12,
  letterWidth: 9,
  gap: 2.2,
  stroke: 2.4,
} as const;

/** Kilidin tam genişliği: 3 harf + 2 boşluk. */
export const LOGO_WIDTH = LOGO_GRID.letterWidth * 3 + LOGO_GRID.gap * 2;

/** Tek başına M — uygulama ikonlarında ve favicon'da kullanılır. */
export const LETTER_M_PATH =
  'M0 12 2.4 12 2.4 0 0 0ZM6.6 12 9 12 9 0 6.6 0ZM0 0 2.4 0 5.7 9.4 3.3 9.4ZM6.6 0 9 0 5.7 9.4 3.3 9.4Z';

/** Üç harfin birlikte kilidi. viewBox: `0 0 31.4 12`. */
export const LOGO_MGB_PATH =
  'M0 12 2.4 12 2.4 0 0 0ZM6.6 12 9 12 9 0 6.6 0ZM0 0 2.4 0 5.7 9.4 3.3 9.4ZM6.6 0 9 0 5.7 9.4 3.3 9.4Z' +
  'M11.2 12 13.6 12 13.6 0 11.2 0ZM11.2 2.4 20.2 2.4 20.2 0 11.2 0ZM11.2 12 20.2 12 20.2 9.6 11.2 9.6ZM17.8 12 20.2 12 20.2 5.4 17.8 5.4ZM14.9 7.8 17.8 7.8 17.8 5.4 14.9 5.4Z' +
  'M22.4 12 24.8 12 24.8 0 22.4 0ZM22.4 2.4 31.4 2.4 31.4 0 22.4 0ZM22.4 6.4 31.4 6.4 31.4 4 22.4 4ZM22.4 12 31.4 12 31.4 9.6 22.4 9.6ZM29 4 31.4 4 31.4 2.4 29 2.4ZM29 9.6 31.4 9.6 31.4 6.4 29 6.4Z';
