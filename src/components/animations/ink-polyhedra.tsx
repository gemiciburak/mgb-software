'use client';

import { useInView } from 'motion/react';
import { useEffect, useRef } from 'react';
import { useDocumentVisibility } from '@/hooks/use-document-visibility';
import { useIsTouch } from '@/hooks/use-is-touch';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/cn';
import {
  bristleNoise,
  brushJitter,
  brushWidth,
  EDGES,
  inkState,
  inkStrength,
  shellVertex,
  SHELLS,
  type Vec3,
} from '@/lib/polyhedra';

/* ---------------------------------------------------------------------------
   Sahne sabitleri
   --------------------------------------------------------------------------- */

const CAMERA_Z = 4.2;
const FOCAL = 2.6;
/** Fırça darbesi başına örnek sayısı. Az olursa darbe köşeli görünüyor. */
const BRUSH_SAMPLES = 16;
/** İmlecin döndürebileceği azami açı (radyan). */
const POINTER_RANGE = { x: 0.5, y: 0.32 } as const;
/**
 * Durağan kare: kompozisyonun yeterince mürekkeplendiği ve küplerin iyi bir
 * açıda durduğu an (sn). Hareket azaltmada kalıcı kare, döngüde başlangıç anı.
 */
const REST_TIME = 6.2;

const PALETTE = {
  dark: { hairline: '126, 139, 166', ink: '244, 245, 247', accent: '88, 136, 255', maxInk: 0.9 },
  light: { hairline: '132, 129, 118', ink: '13, 16, 21', accent: '31, 70, 224', maxInk: 0.9 },
} as const;

type Projected = { x: number; y: number; depth: number };

/* ---------------------------------------------------------------------------
   Bileşen
   --------------------------------------------------------------------------- */

/**
 * İç içe geçmiş tel kafes küpler, kenarları mürekkeple boyanan.
 *
 * Üç küp iç içe döner; köşeleri birbirine bağlıdır. İnce çizgiler iskeleti
 * gösterir, mürekkep darbeleri kenarları sırayla boyar ve solar. İmleç
 * yaklaştıkça kompozisyon ona doğru eğilir.
 *
 * Döngü yalnızca bölüm ekrandayken ve sekme görünürken çalışır. Hareket
 * azaltma açıkken tek bir kare çizilir ve döngü hiç başlamaz — durağan ama
 * bitmiş bir görsel kalır.
 */
