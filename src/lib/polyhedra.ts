/**
 * ===========================================================================
 * İç içe geçmiş tel kafes küpler — geometri ve mürekkep zamanlaması
 * ---------------------------------------------------------------------------
 * Referans: Zach Lieberman, "Wireframe Ink" — dönen 3B tel kafes çokyüzlüler
 * ve kenarlar boyunca ilerleyen mürekkep fırça darbeleri.
 *
 * Buradaki yorum: üç küp iç içe geçiyor, her biri kendi ekseninde dönüyor ve
 * köşeleri birbirine bağlanıyor. İnce çizgiler yapıyı (tel kafes) gösteriyor,
 * mürekkep darbeleri ise kenarları tek tek "boyuyor". Felsefe bölümündeki
 * "her fikrin bir arayüze ihtiyacı var" cümlesinin görsel karşılığı:
 * aynı iskelet, üzerine çekilen mürekkeple okunur hale geliyor.
 *
 * Çizim 2B canvas ile yapılıyor, WebGL ile değil: fırça darbesinin uçlara
 * doğru incelmesi, yayılma ve çok geçişli mürekkep etkisi 2B'de hem daha
 * kolay hem daha ucuz. Hero zaten bir WebGL bağlamı tutuyor; ikincisi
 * açılmıyor.
 * ===========================================================================
 */

export type Vec3 = readonly [number, number, number];

const CUBE_VERTICES: readonly Vec3[] = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

const CUBE_EDGES: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

/**
 * Üç kabuk. Ölçekler ve başlangıç açıları, küplerin köşelerinin birbirinin
 * yüzeyinden geçeceği şekilde seçildi — "iç içe geçmiş" görüntüsü buradan
 * geliyor, basit bir küçültmeden değil.
 */
export interface Shell {
  scale: number;
  /** Başlangıç açıları (radyan). */
  tilt: Vec3;
  /** Kendi ekseninde dönüş hızları — her kabuk farklı hızda dönsün. */
  spin: Vec3;
  /** İnce çizginin taban opaklığı. */
  hairline: number;
  /** Bu kabuğun çizgileri vurgu renginde mi? Yalnızca en içteki. */
  accent: boolean;
}

export const SHELLS: readonly Shell[] = [
  {
    scale: 1,
    tilt: [0, 0, 0],
    spin: [0.055, 0.085, 0],
    hairline: 0.55,
    accent: false,
  },
  {
    scale: 0.76,
    tilt: [Math.PI / 4, Math.PI / 4, 0],
    spin: [-0.07, 0.05, 0.03],
    hairline: 0.62,
    accent: false,
  },
  {
    scale: 0.54,
    tilt: [0, Math.PI / 4, Math.PI / 4],
    spin: [0.09, -0.11, 0],
    hairline: 0.56,
    accent: true,
  },
];

export interface Edge {
  /** Kabuk indeksleri — eşitse kabuk içi kenar, farklıysa bağlayıcı. */
  shellA: number;
  shellB: number;
  vertexA: number;
  vertexB: number;
  /** Bağlayıcı kenarlar daha sönük çizilir. */
  connector: boolean;
}

/**
 * Tüm kenarlar: her kabuğun 12 kenarı + ardışık kabukların karşılıklı
 * köşelerini birleştiren 8'er bağlayıcı. Toplam 52 kenar.
 */
export const EDGES: readonly Edge[] = [
  ...SHELLS.flatMap((_, shell) =>
    CUBE_EDGES.map(([a, b]) => ({
      shellA: shell,
      shellB: shell,
      vertexA: a,
      vertexB: b,
      connector: false,
    })),
  ),
  ...SHELLS.slice(0, -1).flatMap((_, shell) =>
    CUBE_VERTICES.map((_vertex, index) => ({
      shellA: shell,
      shellB: shell + 1,
      vertexA: index,
      vertexB: index,
      connector: true,
    })),
  ),
];

/** Bir kabuğun köşesinin, verilen anda dünya koordinatındaki yeri. */
export function shellVertex(shellIndex: number, vertexIndex: number, time: number): Vec3 {
  const shell = SHELLS[shellIndex];
  const vertex = CUBE_VERTICES[vertexIndex];
  if (!shell || !vertex) return [0, 0, 0];

  const [rx, ry, rz] = [
    shell.tilt[0] + shell.spin[0] * time,
    shell.tilt[1] + shell.spin[1] * time,
    shell.tilt[2] + shell.spin[2] * time,
  ];

  let [x, y, z] = [vertex[0] * shell.scale, vertex[1] * shell.scale, vertex[2] * shell.scale];

  // X → Y → Z sırasıyla döndür.
  let c = Math.cos(rx);
  let s = Math.sin(rx);
  [y, z] = [y * c - z * s, y * s + z * c];

  c = Math.cos(ry);
  s = Math.sin(ry);
  [x, z] = [x * c + z * s, -x * s + z * c];

  c = Math.cos(rz);
  s = Math.sin(rz);
  [x, y] = [x * c - y * s, x * s + y * c];

  return [x, y, z];
}

