import { TECH_MARKS, TECH_VIEWBOX, type TechSlug } from '@/lib/tech-marks';

/**
 * Tek bir teknoloji markası.
 *
 * Durağan halde `currentColor` ile çizilir — yani sayfanın tek-vurgu
 * disiplinini bozmaz. Marka rengi ancak kart hover/odak olunca açılır;
 * bunu `--brand` özel değişkeni üzerinden CSS yapar (bkz. styles/base.css).
 *
 * `light-dark()` kullanıldığı için renk seçimi tamamen CSS'te kalır: tema
 * hook'u okunmadığından sunucu ve istemci çıktısı birebir aynı olur.
 *
 * İşaret dekoratiftir: marka adı zaten kartın içinde metin olarak yazıyor,
 * bu yüzden SVG `aria-hidden`.
 */
export function TechMark({ slug, className }: { slug: TechSlug; className?: string }) {
  const mark = TECH_MARKS[slug];

  return (
    <svg
      viewBox={TECH_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={
        { '--brand': `light-dark(${mark.brand.light}, ${mark.brand.dark})` } as React.CSSProperties
      }
    >
      <path d={mark.path} fill="currentColor" />
    </svg>
  );
}
