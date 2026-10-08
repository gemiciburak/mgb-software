import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { hasLocale } from 'next-intl';
import { getContent } from '@/content';
import { routing } from '@/i18n/routing';
import { BRAND_SIGNATURE, SITE_NAME } from '@/lib/constants';
import { MonogramTile } from '@/lib/monogram';

/**
 * Paylaşım görseli (Open Graph + Twitter `summary_large_image`).
 *
 * Her dil için build sırasında bir kez üretilir. Ink paletiyle çizilir:
 * sosyal akışların çoğu açık zeminli olduğu için koyu kart daha iyi ayrışıyor.
 *
 * Font: Satori woff2 okumadığı için Clash Display'in TTF kopyası kullanılır
 * (bkz. src/assets/fonts/README.md) — Türkçe karakterler bu dosyada doğrulandı.
 */
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Her dil için build sırasında üretilir; çalışma anında font okunmaz. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const INK = { bg: '#0A0B0E', line: '#23272F', fg: '#F4F5F7', muted: '#A4ABB6', accent: '#5888FF' };

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const { hero, meta } = getContent(locale);

  const clashDisplay = await readFile(join(process.cwd(), 'src/assets/fonts/ClashDisplay-600.ttf'));

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: INK.bg,
        color: INK.fg,
        fontFamily: 'Clash Display',
        backgroundImage: `linear-gradient(to right, ${INK.line} 1px, transparent 1px), linear-gradient(to bottom, ${INK.line} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', width: 64, height: 64 }}>
          <MonogramTile size={64} />
        </div>
        <span style={{ fontSize: 30, letterSpacing: '-0.01em' }}>{SITE_NAME}</span>
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: 76,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          maxWidth: 940,
        }}
      >
        {hero.title}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${INK.line}`,
          paddingTop: 28,
          fontSize: 26,
        }}
      >
        <span style={{ color: INK.muted }}>{meta.tagline}</span>
        <span style={{ color: INK.accent }}>{BRAND_SIGNATURE}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: 'Clash Display', data: clashDisplay, weight: 600, style: 'normal' }],
    },
  );
}
