'use client';

import { motion, useScroll } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { buttonStyles } from '@/components/ui/button';
import { MenuIcon } from '@/components/ui/icons';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Link, usePathname } from '@/i18n/navigation';
import { useActiveSection } from '@/hooks/use-active-section';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useScrolled } from '@/hooks/use-scrolled';
import { cn } from '@/lib/cn';
import {
  NAV_ITEMS,
  navHref,
  navItemForPathname,
  SECTION_ID,
  sectionHref,
  type SectionId,
} from '@/lib/sections';
import { MobileMenu } from './mobile-menu';

/** Göstergenin satırlar arasında kayma hissi. Yumuşak ama tembel değil. */
const MARKER_SPRING = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 } as const;

/** Masaüstü navigasyonun göründüğü eşik — tokens.css'teki --breakpoint-lg. */
const DESKTOP_QUERY = '(min-width: 64rem)';

/**
 * Üst navigasyon — "paftanın üst kenarı".
 *
 * Tek bir soruyu üç katmanda cevaplıyor: neredeyim, nereyi gösteriyorum, ne
 * kadar ilerledim.
 *
 *   1. Bölüm takibi — üstü ekranın %40 çizgisini en son geçen bölümün linki
 *      işaretlenir (`useActiveSection`). Dekoratif değil: tek sayfalık bir
 *      sitede kullanıcının konumunu bilmesinin tek yolu bu. `aria-current`
 *      ile de bildirilir, yani bilgi yalnızca görsel değil.
 *   2. Gezen vurgu çizgisi — işaretli linkin altındaki hairline, satırlar
 *      arasında kayarak gider (motion `layoutId`). İmleç bir linkin üzerine
 *      gelince ona gider, imleç çekilince bulunulan bölüme geri döner.
 *      Yani klasik "hover underline" değil: hover bittiğinde kaybolmuyor,
 *      doğru yere dönüyor.
 *   3. İlerleme çizgisi — başlığın alt kenarı sayfa boyunca vurgu rengiyle
 *      dolar. Hairline dilinde bir cetvel; kaydırma çubuğunun yaptığı işi
 *      sayfanın kendi diliyle yapıyor.
 *
 * Etiketin kendisi hover'da HAREKET ETMEZ. İlk sürümde maskeli bir takas
 * vardı (etiket yukarı kayıp altından aynısı giriyordu); dört link yan yana
 * olduğu için imleci navigasyon boyunca gezdirmek arka arkaya dört takas
 * tetikliyor ve gözü yoruyordu. Geri bildirimi artık yalnızca renk geçişi ve
 * gezen çizgi veriyor — ikisi de yumuşak, ikisi de yeterli.
 *
 * Başta tamamen şeffaf; 64px scroll sonrası bulanık zemin, hairline alt çizgi
 * ve 88 → 64px kompakt yükseklik. Yükseklik geçişi sırasında logo'nun
 * "SOFTWARE" satırı da düşer, yani kompaktlaşma tipografiye de yansır.
 *
 * Mobilde ayrı bir tam ekran menü açılır (bkz. mobile-menu.tsx); odak,
 * menü kapandığında tetikleyici düğmeye geri döner.
 */
