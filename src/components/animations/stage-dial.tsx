'use client';

import { AnimatePresence, motion, useTransform, type MotionValue } from 'motion/react';
import { type KeyboardEvent, type PointerEvent, useId, useRef } from 'react';
import { DURATION, EASE_ENTRANCE } from '@/lib/motion';

export const STEPS = 4;

/* ---------------------------------------------------------------------------
   Kadran geometrisi

   Yay tam daire değil: altta ~60°'lik bir boşluk var ve etiket oraya oturuyor.
   Amfi düğmelerinin kadranı böyledir — boşluk "başlangıç ve bitiş burada"
   demenin en kısa yolu, ayrıca halkayı bir ilerleme çemberi olmaktan çıkarıp
   bir ölçek yapar.
   --------------------------------------------------------------------------- */

const TICKS = 61;
const ARC_START = -150;
const ARC_SWEEP = 300;

const CENTER = 120;
const R_TICK_OUT = 104;
const R_TICK_IN = 90;
/** Kademe sınırlarındaki uzun çentikler. */
const R_STEP_IN = 82;
/** Maskeyi çentik bandının tamamını örtecek kadar kalın tutar. */
const R_MASK = 95;
const MASK_WIDTH = 28;
const R_DISC = 62;
/** İğne ölçeğin dışında durur ve viewBox kenarını aşmaz (merkez 120). */
const R_NEEDLE_IN = 108;
const R_NEEDLE_OUT = 113;
const R_NEEDLE_DOT = 117;

/** 12 yönü sıfır, saat yönü pozitif. */
function point(degrees: number, radius: number) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return [CENTER + Math.cos(radians) * radius, CENTER + Math.sin(radians) * radius] as const;
}

function tickAngle(index: number) {
  return ARC_START + (index / (TICKS - 1)) * ARC_SWEEP;
}

/** Yayın kendisi — hem maske hem ince gösterge aynı yolu kullanır. */
function arcPath(radius: number) {
  const [sx, sy] = point(ARC_START, radius);
  const [ex, ey] = point(ARC_START + ARC_SWEEP, radius);
  // 300° > 180° → large-arc 1, saat yönü → sweep 1.
  return `M ${sx} ${sy} A ${radius} ${radius} 0 1 1 ${ex} ${ey}`;
}

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/** Bir açı değerini, o açıdaki noktanın x/y motion değerlerine çevirir. */
function usePolar(angle: MotionValue<number>, radius: number) {
  const x = useTransform(angle, (degrees) => point(degrees, radius)[0]);
  const y = useTransform(angle, (degrees) => point(degrees, radius)[1]);
  return { x, y };
}

/**
 * Kademe düğmesi.
 *
 * Bir ilerleme çemberi değil, çevrilebilir bir düğme: sürükleyerek veya ok
 * tuşlarıyla kademeler arasında gezilebiliyor. Üç şey aynı anda okunuyor —
 * halkada kaç çentik mürekkeplendi (kaba), ince yay nerede (sürekli), iğne
 * hangi açıda (konum).
 *
 * Çentiklerin dolması React'le DEĞİL maskeyle yapılıyor. Altmış bir çentiği
 * her scroll karesinde yeniden render etmek pahalı; bunun yerine halka iki kez
 * çiziliyor (soluk ve mürekkep) ve mürekkepli kopya `pathLength`'i scroll'a
 * bağlı bir yay maskesiyle kırpılıyor. Sonuç tarayıcı tarafında, kare başına
 * tek bir sayı güncellemesiyle çıkıyor.
 *
 * Erişilebilirlik: dekoratif bir süs değil, gerçek bir kontrol — `role="slider"`,
 * ok tuşlarıyla kademe değiştirir, `aria-valuetext` o kademenin adını söyler.
 * Kontrolü çevirmek sayfayı ilgili noktaya kaydırır, yani scroll konumu tek
 * doğruluk kaynağı olarak kalır ve iki ayrı durum birbiriyle yarışmaz.
 */
