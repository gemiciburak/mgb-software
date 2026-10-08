import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/lib/constants';

/**
 * Web app manifest.
 *
 * İkonlar `app/icons/[name]` route handler'ından gelir — sabit URL'ler,
 * build sırasında statik üretilir. `theme_color` tarayıcı arayüzünü
 * boyadığı için Ink paletinin zemin rengi seçildi.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'MGB',
    description: 'Tasarım, yazılım ve dijital mühendislik. / Design, software and engineering.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0B0E',
    theme_color: '#0A0B0E',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
