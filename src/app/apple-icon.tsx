import { ImageResponse } from 'next/og';
import { MonogramTile } from '@/lib/monogram';

/**
 * iOS ana ekran ikonu. `icon.svg` modern tarayıcılarda sekme ikonu olarak
 * yeterli, ancak iOS kısayolları PNG bekliyor. Köşe yuvarlaklığını iOS
 * kendisi uyguladığı için `maskable` varyantı kullanılır (tam dolu zemin).
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(<MonogramTile size={size.width} maskable />, size);
}
