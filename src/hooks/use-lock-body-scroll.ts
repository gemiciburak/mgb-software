'use client';

import { useEffect } from 'react';

/**
 * Tam ekran mobil menü açıkken arka planın kaymasını engeller.
 *
 * `overflow: hidden` yerine kaydırma çubuğu genişliği telafi edilir;
 * aksi halde menü açılırken sayfa içeriği yatay olarak zıplar.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [locked]);
}
