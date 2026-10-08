import { Inter, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';

/**
 * Display — Clash Display (Indian Type Foundry, ITF Free Font License).
 *
 * Self-hosted: üçüncü taraf font CDN'ine çalışma anı bağımlılığı yok, dosyalar
 * build'e gömülür ve CLS sıfırlanır. Türkçe kapsamı (15 karakter, ğĞşŞıİçÇöÖüÜâîû)
 * cmap tablosu okunarak doğrulanmıştır — bkz. src/assets/fonts/README.md.
 *
 * Yalnızca 600 ağırlığı yüklenir: bütün display token'ları (`--text-display-*`,
 * `--text-title`) 600 kullanıyor. 500 de önceden yükleniyordu ama tarayıcıda
 * ölçüldüğünde hiçbir öğe onu kullanmıyordu — her ziyarette boşa 15 KB'lık
 * yüksek öncelikli istek. Fontshare CSS API'si değişken font sunmadığı için
 * statik ağırlık tercih edildi; yeni ağırlık gerekirse buraya eklenir.
 */
const clashDisplay = localFont({
  src: [{ path: '../assets/fonts/ClashDisplay-600.woff2', weight: '600', style: 'normal' }],
  variable: '--font-clash-display',
  display: 'swap',
  preload: true,
  fallback: ['Inter', 'system-ui', 'sans-serif'],
});

/**
 * Gövde — Inter.
 * `latin-ext` alt kümesi Türkçe için ZORUNLU: ğ, ş, ı, İ bu aralıkta
 * (U+0100–024F). Yalnızca `latin` ile bu harfler fallback fonta düşer.
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

/** Teknik detaylar — JetBrains Mono. Aynı şekilde latin-ext zorunlu. */
const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false, // gövde metninde kullanılmıyor; etiketlerde swap yeterli
});

/** Kök <html> elementine eklenecek font değişkeni sınıfları. */
export const fontVariables = [clashDisplay.variable, inter.variable, jetBrainsMono.variable].join(
  ' ',
);