export function InkPolyhedra({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { resolved } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouch();
  const documentVisible = useDocumentVisibility();
  const isInView = useInView(containerRef, { amount: 0.15 });

  // İmleç hedefi ve yumuşatılmış hâli; render döngüsünün dışında tutulur ki
  // her fare hareketi React render'ı tetiklemesin.
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointerSmooth = useRef({ x: 0, y: 0 });
  /**
   * Animasyon saati effect'in DIŞINDA tutulur. Effect her görünürlük
   * değişiminde yeniden kurulduğu için saat içeride olsaydı bölüme her dönüşte
   * sıfırdan başlıyor, ekrandan çıkarken de sabit kareye atlıyordu — kısmen
   * görünür durumdayken ikisi de gözle görülür bir sıçramaydı. Artık döngü
   * kaldığı yerden sürer ve durunca son karede donar. Durağan kareden
   * başlar ki ilk görünen kareyle döngünün ilk karesi aynı olsun.
   */
  const clock = useRef(REST_TIME);

  const active = isInView && documentVisible && !reducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const palette = PALETTE[resolved];
    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas || !container || !context) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /** Dünya noktasını ekran koordinatına taşır. */
    function project(point: Vec3, scale: number, tiltX: number, tiltY: number): Projected {
      let [x, y, z] = point;

      // İmleç eğimi — tüm kompozisyona uygulanır, kabuklara ayrı ayrı değil.
      let c = Math.cos(tiltX);
      let s = Math.sin(tiltX);
      [y, z] = [y * c - z * s, y * s + z * c];
      c = Math.cos(tiltY);
      s = Math.sin(tiltY);
      [x, z] = [x * c + z * s, -x * s + z * c];

      const depth = CAMERA_Z - z;
      const k = (FOCAL / depth) * scale;
      return { x: width / 2 + x * k, y: height / 2 - y * k, depth };
    }

    /**
     * Uzaklığa göre sönüm: arkadaki çizgiler geri çekilir.
     * Aralık bilinçli olarak dar ve tabanı yüksek — geniş bir aralıkta
     * mürekkep darbelerinin yarısı soluk kalıyor ve "duman" gibi görünüyordu.
     */
    function depthFade(depth: number): number {
      return Math.min(Math.max((CAMERA_Z + 1.7 - depth) / 2, 0.42), 1);
    }

    function draw(time: number) {
      if (!context) return;
      context.clearRect(0, 0, width, height);

      // Kompozisyon kısa kenara göre ölçeklenir; her oranda aynı doluluk.
      // 0.43 tavan: figürün yüksekliği ≈ 2.14 × scale, kutuyu taşmamalı.
      const scale = Math.min(width, height) * 0.43;
      const tiltX = pointerSmooth.current.y * POINTER_RANGE.y;
      const tiltY = pointerSmooth.current.x * POINTER_RANGE.x;

      // Köşeleri bir kez hesapla; kenarlar bunları paylaşıyor.
      const points = SHELLS.map((_, shellIndex) =>
        Array.from({ length: 8 }, (_unused, vertexIndex) =>
          project(shellVertex(shellIndex, vertexIndex, time), scale, tiltX, tiltY),
        ),
      );

      // 1) Tel kafes — tüm kenarlar ince çizgi olarak.
      context.lineCap = 'butt';
      context.lineWidth = 1;

      for (const edge of EDGES) {
        const a = points[edge.shellA]?.[edge.vertexA];
        const b = points[edge.shellB]?.[edge.vertexB];
        if (!a || !b) continue;

        const shell = SHELLS[edge.shellA];
        const fade = (depthFade(a.depth) + depthFade(b.depth)) / 2;
        // Bağlayıcılar yapıyı okutur ama öne çıkmamalı.
        const base = (shell?.hairline ?? 0.4) * (edge.connector ? 0.45 : 1);
        const color = shell?.accent ? palette.accent : palette.hairline;

        context.strokeStyle = `rgba(${color}, ${(base * fade).toFixed(3)})`;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }

      // 2) Mürekkep darbeleri — uzaktan yakına, ki öndekiler üstte kalsın.
      const strokes = EDGES.map((edge, index) => ({ edge, index, ink: inkState(index, time) }))
        .filter((item) => item.ink !== null)
        .sort((first, second) => {
          const firstDepth = points[first.edge.shellA]?.[first.edge.vertexA]?.depth ?? 0;
          const secondDepth = points[second.edge.shellA]?.[second.edge.vertexA]?.depth ?? 0;
          return secondDepth - firstDepth;
        });

      for (const { edge, index, ink } of strokes) {
        // Bağlayıcılar yapıyı okutur ama boyanmaz: uzun köşegen darbeler
        // kompozisyonu yıldız patlamasına çeviriyordu.
        if (!ink || edge.connector) continue;
        const start = points[edge.shellA]?.[edge.vertexA];
        const end = points[edge.shellB]?.[edge.vertexB];
        if (!start || !end) continue;

        const fade = (depthFade(start.depth) + depthFade(end.depth)) / 2;
        const alpha = ink.alpha * fade * palette.maxInk * inkStrength(index);
        if (alpha < 0.01) continue;

        // Kenara dik birim vektör — fırça genişliği bu yönde açılır.
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.hypot(dx, dy) || 1;
        const nx = -dy / length;
        const ny = dx / length;

        const maxWidth = Math.max(scale * 0.062, 4);

        // İki geçiş: geniş ve sönük "yayılma", üstüne dar ve koyu "öz".
        for (const pass of [
          { widthScale: 1.4, alphaScale: 0.2 },
          { widthScale: 1, alphaScale: 1 },
        ]) {
          context.beginPath();

          const forward: [number, number][] = [];
          const backward: [number, number][] = [];

          for (let i = 0; i <= BRUSH_SAMPLES; i += 1) {
            const t = (i / BRUSH_SAMPLES) * ink.progress;
            const px = start.x + dx * t;
            const py = start.y + dy * t;

            // Darbe, boyanan kısmın içinde kendi profiline göre incelir.
            const local = ink.progress > 0 ? t / ink.progress : 0;
            const profile = brushWidth(local) * bristleNoise(index, local);
            const half = (maxWidth * pass.widthScale * profile) / 2;
            const wobble = brushJitter(index, t) * maxWidth * 0.18;

            forward.push([px + nx * (half + wobble), py + ny * (half + wobble)]);
            backward.push([px - nx * (half - wobble), py - ny * (half - wobble)]);
          }

          const first = forward[0];
          if (!first) continue;
          context.moveTo(first[0], first[1]);
          for (const [x, y] of forward.slice(1)) context.lineTo(x, y);
          for (const [x, y] of backward.reverse()) context.lineTo(x, y);
          context.closePath();

          context.fillStyle = `rgba(${palette.ink}, ${(alpha * pass.alphaScale).toFixed(3)})`;
          context.fill();
        }
      }
    }

    resize();

    const observer = new ResizeObserver(() => {
      resize();
      // Yeniden boyutlandıktan sonra tek kare çiz: döngü kapalıysa da dolu kalsın.
      draw(reducedMotion ? REST_TIME : clock.current);
    });
    observer.observe(container);

    // Hareket azaltma: tek bir kare, döngü yok.
    if (reducedMotion) {
      draw(REST_TIME);
      return () => observer.disconnect();
    }

    let frame = 0;
    let lastTime = performance.now();

    function loop(now: number) {
      // Döngü duraklatılıp sürdürüldüğünde animasyon sıçramasın.
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      clock.current += delta;

      pointerSmooth.current.x += (pointerTarget.current.x - pointerSmooth.current.x) * 0.06;
      pointerSmooth.current.y += (pointerTarget.current.y - pointerSmooth.current.y) * 0.06;

      draw(clock.current);
      frame = requestAnimationFrame(loop);
    }

    if (active) {
      frame = requestAnimationFrame(loop);
    } else {
      draw(clock.current);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [resolved, reducedMotion, active]);

  // İmleç takibi yalnızca hassas işaretleyicide ve hareket açıkken.
  useEffect(() => {
    if (isTouch || reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    function handlePointerMove(event: PointerEvent) {
      if (!container) return;
      const bounds = container.getBoundingClientRect();
      pointerTarget.current = {
        x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        y: ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
      };
    }

    function handlePointerLeave() {
      pointerTarget.current = { x: 0, y: 0 };
    }

    // Pencere üzerinden dinlenir: imleç kutunun dışındayken de kompozisyon
    // ona doğru hafifçe yönelsin, kutuya girince ani sıçrama olmasın.
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [isTouch, reducedMotion]);

  return (
    <div ref={containerRef} className={cn('relative', className)} aria-hidden="true">
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