/* ---------------------------------------------------------------------------
   Mürekkep zamanlaması
   --------------------------------------------------------------------------- */

/** Bir kenarın mürekkep döngüsündeki başlangıç anını belirleyen sabit karışım. */
export function edgeSeed(index: number): number {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export const INK_CYCLE = 13;
const PAINT = 1.4;
const HOLD = 2.8;
const FADE = 1.8;

export interface InkState {
  /** Darbenin kenar boyunca ne kadar ilerlediği, 0–1. */
  progress: number;
  /** Darbenin görünürlüğü, 0–1. */
  alpha: number;
}

/**
 * Kenara özgü mürekkep gücü.
 *
 * Tüm darbeler aynı koyulukta olduğunda kompozisyon düzleşiyor ve ağır
 * görünüyor. Referansta bazı darbeler koyu, bazıları gri — derinliği bu
 * fark veriyor. Değer kenar başına sabit, yani bir darbe her döngüde aynı
 * ağırlıkta çiziliyor.
 */
export function inkStrength(edgeIndex: number): number {
  return 0.42 + 0.58 * edgeSeed(edgeIndex * 7 + 3);
}

/**
 * Bir kenarın o andaki mürekkep durumu.
 *
 * Her kenar kendi sabit gecikmesiyle döngüye girer: önce boyanır (uçtan uca
 * ilerler), bir süre durur, sonra solar. Döngünün yaklaşık %46'sı boyalı
 * geçtiği için her an kenarların yarıya yakını mürekkepli olur — referanstaki
 * "bazı kenarlar boyalı, bazıları çizgi" dengesini veren oran bu.
 */
export function inkState(edgeIndex: number, time: number): InkState | null {
  const offset = edgeSeed(edgeIndex) * INK_CYCLE;
  const local = (((time - offset) % INK_CYCLE) + INK_CYCLE) % INK_CYCLE;

  if (local > PAINT + HOLD + FADE) return null;

  const progress = Math.min(local / PAINT, 1);
  const alpha =
    local <= PAINT + HOLD ? Math.min(local / (PAINT * 0.4), 1) : 1 - (local - PAINT - HOLD) / FADE;

  return { progress, alpha: Math.max(alpha, 0) };
}

function smoothstep01(edge0: number, edge1: number, value: number): number {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/**
 * Fırça genişliği profili.
 *
 * İlk hali `sin(πt)` eğrisiydi; iki uçta da sıfıra indiği için darbeler
 * fırçaya değil merceğe benziyordu. Gerçek bir fırça darbesinde kıl hızla
 * açılır, uzun bir bölümde sabit genişlikte kalır ve kaldırılırken yavaşça
 * incelir — profil de bunu izliyor: hızlı giriş, düz plato, yumuşak çıkış.
 */
export function brushWidth(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  const enter = smoothstep01(0, 0.06, clamped);
  // Uçlar tamamen incelmez: %45 genişlikte kalır. Sıfıra inen uç, darbeyi
  // fırçaya değil merceğe benzetiyordu.
  const exit = 1 - smoothstep01(0.7, 1, clamped) * 0.55;
  return enter * exit;
}

/**
 * Kıl düzensizliği: darbenin genişliği boyunca küçük dalgalanmalar.
 * Kenarları matematiksel olmaktan çıkarıp elle çekilmiş hissi verir.
 */
export function bristleNoise(edgeIndex: number, t: number): number {
  const seed = edgeSeed(edgeIndex) * 12.9898;
  return 1 + 0.14 * Math.sin(t * 23.3 + seed) + 0.08 * Math.sin(t * 41.7 - seed * 1.7);
}

/** Elle çizilmiş hissi için kenara dik, sabit ama düzensiz sapma. */
export function brushJitter(edgeIndex: number, t: number): number {
  const seed = edgeSeed(edgeIndex) * 6.283;
  return Math.sin(t * 5.1 + seed) * 0.6 + Math.sin(t * 11.3 + seed * 2.1) * 0.4;
}
