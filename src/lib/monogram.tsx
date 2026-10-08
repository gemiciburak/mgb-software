import { LETTER_M_PATH, LOGO_GRID } from './logo-paths';

/**
 * M monogramı — uygulama ikonlarının tek kaynağı.
 *
 * Kelime işaretiyle AYNI harf formu (lib/logo-paths.ts): ikon ile logo
 * birbirinin akrabası, benzeri değil. Dolu zemin üzerinde dolu harf
 * kullanılır — konturlu bir çizim 16px'te kırılırdı.
 */

/** Palet ile aynı değerler — Blueprint Cobalt ve Ink. */
export const ICON_BACKGROUND = '#1F46E0';
export const ICON_FOREGROUND = '#FFFFFF';

interface MonogramTileProps {
  size: number;
  /**
   * Android maskeleme için: içerik merkezdeki güvenli alanda kalır ve zemin
   * taşar. Köşe yuvarlaklığı uygulanmaz, maskeyi işletim sistemi koyar.
   */
  maskable?: boolean;
}

export function MonogramTile({ size, maskable = false }: MonogramTileProps) {
  // Maskelenebilir ikonda içerik, kenarın kesilmesine karşı küçültülür.
  const glyphRatio = maskable ? 0.34 : 0.44;
  const glyphSize = Math.round(size * glyphRatio);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: ICON_BACKGROUND,
        borderRadius: maskable ? 0 : `${Math.round(size * 0.21)}px`,
      }}
    >
      <svg
        width={glyphSize}
        height={Math.round((glyphSize * LOGO_GRID.height) / LOGO_GRID.letterWidth)}
        viewBox={`0 0 ${LOGO_GRID.letterWidth} ${LOGO_GRID.height}`}
        fill={ICON_FOREGROUND}
      >
        <path d={LETTER_M_PATH} />
      </svg>
    </div>
  );
}