export function NavBar() {
  const t = useTranslations('nav');
  const tActions = useTranslations('actions');
  const locale = useLocale();
  const scrolled = useScrolled(64);
  const reducedMotion = usePrefersReducedMotion();
  const pathname = usePathname();
  const scrolledSection = useActiveSection();
  // Bir öğenin kendi sayfasındaysak (ör. Hakkımızda) o öğe işaretli kalır;
  // değilse ana sayfada okunmakta olan bölüm.
  const activeSection = navItemForPathname(pathname) ?? scrolledSection;
  const { scrollYProgress } = useScroll();

  const [hovered, setHovered] = useState<SectionId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // İmleç varken onu izler, yokken bulunulan bölüme döner.
  const marked = hovered ?? activeSection;

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    // Odak, menüyü açan düğmeye döner — klavye kullanıcısı bağlamı kaybetmez.
    // Bir kare sonra: menü açıkken düğme de inert'tir, kapanış commit
    // edilmeden odaklanamaz.
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  // Menü açıkken pencere masaüstü genişliğine geçerse (ör. tablet yan
  // çevrilince) panel CSS ile gizlenir ama durum açık kalır — kaydırma
  // kilidi ve klavye dinleyicisi sürerdi. Eşik aşılınca menü kapanır.
  useEffect(() => {
    if (!menuOpen) return;

    const mediaQueryList = window.matchMedia(DESKTOP_QUERY);
    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) setMenuOpen(false);
    }

    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-all duration-[var(--duration-base)] ease-[var(--ease-transition)]',
          scrolled
            ? 'border-b border-line bg-bg/80 backdrop-blur-md'
            : 'border-b border-transparent',
        )}
      >
        <div
          className={cn(
            'mx-auto flex max-w-wide items-center justify-between px-gutter',
            'transition-[height] duration-[var(--duration-base)] ease-[var(--ease-transition)]',
            scrolled ? 'h-16' : 'h-22',
          )}
        >
          <a
            href={sectionHref(locale, SECTION_ID.hero)}
            aria-label={t('homeLabel')}
            className="rounded-xs focus-visible:outline-offset-4"
          >
            <Logo compact={scrolled} />
          </a>

          {/* Masaüstü navigasyonu — hover ve geniş alan lg'den itibaren var. */}
          <nav
            aria-label={t('menuLabel')}
            onMouseLeave={() => setHovered(null)}
            className="hidden items-center lg:flex"
          >
            {NAV_ITEMS.map((item) => {
              const isMarked = marked === item.id;
              const isCurrent = activeSection === item.id;

              return (
                <a
                  key={item.id}
                  href={navHref(locale, item.id)}
                  onMouseEnter={() => setHovered(item.id)}
                  onFocus={() => setHovered(item.id)}
                  onBlur={() => setHovered(null)}
                  {...(isCurrent ? { 'aria-current': 'true' as const } : {})}
                  className={cn(
                    'relative rounded-sm px-4 py-2 text-body-sm',
                    'transition-colors duration-[var(--duration-slow)] ease-[var(--ease-entrance)]',
                    isMarked ? 'text-fg' : 'text-fg-muted',
                  )}
                >
                  {t(item.labelKey)}

                  {isMarked && (
                    <motion.span
                      aria-hidden="true"
                      // layoutId: çizgi silinip yeniden çizilmiyor, iki konum
                      // arasında kayıyor. Hareket azaltma açıkken kaydırma
                      // kapatılır ve çizgi doğrudan yerinde belirir.
                      {...(reducedMotion ? {} : { layoutId: 'nav-marker' })}
                      transition={MARKER_SPRING}
                      className="absolute inset-x-4 bottom-0 h-px bg-accent"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 lg:gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              <LocaleSwitcher />
              <span aria-hidden="true" className="h-4 w-px bg-line" />
            </div>

            <ThemeToggle />

            <Link
              href="/start"
              className={buttonStyles({ size: 'sm', className: 'hidden lg:inline-flex' })}
            >
              {tActions('startProject')}
            </Link>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t('openMenu')}
              aria-expanded={menuOpen}
              className="inline-flex size-11 items-center justify-center rounded-sm text-fg-muted hover:bg-accent-wash hover:text-fg lg:hidden"
            >
              <MenuIcon className="size-5" />
            </button>
          </div>
        </div>

        {/* Sayfa ilerlemesi. Scroll'a doğrudan bağlı olduğu için kendi başına
            hareket etmez — kaydırma çubuğu gibi bir konum göstergesidir, bu
            yüzden hareket azaltma modunda da kalır. */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
        />
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} activeSection={activeSection} />
    </>
  );
}
