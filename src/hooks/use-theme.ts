'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  applyThemeChoice,
  isThemeChoice,
  THEME_CYCLE,
  THEME_EVENT,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemeChoice,
} from '@/lib/theme';
import { useMediaQuery } from './use-media-query';

/**
 * Harici depo: `<html data-theme-choice>`. Inline script bu attribute'u
 * hidrasyondan önce yazdığı için React'in ayrı bir başlangıç durumuna
 * ihtiyacı yok.
 */
function subscribe(onStoreChange: () => void): () => void {
  function onStorage(event: StorageEvent) {
    if (event.key !== THEME_STORAGE_KEY) return;
    // Başka sekmede değişti: DOM'u eşitle, geri yazma yapma.
    applyThemeChoice(isThemeChoice(event.newValue) ? event.newValue : 'system', {
      persist: false,
    });
  }

  window.addEventListener(THEME_EVENT, onStoreChange);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(THEME_EVENT, onStoreChange);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): ThemeChoice {
  const stored = document.documentElement.dataset.themeChoice;
  return isThemeChoice(stored) ? stored : 'system';
}

/** Sunucuda ve hidrasyonun ilk adımında 'system' — SSR çıktısıyla birebir aynı. */
function getServerSnapshot(): ThemeChoice {
  return 'system';
}

export interface UseThemeResult {
  /** Kullanıcının seçimi: 'system' | 'light' | 'dark'. */
  choice: ThemeChoice;
  /** Ekranda gerçekten uygulanan tema. */
  resolved: ResolvedTheme;
  setChoice: (next: ThemeChoice) => void;
  /** Sırayı bir adım ilerletir: system → light → dark → system. */
  cycle: () => void;
}

export function useTheme(): UseThemeResult {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const setChoice = useCallback((next: ThemeChoice) => {
    applyThemeChoice(next);
  }, []);

  const cycle = useCallback(() => {
    const current = getSnapshot();
    const index = THEME_CYCLE.indexOf(current);
    applyThemeChoice(THEME_CYCLE[(index + 1) % THEME_CYCLE.length] ?? 'system');
  }, []);

  const resolved: ResolvedTheme =
    choice === 'system' ? (systemPrefersDark ? 'dark' : 'light') : choice;

  return { choice, resolved, setChoice, cycle };
}
