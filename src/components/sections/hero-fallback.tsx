import {
  fieldFor,
  frameSegments,
  inkDensity,
  inkElevation,
  inkFade,
  INK_VARIANTS,
  projectToNdc,
} from '@/lib/ink-field';

/**
 * Hero'nun statik karşılığı.
 *
 * İki durumda görünür: (1) canvas yüklenene kadar, (2) kullanıcı hareketin
 * azaltılmasını istediğinde kalıcı olarak. Bu yüzden "boş bir yer tutucu"
 * değil, bitmiş bir görsel olmak zorunda.
 *
 * Aynı alan fonksiyonu ve aynı perspektif izdüşümü kullanılır
 * (lib/ink-field.ts), yani benzeri değil birebir aynı kompozisyon — canvas
 * devraldığında görsel sıçrama olmaz. Zaman t=0'da dondurulmuş, toparlanma
 * oranı 0.42: arayüz çerçevesi okunur ama yüzey de donuk değil.
 *
 * Sunucu bileşeni: inline SVG olarak HTML'e gömülür, ağ isteği yoktur ve
 * ilk boyamada hazırdır.
 */
const VARIANT = INK_VARIANTS.hero;
const ASPECT = VARIANT.fallbackAspect;
const TIME = VARIANT.fallbackTime;
const GATHER = VARIANT.fallbackGather;
const FIELD = fieldFor(VARIANT, ASPECT);
const FRAME = frameSegments(VARIANT);

/** SVG görünüm kutusu. Oranı varyantın referans oranıyla aynı. */
const VIEW = { width: 1200, height: Math.round(1200 / ASPECT) };

/** NDC'den SVG piksel koordinatına. SVG'de y aşağı doğru artar. */
function toPixel(ndcX: number, ndcY: number): [number, number] {
  return [((ndcX + 1) / 2) * VIEW.width, ((1 - ndcY) / 2) * VIEW.height];
}

/** Yüzeydeki bir noktanın ekran konumu, sönümü ve mürekkep yoğunluğu. */
function sample(x: number, y: number, amplitude: number) {
  const elevation = inkElevation(x, y, TIME);
  const [ndcX, ndcY] = projectToNdc(x, y, elevation * amplitude, ASPECT, VARIANT);
  const [px, py] = toPixel(ndcX, ndcY);
  return { px, py, fade: inkFade(x, y, VARIANT, FIELD), density: inkDensity(elevation) };
}

export function HeroFallback({ className }: { className?: string }) {
  const { rows, cols, samples } = VARIANT.grid.fallback;
  const { halfWidth: hw, halfHeight: hh } = FIELD;
  const amplitude = VARIANT.amplitude * (1 - GATHER) + VARIANT.amplitude * 0.05 * GATHER;

  /**
   * Her grid çizgisi, boyunca değişen opaklığı taşıyabilmek için birkaç
   * parçaya bölünür.
   *
   * İlk hali parça başına ayrı <path> üretiyordu ve sayfa HTML'ini 173 KB'ye
   * çıkarıyordu (RSC yükü işaretlemeyi bir kez daha taşıyor). İkinci hali
   * çizgi başına tek opaklık kullanıyordu — ucuzdu ama kenar sönümünü
   * siliyordu ve çizgiler ekranın kenarında aniden kesiliyordu.
   *
   * Beş parça ikisinin arasını tutuyor: sönüm geri geldi, HTML küçük kaldı.
   * Koordinatlar tam sayıya yuvarlanır; 1200×760 kutuda alt piksel farkı
   * göze görünmüyor.
   */
  const CHUNKS = 5;
  const lines: { points: string; opacity: number; accent: boolean }[] = [];

  function addLine(at: (progress: number) => [number, number]) {
    const points = Array.from({ length: samples }, (_, i) =>
      sample(...at(i / (samples - 1)), amplitude),
    );

    const perChunk = Math.ceil((samples - 1) / CHUNKS);

    for (let chunk = 0; chunk < CHUNKS; chunk += 1) {
      const from = chunk * perChunk;
      const to = Math.min(from + perChunk, samples - 1);
      if (from >= to) continue;

      const slice = points.slice(from, to + 1);
      const fade = slice.reduce((sum, point) => sum + point.fade, 0) / slice.length;
      const density = slice.reduce((sum, point) => sum + point.density, 0) / slice.length;
      const opacity = fade * (0.42 + 0.58 * density) * (1 - 0.42 * GATHER);

      // Görünmeyecek kadar sönük parçalar HTML'e hiç yazılmaz.
      if (opacity <= 0.03) continue;

      lines.push({
        points: slice.map((point) => `${Math.round(point.px)},${Math.round(point.py)}`).join(' '),
        opacity,
        accent: density > 0.45,
      });
    }
  }

  for (let r = 0; r < rows; r += 1) {
    const y = -hh + (2 * hh * r) / (rows - 1);
    addLine((p) => [-hw + 2 * hw * p, y]);
  }
  for (let c = 0; c < cols; c += 1) {
    const x = -hw + (2 * hw * c) / (cols - 1);
    addLine((p) => [x, -hh + 2 * hh * p]);
  }

  return (
    <svg
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="var(--line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {lines.map((line, index) => (
          <polyline key={index} points={line.points} opacity={line.opacity.toFixed(2)} />
        ))}
      </g>

      {/* Arayüz çerçevesi — toparlanmanın görünür olduğu an. */}
      <g fill="none" stroke="var(--accent)" strokeWidth="1.25" vectorEffect="non-scaling-stroke">
        {FRAME.map(([x1, y1, x2, y2], index) => {
          const a = sample(x1, y1, amplitude);
          const b = sample(x2, y2, amplitude);
          return (
            <line
              key={index}
              x1={a.px.toFixed(1)}
              y1={a.py.toFixed(1)}
              x2={b.px.toFixed(1)}
              y2={b.py.toFixed(1)}
              opacity={(GATHER * 0.9).toFixed(2)}
            />
          );
        })}
      </g>
    </svg>
  );
}
