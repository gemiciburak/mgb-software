import { ImageResponse } from 'next/og';
import { MonogramTile } from '@/lib/monogram';

/**
 * PWA ikonları — sabit URL'lerde PNG üretir (`/icons/icon-192.png` gibi).
 *
 * Next'in `icon.*` dosya konvansiyonu parmak izli adresler verdiği için
 * manifest'ten referans vermek güvenilir olmuyor. Route handler ise sabit
 * yol sunar ve `force-static` ile build sırasında bir kez üretilir —
 * çalışma anında maliyet yok, harici rasterleştirme aracı da gerekmiyor.
 */
export const dynamic = 'force-static';

const ICONS = {
  'icon-192.png': { size: 192, maskable: false },
  'icon-512.png': { size: 512, maskable: false },
  'maskable-512.png': { size: 512, maskable: true },
} as const;

type IconName = keyof typeof ICONS;

export function generateStaticParams() {
  return (Object.keys(ICONS) as IconName[]).map((name) => ({ name }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const config = ICONS[name as IconName];

  if (!config) {
    return new Response('Not found', { status: 404 });
  }

  return new ImageResponse(<MonogramTile size={config.size} maskable={config.maskable} />, {
    width: config.size,
    height: config.size,
  });
}
