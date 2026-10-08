/**
 * ===========================================================================
 * Wireframe Ink Field — hero
 * ---------------------------------------------------------------------------
 * Konsept: ince tel kafes çizgilerinden oluşan bir yüzey, mürekkep gibi
 * akışkan biçimde dalgalanır; periyodik olarak düzenli bir grid'e ve bir
 * arayüz çerçevesine toparlanır, sonra yeniden çözülür. Yazılım + mühendislik
 * çizimi + tasarım kimliğinin tek görselde buluşması.
 *
 * Bu dosya TEK doğruluk kaynağıdır: aynı alan hem GLSL'de (canvas, animasyonlu)
 * hem TypeScript'te (statik SVG fallback) hesaplanır. İkisi yan yana durur ki
 * biri değişince diğerinin güncellenmesi gerektiği gözden kaçmasın.
 *
 * Yapılandırma bir varyant kaydı olarak duruyor: alan boyutları ve sönüm
 * eşikleri uniform olarak geçtiği için ileride ikinci bir yerleşim eklemek
 * shader'a dokunmadan mümkün.
 * ===========================================================================
 */

export type InkVariantName = 'hero';

export interface Field {
  halfWidth: number;
  halfHeight: number;
}

export interface GridConfig {
  rows: number;
  cols: number;
  samples: number;
}

export interface InkVariant {
  camera: { z: number; fov: number };
  rotation: { x: number; y: number };
  offsetY: number;
  /**
   * 'aspect' → yatay konum viewport oranına göre sağa kayar (hero: solda
   * başlık için sessiz alan kalsın). Sayı → sabit konum.
   */
  offsetX: number | 'aspect';
  /**
   * Alanın yarı boyutları. `fromAspect` true ise yarı-genişlik viewport
   * oranından türetilir, yani şerit her ekranda tam dolar.
   */
  field: Field & { fromAspect: boolean };
  amplitude: number;
  /** Kenar sönümünün başladığı ve bittiği oranlar (yarı boyuta göre). */
  fadeX: [number, number];
  fadeY: [number, number];
  /** Arayüz çerçevesinin x ve y ölçeği. */
  frameScale: [number, number];
  frameOpacity: number;
  /** Toparlanma döngüsünün faz kayması — iki varyant aynı anda toparlanmasın. */
  timeOffset: number;
  grid: { desktop: GridConfig; mobile: GridConfig; fallback: GridConfig };
  /** Statik SVG fallback'in referans en-boy oranı. */
  fallbackAspect: number;
  /** Fallback'in dondurulduğu an ve toparlanma oranı. */
  fallbackTime: number;
  fallbackGather: number;
}

export const INK_VARIANTS: Record<InkVariantName, InkVariant> = {
  hero: {
    camera: { z: 3.4, fov: 32 },
    rotation: { x: -0.4, y: 0.26 },
    offsetY: -0.02,
    offsetX: 'aspect',
    field: { halfWidth: 1.5, halfHeight: 1.02, fromAspect: false },
    amplitude: 0.62,
    fadeX: [0.42, 0.95],
    fadeY: [0.4, 0.95],
    frameScale: [0.74, 0.74],
    frameOpacity: 0.9,
    timeOffset: 0,
    grid: {
      desktop: { rows: 18, cols: 26, samples: 52 },
      mobile: { rows: 11, cols: 15, samples: 30 },
      fallback: { rows: 16, cols: 22, samples: 28 },
    },
    fallbackAspect: 1200 / 760,
    fallbackTime: 0,
    fallbackGather: 0.42,
  },
};

/** Verilen viewport oranında alanın gerçek yarı boyutları. */
export function fieldFor(variant: InkVariant, aspect: number): Field {
  const { halfHeight, halfWidth, fromAspect } = variant.field;
  return {
    halfHeight,
    halfWidth: fromAspect ? halfHeight * Math.max(aspect, 0.4) : halfWidth,
  };
}

