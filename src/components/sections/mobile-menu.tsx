'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { Logo } from '@/components/ui/logo';
import { CloseIcon } from '@/components/ui/icons';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { buttonStyles } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { DURATION, EASE_TRANSITION } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { NAV_ITEMS, sectionHref, type SectionId } from '@/lib/sections';

/** Tab döngüsünü panel içinde tutmak için odaklanabilir öğe seçicisi. */
const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * Tam ekran mobil menü.
 *
 * Masaüstü menünün küçültülmüş hali değil: linkler display ölçeğinde, mono
 * numaralandırmalı ve kendi dikey ritmine sahip. Alt şeritte dil, tema ve
 * birincil eylem tam genişlikte durur — başparmakla erişilebilir yerde.
 *
 * Menü açıldığında bulunulan bölüm işaretli gelir (numara vurgu renginde ve
 * solda bir vurgu çizgisi). Masaüstündeki gezen çizgiyle aynı bilgi, aynı
 * renk, dokunmatiğe uygun biçimde: hover'ı olmayan kullanıcı da nerede
 * olduğunu görür.
 *
 * Erişilebilirlik: role="dialog" + aria-modal, Escape ile kapanır, açılınca
 * odak panele girer, Tab döngüsü panelde kalır, kapanınca odak tetikleyiciye
 * döner (bunu NavBar yönetir).
 */
export function MobileMenu({
  open,
  onClose,
  activeSection,
}: {
  open: boolean;
  onClose: () => void;
  activeSection: SectionId | null;
}) {
  const t = useTranslations('nav');
  const tActions = useTranslations('actions');
  const locale = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(open);

  // Odak yönetimi: açılışta panele gir, Escape ile kapat, Tab'ı panelde tut.
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const getFocusable = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    getFocusable().at(0)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = getFocusable();
      const first = items.at(0);
      const last = items.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Arka plan inert: aria-modal yalnızca bir beyan, arka plandaki öğeleri
  // ekran okuyucudan ve dokunmadan gerçekten çeken bu. Panelden <body>'ye
  // kadar her atanın kardeşleri işaretlenir; zaten inert olanlara dokunulmaz.
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const marked: HTMLElement[] = [];
    for (let node: HTMLElement = panel; node.parentElement; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling === node || !(sibling instanceof HTMLElement) || sibling.inert) continue;
        sibling.setAttribute('inert', '');
        marked.push(sibling);
      }
      if (node.parentElement === document.body) break;
    }

    return () => {
      for (const element of marked) element.removeAttribute('inert');
    };
  }, [open]);

  // Hareket azaltma: panel kayarak değil, yalnızca görünürlükle açılır.
  const panelVariants = reducedMotion
    ? { closed: { opacity: 0 }, open: { opacity: 1 } }
    : {
        closed: { clipPath: 'inset(0 0 100% 0)' },
        open: { clipPath: 'inset(0 0 0% 0)' },
      };

  const rowVariants = reducedMotion
    ? { closed: { opacity: 1 }, open: { opacity: 1 } }
    : {
        closed: { opacity: 0, y: 16 },
        open: { opacity: 1, y: 0 },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('menuLabel')}
          initial="closed"
          animate="open"
          exit="closed"
          variants={panelVariants}
          transition={{ duration: reducedMotion ? 0.01 : DURATION.base, ease: EASE_TRANSITION }}
          className="fixed inset-0 z-50 flex flex-col bg-bg lg:hidden"
        >
          {/* Üst şerit, kapalı navigasyonla aynı yükseklikte — menü açılırken
              logo yerinde kalır, zıplamaz. */}
          <div className="flex h-22 shrink-0 items-center justify-between px-gutter">
            <Logo />
            <button
              type="button"
              onClick={onClose}
              aria-label={t('closeMenu')}
              className="inline-flex size-11 items-center justify-center rounded-sm text-fg-muted hover:bg-accent-wash hover:text-fg"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>

          <motion.nav
            aria-label={t('menuLabel')}
            // Kısa ekranda veya büyütülmüş metinde linkler sığmazsa bu alan
            // kayar. `justify-center-safe`: taşınca ortalama bırakılır, aksi
            // halde ilk satırlar kaydırılamayan üst bölgeye kesilirdi.
            className="flex min-h-0 flex-1 flex-col justify-center-safe overflow-y-auto overscroll-contain border-t border-line"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: {
                transition: { staggerChildren: reducedMotion ? 0 : 0.05, delayChildren: 0.08 },
              },
              closed: {},
            }}
          >
            {NAV_ITEMS.map((item, index) => {
              const isCurrent = activeSection === item.id;

              return (
                <motion.a
                  key={item.id}
                  href={sectionHref(locale, item.id)}
                  onClick={onClose}
                  variants={rowVariants}
                  transition={{
                    duration: reducedMotion ? 0.01 : DURATION.base,
                    ease: EASE_TRANSITION,
                  }}
                  {...(isCurrent ? { 'aria-current': 'true' as const } : {})}
                  className="relative flex items-baseline gap-4 border-b border-line px-gutter py-5 transition-colors hover:bg-accent-wash"
                >
                  {isCurrent && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-0.5 bg-accent"
                    />
                  )}
                  <span
                    className={cn(
                      'font-mono text-mono-sm tabular-nums',
                      isCurrent ? 'text-accent' : 'text-fg-subtle',
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-display-2 text-fg">{t(item.labelKey)}</span>
                </motion.a>
              );
            })}
          </motion.nav>

          {/* Alt boşluk ev göstergesi / güvenli alanla çakışmaz. */}
          <div className="shrink-0 space-y-5 px-gutter pt-6 pb-[max(--spacing(6),env(safe-area-inset-bottom))]">
            <Link href="/start" onClick={onClose} className={buttonStyles({ className: 'w-full' })}>
              {tActions('startProject')}
            </Link>
            <div className="flex items-center justify-between">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