export function StageDial({
  step,
  progress,
  labels,
  title,
  onScrub,
  reducedMotion,
}: {
  step: number;
  /** 0 → 1 arası, kademelerin tamamına yayılmış. */
  progress: MotionValue<number>;
  /** Kademe adları; merkezin altındaki etiket buradan gelir. */
  labels: readonly string[];
  /** Kontrolün erişilebilir adı. */
  title: string;
  /**
   * Sürükleme ve ok tuşları bunu çağırır: 0 → 1. Sürüklemede `instant` true —
   * kaydırma imleci anında izlemeli; ok tuşlarında kademeye yumuşakça gidilir.
   */
  onScrub: (progress: number, instant: boolean) => void;
  reducedMotion: boolean;
}) {
  const maskId = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  /**
   * İğne CSS `rotate` ile döndürülmüyor, uçları doğrudan hesaplanıyor.
   *
   * motion SVG bileşenlerine `transform-box: fill-box` veriyor; o yüzden
   * `transform-origin: 120px 120px` kadranın merkezine değil İĞNENİN KENDİ
   * minik sınır kutusuna göre çözülüyordu. Sonuç: iğne kadranın etrafında
   * dönmek yerine kendi ekseninde dönüyor, yani yerinde sayıyordu (ölçüldü:
   * imleç ±120°'ye gitse de iğne ±2°'de kalıyordu).
   *
   * Kutupsal koordinatta bu belirsizlik yok — hangi yarıçapta hangi açıda
   * olduğu tek bir yerde tanımlı.
   */
  const needleAngle = useTransform(progress, (value) => ARC_START + value * ARC_SWEEP);
  const needleInner = usePolar(needleAngle, R_NEEDLE_IN);
  const needleOuter = usePolar(needleAngle, R_NEEDLE_OUT);
  const needleDot = usePolar(needleAngle, R_NEEDLE_DOT);

  function progressFromPointer(event: PointerEvent<HTMLDivElement>) {
    const frame = frameRef.current;
    if (!frame) return null;

    const rect = frame.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);

    // atan2 saat 3'ten başlar; +90 ile sıfırı saat 12'ye alıp -180..180'e indiriyoruz.
    let degrees = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (degrees > 180) degrees -= 360;

    return clamp01((degrees - ARC_START) / ARC_SWEEP);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const next = progressFromPointer(event);
    if (next === null) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onScrub(next, true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const next = progressFromPointer(event);
    if (next !== null) onScrub(next, true);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = {
      ArrowRight: step + 1,
      ArrowUp: step + 1,
      ArrowLeft: step - 1,
      ArrowDown: step - 1,
      Home: 0,
      End: STEPS,
    };
    const target = moves[event.key];
    if (target === undefined) return;

    event.preventDefault();
    onScrub(Math.min(Math.max(target, 0), STEPS) / STEPS, false);
  }

  const ticks = Array.from({ length: TICKS }, (_, index) => {
    const angle = tickAngle(index);
    const isStepMark = index % ((TICKS - 1) / STEPS) === 0;
    const [x1, y1] = point(angle, isStepMark ? R_STEP_IN : R_TICK_IN);
    const [x2, y2] = point(angle, R_TICK_OUT);
    return { key: index, x1, y1, x2, y2, isStepMark };
  });

  return (
    <div
      ref={frameRef}
      role="slider"
      tabIndex={0}
      aria-label={title}
      aria-valuemin={0}
      aria-valuemax={STEPS}
      aria-valuenow={step}
      aria-valuetext={step === 0 ? `0 / ${STEPS}` : `${step} / ${STEPS} — ${labels[step - 1]}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      className="relative mx-auto aspect-square w-full max-w-[20rem] cursor-grab touch-none rounded-full select-none active:cursor-grabbing"
    >
      <svg viewBox="0 0 240 240" fill="none" aria-hidden="true" className="size-full">
        <defs>
          {/* Maske: yay büyüdükçe altındaki mürekkepli çentikler açığa çıkar. */}
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <motion.path
              d={arcPath(R_MASK)}
              stroke="#fff"
              strokeWidth={MASK_WIDTH}
              fill="none"
              style={{ pathLength: progress }}
            />
          </mask>
        </defs>

        {/* Soluk ölçek — her zaman tam. */}
        <g>
          {ticks.map((tick) => (
            <line
              key={tick.key}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              strokeWidth={1}
              className={tick.isStepMark ? 'stroke-line-strong' : 'stroke-line'}
            />
          ))}
        </g>

        {/* Mürekkeplenmiş ölçek — aynı çentikler, yay kadarı görünür. */}
        <g mask={`url(#${maskId})`}>
          {ticks.map((tick) => (
            <line
              key={tick.key}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              strokeWidth={tick.isStepMark ? 2 : 1.6}
              className="stroke-fg"
            />
          ))}
        </g>

        {/* Merkez diski. Referanstaki cam kubbenin karşılığı: parlaklık yok,
            üst kenarda tek bir ince yay kavisi ima ediyor. */}
        <circle cx={CENTER} cy={CENTER} r={R_DISC} className="fill-surface stroke-line" />
        <path
          d={`M ${CENTER - 38} ${CENTER - 36} A 52 52 0 0 1 ${CENTER + 38} ${CENTER - 36}`}
          strokeWidth={1}
          className="stroke-line"
        />

        {/* İğne — ölçeğin DIŞINDA duran kısa bir işaret, çentiklerin üstünü
            çizmiyor. Referanstaki küçük turuncu göstergenin karşılığı; tek
            vurgu rengi kadranda yalnızca burada görünüyor. */}
        <g>
          <motion.line
            x1={needleInner.x}
            y1={needleInner.y}
            x2={needleOuter.x}
            y2={needleOuter.y}
            strokeWidth={2}
            className="stroke-accent"
          />
          <motion.circle cx={needleDot.x} cy={needleDot.y} r={2} className="fill-accent" />
        </g>
      </svg>

      {/* Sayaç ve kademe adı. Değer değişince eskisi yukarı çıkar, yenisi
          aşağıdan girer — hareket eden tek şey DEĞİŞEN değer. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {/* `relative` şart: `overflow-hidden` mutlak konumlu bir torunu ancak
            kendisi konumlandırılmışsa kırpar. Yoksa çıkan sayı maskeden kaçıp
            alttaki "/ 04" etiketinin üstüne biniyordu. `popLayout` da bu yüzden
            kullanılmıyor — çıkan öğeyi absolute yaparak akıştan koparıyordu;
            varsayılan modda iki değer aynı ızgara hücresinde üst üste durur. */}
        <span className="relative grid overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.span
              key={step}
              initial={reducedMotion ? false : { y: '-110%' }}
              animate={{ y: '0%' }}
              exit={reducedMotion ? undefined : { y: '110%' }}
              transition={{ duration: reducedMotion ? 0 : DURATION.base, ease: EASE_ENTRANCE }}
              className="col-start-1 row-start-1 font-display text-display-2 tabular-nums"
            >
              {String(step).padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="mt-0.5 font-mono text-mono-sm text-fg-subtle tabular-nums">
          / {String(STEPS).padStart(2, '0')}
        </span>
      </div>

      {/* Yayın alt boşluğundaki etiket — referanstaki "LOW"un yeri.
          Türkçede CSS ile büyütmüyoruz: `uppercase` "i"yi "I" yapar. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[9%] flex justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={step}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : DURATION.fast }}
            className="font-mono text-mono-sm whitespace-nowrap text-fg-muted"
          >
            {step === 0 ? '—' : labels[step - 1]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