/** Grup konumunun yatay bileşeni. */
export function offsetXFor(variant: InkVariant, aspect: number): number {
  if (variant.offsetX !== 'aspect') return variant.offsetX;
  // Geniş ekranda sağa kayar, dar/dikey ekranda ortaya döner.
  return Math.min(Math.max(0.1 + 1.071 * (aspect - 1), 0.05), 0.85);
}

/* ---------------------------------------------------------------------------
   Alan fonksiyonları — GLSL karşılıkları aşağıdaki INK_GLSL içinde.
   --------------------------------------------------------------------------- */

/** Alan örneklenmeden önce koordinatları büker; akışın organik görünmesini sağlar. */
function warp(x: number, y: number, t: number): [number, number] {
  return [x + 0.3 * Math.sin(y * 1.15 + t * 0.3), y + 0.3 * Math.cos(x * 1.05 - t * 0.25)];
}

/** Mürekkep yoğunluğunun merkezi; yavaşça gezinir. */
function drift(t: number): [number, number] {
  return [Math.sin(t * 0.17) * 0.75, Math.cos(t * 0.13) * 0.42];
}

/**
 * Yüzeyin yükseltisi, kabaca [-1, 1].
 *
 * Üç dalga katmanının toplamı, gezinen bir yoğunluk zarfıyla çarpılır.
 * Zarf olmadan yüzey her yerde eşit hareket eder ve "bükülmüş grid" gibi
 * görünür; zarfla birlikte bazı bölgeler sakin kalır, mürekkep hissi doğar.
 */
