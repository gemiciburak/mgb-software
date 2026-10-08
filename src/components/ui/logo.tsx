import { cn } from '@/lib/cn';
import { LOGO_GRID, LOGO_MGB_PATH, LOGO_WIDTH } from '@/lib/logo-paths';

/**
 * Marka kilidi: çizilmiş MGB işareti + mono "SOFTWARE".
 *
 * MGB artık display fontuyla dizilmiş bir kelime değil, kendi modüler
 * ızgarasında çizilmiş harf formları (bkz. lib/logo-paths.ts). Navigasyonda
 * monogram değil kilit kullanılır — yeni bir marka için ismin okunması,
 * sembolün tanınmasından önce gelir. Tek başına M, favicon ve uygulama
 * ikonlarında yaşar.
 *
 * İşaret `currentColor` ile boyanır, yani her iki temada ve her bağlamda
 * (footer, nav, mobil menü) çevresindeki metin rengini alır.
 */
export function Logo({
  className,
  compact = false,
  size = 'sm',
}: {
  className?: string;
  compact?: boolean;
  /** sm: navigasyon · lg: footer, markanın daha güçlü durduğu yer. */
  size?: 'sm' | 'lg';
}) {
  return (
    <span
      className={cn(
        'flex items-end leading-none',
        size === 'lg' ? 'gap-3.5' : 'gap-2.5',
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${LOGO_WIDTH} ${LOGO_GRID.height}`}
        className={cn('w-auto text-fg', size === 'lg' ? 'h-7' : 'h-5')}
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d={LOGO_MGB_PATH} />
      </svg>

      {/* Kompakt (scroll sonrası) halde ikinci satır düşer, isim kalır. */}
      <span
        aria-hidden={compact}
        className={cn(
          'font-mono text-mono-sm text-fg-subtle transition-all duration-[var(--duration-base)]',
          compact ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100',
        )}
      >
        SOFTWARE
      </span>

      {/* İşaret dekoratif; adı her bağlamda ekran okuyucuya ver. */}
      <span className="sr-only">MGB Software</span>
    </span>
  );
}
