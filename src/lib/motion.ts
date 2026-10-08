/**
 * Hareket sabitleri. CSS tarafındaki karşılıkları styles/tokens.css içindedir;
 * iki yerde farklı değer olmaması için buradaki süreler ms cinsinden aynıdır.
 */

export const DURATION = {
  instant: 0.12,
  fast: 0.2,
  base: 0.32,
  slow: 0.52,
} as const;

/** Girişler ve reveal'lar için — yumuşak yavaşlama. */
export const EASE_ENTRANCE = [0.22, 1, 0.36, 1] as const;

/** Karşılıklı geçişler için — simetrik hızlanma/yavaşlama. */
export const EASE_TRANSITION = [0.76, 0, 0.24, 1] as const;