export function inkElevation(x: number, y: number, t: number): number {
  const [wx, wy] = warp(x, y, t);
  const [dx, dy] = drift(t);

  const a = Math.sin(wx * 2.55 + t * 0.55) * Math.cos(wy * 2.1 - t * 0.42);
  const b = Math.sin(wx * 1.75 + wy * 1.3 - t * 0.33);
  const c = Math.sin(Math.hypot(wx - dx, wy - dy) * 3.4 - t * 0.9);
  const base = a * 0.45 + b * 0.28 + c * 0.27;

  const ex = (x - dx) * 0.62;
  const ey = y - dy;
  const envelope = Math.exp(-(ex * ex + ey * ey) * 0.62);

  return base * (0.3 + 0.95 * envelope);
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/** Kenarlara doğru sönüm — yüzey ekranın kenarında aniden kesilmez. */
export function inkFade(x: number, y: number, variant: InkVariant, field: Field): number {
  const fx = 1 - smoothstep(variant.fadeX[0], variant.fadeX[1], Math.abs(x) / field.halfWidth);
  const fy = 1 - smoothstep(variant.fadeY[0], variant.fadeY[1], Math.abs(y) / field.halfHeight);
  return fx * fy;
}

/** Çizginin vurgu rengine kayma oranı; yalnızca gerçek tepelerde 1'e yaklaşır. */
export function inkDensity(elevation: number): number {
  return smoothstep(0.35, 0.95, Math.abs(elevation));
}

/**
 * Toparlanma döngüsü: 0 = çözülmüş mürekkep, 1 = düzenli grid + arayüz çerçevesi.
 * 18 saniyelik döngünün yaklaşık 3,5 saniyesi toparlanmış geçer.
 */
export const GATHER_PERIOD = 18;

export function gatherPulse(t: number): number {
  const phase = (((t / GATHER_PERIOD) % 1) + 1) % 1;
  return smoothstep(0.5, 0.58, phase) * (1 - smoothstep(0.72, 0.82, phase));
}

/* ---------------------------------------------------------------------------
   İzdüşüm — statik SVG fallback'in canvas ile aynı perspektifi kullanması için.
   --------------------------------------------------------------------------- */

/**
 * Düzlem noktasını normalize cihaz koordinatına taşır (-1..1, y yukarı).
 *
 * R3F'teki perspektif kamerayla aynı sırayı izler: X ekseninde eğim →
 * Y ekseninde dönüş → grup kaydırması → perspektif bölme. `aspect` ihmal
 * edilirse fallback, canvas'tan yatayda belirgin biçimde kayar — bu yüzden
 * parametre zorunlu.
 */
export function projectToNdc(
  x: number,
  y: number,
  z: number,
  aspect: number,
  variant: InkVariant,
): [number, number] {
  const cx = Math.cos(variant.rotation.x);
  const sx = Math.sin(variant.rotation.x);
  const y1 = y * cx - z * sx;
  const z1 = y * sx + z * cx;

  const cy = Math.cos(variant.rotation.y);
  const sy = Math.sin(variant.rotation.y);
  const x2 = x * cy + z1 * sy;
  const z2 = -x * sy + z1 * cy;

  const focal = 1 / Math.tan((variant.camera.fov * Math.PI) / 360);
  const depth = variant.camera.z - z2;

  return [
    ((x2 + offsetXFor(variant, aspect)) * focal) / aspect / depth,
    ((y1 + variant.offsetY) * focal) / depth,
  ];
}

/* ---------------------------------------------------------------------------
   Arayüz çerçevesi — "wireframe → arayüz" anı.
   Toparlanma sırasında yüzeyin üzerinde beliren bir ekran iskeleti: dış
   çerçeve, başlık şeridi, yan panel ve içerik satırları.
   --------------------------------------------------------------------------- */
const FRAME_BASE: readonly [number, number, number, number][] = [
  // dış çerçeve
  [-1.05, 0.6, 1.05, 0.6],
  [-1.05, -0.6, 1.05, -0.6],
  [-1.05, 0.6, -1.05, -0.6],
  [1.05, 0.6, 1.05, -0.6],
  // başlık şeridi
  [-1.05, 0.42, 1.05, 0.42],
  // yan panel ayırıcısı
  [-0.55, 0.42, -0.55, -0.6],
  // içerik satırları
  [-0.38, 0.2, 0.62, 0.2],
  [-0.38, 0.02, 0.86, 0.02],
  [-0.38, -0.16, 0.34, -0.16],
  // yan panel öğeleri
  [-0.92, 0.22, -0.68, 0.22],
  [-0.92, 0.04, -0.68, 0.04],
  [-0.92, -0.14, -0.68, -0.14],
];

export function frameSegments(variant: InkVariant): [number, number, number, number][] {
  const [sx, sy] = variant.frameScale;
  return FRAME_BASE.map(([x1, y1, x2, y2]) => [x1 * sx, y1 * sy, x2 * sx, y2 * sy]);
}

/* ===========================================================================
   GLSL — yukarıdaki TypeScript fonksiyonlarının birebir aynası.
   Biri değiştiğinde diğeri de değişmeli.

   Alan boyutları ve sönüm eşikleri uniform olarak geçilir; böylece iki
   varyant tek bir shader paylaşır.
   =========================================================================== */

export const INK_GLSL = /* glsl */ `
  uniform vec2 uField;
  uniform vec2 uFadeX;
  uniform vec2 uFadeY;

  vec2 inkWarp(vec2 p, float t) {
    return vec2(
      p.x + 0.30 * sin(p.y * 1.15 + t * 0.30),
      p.y + 0.30 * cos(p.x * 1.05 - t * 0.25)
    );
  }

  vec2 inkDrift(float t) {
    return vec2(sin(t * 0.17) * 0.75, cos(t * 0.13) * 0.42);
  }

  float inkElevation(vec2 p, float t) {
    vec2 w = inkWarp(p, t);
    vec2 d = inkDrift(t);

    float a = sin(w.x * 2.55 + t * 0.55) * cos(w.y * 2.10 - t * 0.42);
    float b = sin(w.x * 1.75 + w.y * 1.30 - t * 0.33);
    float c = sin(length(w - d) * 3.40 - t * 0.90);
    float base = a * 0.45 + b * 0.28 + c * 0.27;

    vec2 e = vec2((p.x - d.x) * 0.62, p.y - d.y);
    float envelope = exp(-dot(e, e) * 0.62);

    return base * (0.30 + 0.95 * envelope);
  }

  float inkFade(vec2 p) {
    float fx = 1.0 - smoothstep(uFadeX.x, uFadeX.y, abs(p.x) / uField.x);
    float fy = 1.0 - smoothstep(uFadeY.x, uFadeY.y, abs(p.y) / uField.y);
    return fx * fy;
  }
`;
