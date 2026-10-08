import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/i18n/request.ts',
});

/**
 * Üretim için güvenlik başlıkları. CSP burada henüz katı tanımlanmıyor;
 * eklenirse teşekkür ekranındaki Calendly iframe'i (`frame-src
 * https://calendly.com`) için izin verilmeli. Analitik eklendiğinde nonce
 * tabanlı CSP ile birlikte gözden geçirilecek.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // three.js ağaç sarsıntısını iyileştirir ve paket boyutunu düşürür.
  experimental: {
    optimizePackageImports: ['three', '@react-three/drei', 'motion'],
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
