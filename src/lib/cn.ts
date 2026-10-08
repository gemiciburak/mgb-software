import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Tailwind sınıf birleştirici.
 *
 * DİKKAT — burada `twMerge`'in varsayılan hali kullanılamaz.
 *
 * Tasarım sistemimizde hem punto hem renk token'ları `text-` önekini
 * paylaşıyor (`text-body` punto, `text-accent-fg` renk). tailwind-merge
 * özel isimleri tanımadığı için ikisini aynı grup sayıp sonrakini
 * öncekine galip getiriyordu:
 *
 *   twMerge('bg-accent text-accent-fg', 'text-body') → 'bg-accent text-body'
 *
 * Sonuç: birincil butonun metin rengi düşüyor ve miras alınan `--fg`
 * uygulanıyordu — koyu temada beyaz metin vurgu zemininde 3.69:1 veriyor,
 * yani WCAG AA'yı geçmiyordu. Aşağıdaki yapılandırma hangi adın punto,
 * hangisinin renk olduğunu açıkça bildiriyor.
 *
 * Yeni bir token eklenince bu listeler de güncellenmeli.
 */

/** styles/tokens.css içindeki `--text-*` token'ları. */
const FONT_SIZES = [
  'display-1',
  'display-2',
  'display-3',
  'title',
  'body-lg',
  'body',
  'body-sm',
  'label',
  'mono-sm',
];

/** styles/tokens.css içindeki `--color-*` token'ları. */
const COLORS = [
  'bg',
  'bg-subtle',
  'surface',
  'surface-elevated',
  'line',
  'line-strong',
  'fg',
  'fg-muted',
  'fg-subtle',
  'accent',
  'accent-hover',
  'accent-quiet',
  'accent-fg',
  'accent-wash',
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZES }],
      'text-color': [{ text: COLORS }],
    },
  },
});

/** Koşullu sınıfları birleştirir ve çakışan Tailwind yardımcılarını son yazana göre çözer. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
