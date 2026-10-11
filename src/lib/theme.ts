/**
 * Tema altyapısı — kütüphanesiz.
 *
 * Gereken üç davranış: (1) varsayılan olarak sistem tercihini izle,
 * (2) kullanıcının seçimini hatırla, (3) sayfa yüklenirken flash olmasın.
 * Bunun için ~60 satır yeterli olduğu ve `data-theme` ile `color-scheme`
 * üzerinde tam kontrol gerektiği için next-themes eklenmedi.
 *
 * Mimari karar: tek doğruluk kaynağı React state'i DEĞİL, `<html>` üzerindeki
 * `data-theme-choice` attribute'u. Inline script onu boyamadan önce yazıyor;
 * React bunu `useSyncExternalStore` ile okuyor. Bu sayede ne provider'a ne de
 * effect içinde setState'e gerek kalıyor — zincirleme render oluşmuyor.
 */

export const THEME_STORAGE_KEY = 'mgb-theme';

/** Tema değişince pencere üzerinde yayınlanan olay — abonelerin tetikleyicisi. */
export const THEME_EVENT = 'mgb:themechange';

/** Kullanıcının seçimi — 'system' işletim sistemini izlemek anlamına gelir. */
export type ThemeChoice = 'system' | 'light' | 'dark';

/** Ekranda gerçekten uygulanan tema. */
export type ResolvedTheme = 'light' | 'dark';

/** Tema düğmesinin döngü sırası. */
export const THEME_CYCLE: readonly ThemeChoice[] = ['system', 'light', 'dark'];

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === 'system' || value === 'light' || value === 'dark';
}

/**
 * `<html>` attribute'larını ve kalıcı seçimi güncelleyen tek yer.
 *
 * `persist: false` yalnızca başka bir sekmeden gelen değişikliği yansıtırken
 * kullanılır — aksi halde localStorage'a geri yazıp döngü oluşurdu.
 */
export function applyThemeChoice(next: ThemeChoice, { persist = true } = {}): void {
  const root = document.documentElement;

  if (next === 'system') {
    // Attribute kaldırılır ki CSS'teki prefers-color-scheme bloğu devralsın.
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', next);
  }

  root.setAttribute('data-theme-choice', next);

  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Gizli sekme veya site verisi kapalı — tema çalışır, yalnızca hatırlanmaz.
    }
  }

  window.dispatchEvent(new Event(THEME_EVENT));
}

/**
 * `<body>`'nin ilk çocuğu olarak, boyamadan ÖNCE senkron çalışan script
 * (bkz. app/[locale]/layout.tsx).
 *
 * Kayıtlı seçimi okuyup `<html>` üzerine `data-theme` koyar. Seçim 'system'
 * ise attribute hiç konmaz; CSS'teki `prefers-color-scheme` devralır. Böylece
 * yanlış temanın tek karesi bile görünmez.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k="${THEME_STORAGE_KEY}",c=localStorage.getItem(k),r=document.documentElement;if(c!=="light"&&c!=="dark"){c="system";r.removeAttribute("data-theme")}else{r.setAttribute("data-theme",c)}r.setAttribute("data-theme-choice",c)}catch(e){}})();`;
