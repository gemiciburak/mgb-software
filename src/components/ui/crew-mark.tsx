import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { TECH_MARKS, type TechSlug } from '@/lib/tech-marks';

/**
 * Teknoloji karakteri — kullandığımız bir aracın gözleri olan küçük hali.
 *
 * Referans hareket dili (Grok "bot agent icons"): düz, dolu gövdeler; her
 * biri birkaç derece sallanır, basılıp esner; iki beyaz çubuk göz bakış
 * yönünü değiştirir, eğilir, büyür, kırpılır ve yatay çizgiye döner. Hiçbir
 * karakter diğeriyle aynı anda aynı şeyi yapmaz.
 *
 * Gövdeler logoların KENDİSİ değil, silüetleri ve marka renkleri: gözler
 * logonun üstüne konunca "TS", "N", "JS" harflerinin ve React yörüngelerinin
 * üstüne biniyordu — hem logo bozuluyor hem karakter okunmuyordu. Silüet +
 * renk, markayı tanınır tutarken yüzü temiz bırakıyor; ad zaten yanında yazıyor.
 *
 * Hareket tamamen CSS (`crew-*` yardımcıları, styles/base.css): JS yok, kare
 * başına render yok. Süre ve gecikme karakter başına farklı, negatif gecikme
 * döngüleri baştan kaydırır. Hareket azaltmada genel kural animasyonu durdurur
 * ve karakterler düz bakışta kalır.
 *
 * Hook kullanmaz; hem sunucu hem istemci bileşeninde kullanılabilir. Renkler
 * `light-dark()` ile CSS'te seçilir. Yeri: Teknoloji bölümünün kartları.
 * Dekoratiftir (aria-hidden) — erişilebilir ad kartın kendi metninden gelir.
 */

/** 100×100 kutuda gövde silüetleri. */
const BODIES: Record<TechSlug, ReactNode> = {
  nextjs: <circle cx="50" cy="52" r="42" />,
  typescript: <rect x="10" y="12" width="80" height="80" rx="10" />,
  swift: <rect x="8" y="10" width="84" height="84" rx="28" />,
  nodejs: (
    <polygon points="50,8 88,30 88,74 50,96 12,74 12,30" strokeWidth="10" strokeLinejoin="round" />
  ),
  mongodb: (
    <path d="M50 4C76 26 84 54 66 80 60 88 54 92 50 98 46 92 40 88 34 80 16 54 24 26 50 4Z" />
  ),
  react: (
    <>
      <ellipse cx="50" cy="52" rx="44" ry="22" />
      <ellipse cx="50" cy="52" rx="44" ry="22" transform="rotate(60 50 52)" />
      <ellipse cx="50" cy="52" rx="44" ry="22" transform="rotate(120 50 52)" />
    </>
  ),
  figma: (
    <>
      <rect x="14" y="6" width="38" height="92" rx="19" />
      <rect x="40" y="6" width="44" height="38" rx="19" />
      <circle cx="64" cy="52" r="20" />
    </>
  ),
  docker: (
    <>
      <path d="M6 50H88C92 50 95 46 94 41 98 40 100 36 99 33 94 32 90 34 88 38 86 72 66 92 42 92 20 92 7 76 6 50Z" />
      {[12, 26, 40, 54, 68].map((x) => (
        <rect key={`a${x}`} x={x} y="36" width="12" height="11" rx="2" />
      ))}
      {[26, 40, 54].map((x) => (
        <rect key={`b${x}`} x={x} y="22" width="12" height="11" rx="2" />
      ))}
      <rect x="54" y="8" width="12" height="11" rx="2" />
    </>
  ),
  nestjs: (
    <>
      <circle cx="50" cy="58" r="38" />
      <polygon points="16,40 20,6 46,26" strokeWidth="6" strokeLinejoin="round" />
      <polygon points="84,40 80,6 54,26" strokeWidth="6" strokeLinejoin="round" />
    </>
  ),
};

interface Member {
  slug: TechSlug;
  /** Gözlerin merkezi (100×100 kutuda). */
  eyes: { x: number; y: number };
  /** Gözler marka gövdesinde: koyu temada açık gövdelerde mürekkep rengi. */
  eyeColor: { light: string; dark: string };
  /** Gövde ve göz döngü süreleri (sn) ve faz kayması — karakterler senkron olmasın. */
  sway: number;
  look: number;
  phase: number;
}

const WHITE = { light: '#FFFFFF', dark: '#FFFFFF' };

const CREW: readonly Member[] = [
  {
    slug: 'nextjs',
    eyes: { x: 50, y: 50 },
    eyeColor: { light: '#FFFFFF', dark: '#0A0B0E' },
    sway: 4.2,
    look: 9.6,
    phase: 0,
  },
  {
    slug: 'react',
    eyes: { x: 50, y: 52 },
    eyeColor: { light: '#FFFFFF', dark: '#0A0B0E' },
    sway: 3.6,
    look: 11.2,
    phase: 1.7,
  },
  {
    slug: 'typescript',
    eyes: { x: 50, y: 52 },
    eyeColor: WHITE,
    sway: 4.8,
    look: 10.4,
    phase: 3.1,
  },
  { slug: 'nestjs', eyes: { x: 50, y: 60 }, eyeColor: WHITE, sway: 3.9, look: 8.8, phase: 4.6 },
  { slug: 'nodejs', eyes: { x: 50, y: 52 }, eyeColor: WHITE, sway: 4.5, look: 12, phase: 2.3 },
  { slug: 'mongodb', eyes: { x: 50, y: 50 }, eyeColor: WHITE, sway: 3.3, look: 9.2, phase: 5.4 },
  { slug: 'docker', eyes: { x: 38, y: 68 }, eyeColor: WHITE, sway: 5.1, look: 10.8, phase: 0.9 },
  { slug: 'figma', eyes: { x: 46, y: 46 }, eyeColor: WHITE, sway: 4, look: 11.6, phase: 6.2 },
  { slug: 'swift', eyes: { x: 50, y: 52 }, eyeColor: WHITE, sway: 4.4, look: 9.9, phase: 3.8 },
];

const BY_SLUG = new Map(CREW.map((member) => [member.slug, member]));

export function CrewMark({ slug, className }: { slug: TechSlug; className?: string }) {
  const member = BY_SLUG.get(slug);
  if (!member) return null;
  const mark = TECH_MARKS[slug];
  const style = {
    '--crew-body': `light-dark(${mark.brand.light}, ${mark.brand.dark})`,
    '--crew-eye': `light-dark(${member.eyeColor.light}, ${member.eyeColor.dark})`,
    '--crew-sway': `${member.sway}s`,
    '--crew-look': `${member.look}s`,
    '--crew-phase': `-${member.phase}s`,
  } as CSSProperties;

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('overflow-visible', className)}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <g className="crew-body" fill="var(--crew-body)" stroke="var(--crew-body)" strokeWidth="0">
        {BODIES[slug]}
        {/* Her göz kendi merkezinde döner ve ölçeklenir (fill-box): eğik
            çubuk, yuvarlak ve yatay çizgi halleri böyle çıkıyor. */}
        <g fill="var(--crew-eye)" stroke="none">
          <rect
            className="crew-eye"
            x={member.eyes.x - 14}
            y={member.eyes.y - 12}
            width="9"
            height="24"
            rx="4.5"
          />
          <rect
            className="crew-eye"
            x={member.eyes.x + 5}
            y={member.eyes.y - 12}
            width="9"
            height="24"
            rx="4.5"
          />
        </g>
      </g>
    </svg>
  );
}
