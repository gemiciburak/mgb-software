'use client';

import { useInView } from 'motion/react';
import { type CSSProperties, type MouseEvent, type PointerEvent, useEffect, useRef } from 'react';
import type { Locale, Project } from '@/shared';
import { useDocumentVisibility } from '@/hooks/use-document-visibility';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/cn';

/**
 * Halkadaki en az kart sayısı. Az tutuldu: projeler azken çok sayıda boş kart
 * stüdyoyu olduğundan eksik gösteriyordu. Seyrekliği kart boyutu kapatır
 * (`--r` = `--s` / 1.35).
 */
const MIN_SLOTS = 16;
/** Proje + "Yakında" kartlarından oluşan temel dizinin uzunluğu. */
const BASE_ITEMS = 8;
/** Otomatik dönüş hızı (derece/sn) — bir kart ~2 sn'de önden geçer. */
const SPEED = 15;
/** İmleç sahnedeyken hız bu orana iner: tıklamak isteyen kartı yakalayabilsin. */
const HOVER_FACTOR = 0.22;
/** Kart kalınlığı (kart boyuna oranla). */
const THICKNESS = 0.06;
/** Köşe yarıçapı (kart boyuna oranla) — yüzlerdeki `rounded-[22%]` ile aynı. */
const CORNER = 0.22;
/** Her köşe yayını izleyen düz duvar parçası sayısı. */
const ARC_SEGMENTS = 4;
/** Öne çıkan kartın üst katmandaki kopyası bu `pop` değerinde tam opak olur. */
const OVERLAY_FADE = 0.3;
/**
 * Üzerine gelinen kartın öne çıkışı: büyür, izleyiciye doğru döner (açının
 * bu oranı kadar) ve yarıçap cinsinden bu kadar öne gelir. Öne geldiği için
 * komşularının üstünde kalır.
 */
const POP = { scale: 0.26, turn: 0.6, lift: 0.5 } as const;
/**
 * Öne çıkan kartın komşularını yana iten açı (derece). Dock büyütmesi gibi:
 * itme uzaklıkla azalır, kartların sırası hiç değişmez; kart öne çıkarken
 * komşuları ona yer açar.
 */
const PUSH = 36;
/** İtmenin sıfıra indiği açısal uzaklık (derece). */
const PUSH_REACH = 100;
/** İlk karede ilk kartın açısı: önde, hafif solda — yüzü okunur durumda. */
const START_ANGLE = -38;
/** Bu kadar pikselden fazla sürüklenirse bırakınca tıklama sayılmaz. */
const DRAG_THRESHOLD = 6;
/** Bırakıştaki atalet hızının üst sınırı (derece/sn) — sert savuruşta deste fırıl dönmesin. */
const MAX_FLING = 160;

/**
 * Kartın yan duvarları: sol ve sağ düz kenar ve dört köşe yayını izleyen
 * parçalar. Her parça kartın yüzüne dik, kalınlık kadar derin bir şerittir;
 * iki yüzle birlikte kapalı bir katı oluşturur.
 *
 * Önceden kalınlık yüzün arkasına dizilmiş ince katmanlardan oluşuyordu. Kart
 * tam profile geldiği an bütün katmanlar kameraya göre sıfır genişliğe iniyor,
 * kart bir an kayboluyordu. Duvarlar ise o an tam kameraya bakar; profil dolu
 * bir çubuk olarak görünür. Üst ve alt düz kenar kamera kart hizasında olduğu
 * için hiç görünmez, eklenmedi.
 *
 * Değerler kart boyu cinsinden: orta nokta (x, y), uzunluk ve yüzdeki açı.
 */
const WALLS = (() => {
  const walls = [
    { x: 0, y: 0.5, length: 1 - 2 * CORNER, angle: 0 },
    { x: 1, y: 0.5, length: 1 - 2 * CORNER, angle: 0 },
  ];
  const centers = [
    [1 - CORNER, 1 - CORNER],
    [CORNER, 1 - CORNER],
    [CORNER, CORNER],
    [1 - CORNER, CORNER],
  ] as const;
  centers.forEach(([cx, cy], quadrant) => {
    for (let segment = 0; segment < ARC_SEGMENTS; segment++) {
      const from = ((quadrant * 90 + (segment * 90) / ARC_SEGMENTS) * Math.PI) / 180;
      const to = ((quadrant * 90 + ((segment + 1) * 90) / ARC_SEGMENTS) * Math.PI) / 180;
      const x1 = cx + CORNER * Math.cos(from);
      const y1 = cy + CORNER * Math.sin(from);
      const x2 = cx + CORNER * Math.cos(to);
      const y2 = cy + CORNER * Math.sin(to);
      walls.push({
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        // Komşu parçalar hafifçe üst üste biner: aralarında kıl payı boşluk kalmasın.
        length: Math.hypot(x2 - x1, y2 - y1) * 1.08,
        angle: (Math.atan2(-(x2 - x1), y2 - y1) * 180) / Math.PI,
      });
    }
  });
  return walls;
})();

type DeckItem =
  { kind: 'project'; project: Project; number: string } | { kind: 'soon'; number: string };

function pad(value: number) {
  return String(value).padStart(2, '0');
}

/**
 * Halkanın kartları: önce projeler, sonra "Yakında" yer tutucuları; dizi
 * halka dolana kadar tekrarlanır. Tekrar halkanın arka yarısına düşer, yani
 * önden bakan aynı kartı iki kez görmez.
 */
function buildSlots(projects: readonly Project[]): DeckItem[] {
  const base: DeckItem[] = projects.map((project, index) => ({
    kind: 'project',
    project,
    number: pad(index + 1),
  }));
  for (let index = base.length; index < BASE_ITEMS; index++) {
    base.push({ kind: 'soon', number: pad(index + 1) });
  }

  const slots: DeckItem[] = [];
  while (slots.length < MIN_SLOTS) slots.push(...base);
  return slots;
}

/** Açıyı (-180, 180] aralığına indirir. */
function wrap(angle: number) {
  return ((((angle + 180) % 360) + 360) % 360) - 180;
}

interface CardPose {
  transform: string;
  visible: boolean;
}

/**
 * Kart bu açıdan (derece) sonra gizlenir. Sönme yok: ~105°'de kart, öndeki
 * komşularının tam arkasında kalıyor, yani görünür olduğu an da gizlendiği
 * an da görülmez. Önceden uçlarda saydamlaşarak sönüyordu; saydamlık 3B
 * yüzünden katman katman uygulanınca dönüş sırasında kenarda titrek, çok
 * katlı bir hayalet çerçeve beliriyordu.
 */
const HIDE_COS = Math.cos((105 * Math.PI) / 180);

/**
 * Halkadaki bir kartın dönüşümü.
 *
 * Kartlar dikey eksenli bir silindirin üzerinde, yüzleri YARIÇAP doğrultusunda
 * duruyor (rolodex). Öndeki kart bize tam profilden, yani ince bir çizgi
 * olarak görünür; kenarlara doğru yüzler açılır ve kartlar üst üste biner.
 *
 * Kart iki yüzlüdür ve hiç ters çevrilmeden kesintisiz döner: sol yarıda ön
 * yüzü, sağ yarıda arka yüzü görünür (ikisinde de aynı içerik). Önceden yüz
 * hep izleyiciye dönsün diye kart tam ortada 180° çevriliyordu; kalınlık
 * yüzünden bu an gözle görülür bir sıçrama yapıyordu.
 *
 * Değerler `--r` (yarıçap) cinsinden yazılır: boyut tamamen CSS'te kalır,
 * ölçüm gerekmez ve sunucu çıktısı istemciyle aynıdır.
 */
function cardPose(angle: number, pop = 0): CardPose {
  const normalized = wrap(angle);
  const radians = (normalized * Math.PI) / 180;
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);
  const yaw = normalized + 90;
  // Öne çıkan kart izleyiciye en yakın yüzünü döndürür: solda ön yüz (0°),
  // sağda arka yüz (180°). Sıçrama payı `pop` ile ölçeklenir; öne çıkmamış
  // kartta hiç yoktur.
  const facing = sin >= 0 ? 180 : 0;
  const turn = yaw + (facing - yaw) * pop * POP.turn;
  const lift = cos - 1 + pop * POP.lift;
  const scale = pop > 0 ? ` scale(${(1 + pop * POP.scale).toFixed(4)})` : '';

  return {
    transform: `translate3d(calc(var(--r) * ${sin.toFixed(4)}), 0, calc(var(--r) * ${lift.toFixed(4)})) rotateY(${turn.toFixed(2)}deg)${scale}`,
    // Arka yarı gizli; öne çıkan kart nerede olursa olsun görünür.
    visible: cos > HIDE_COS || pop > 0,
  };
}

function poseStyle({ transform, visible }: CardPose): CSSProperties {
  return { transform, visibility: visible ? undefined : 'hidden' };
}

function applyPose(element: HTMLElement, { transform, visible }: CardPose) {
  element.style.transform = transform;
  element.style.visibility = visible ? '' : 'hidden';
}

/**
 * Seçilmiş işlerin döner destesi.
 *
 * Referans: Andreas Storm'un macOS uygulama simgesi ekran koruyucusu — dönen,
 * kalınlığı olan kart destesi. Burada simgelerin yerinde proje kapakları ve
 * henüz dolmamış yerler için "Yakında" kartları var.
 *
 * Hareket döngüsü React dışında, ref'ler üzerinden yürür: kare başına yeniden
 * render yok. Döngü yalnızca deste ekrandayken ve sekme görünürken döner,
 * hareketsiz kaldığında (durdurulmuş, sürükleme ve atalet bitmiş) kendini
 * kapatır.
 *
 * Etkileşim:
 *   - İmleç sahnedeyken deste yavaşlar; bir kartın üstüne gelince durur ve
 *     o kart öne çıkıp büyür, izleyiciye doğru döner.
 *   - Dokunmatikte hover yok: ilk dokunuş kartı öne çıkarır ve desteyi
 *     durdurur, ikinci dokunuş projeyi açar. Başka yere dokunmak seçimi
 *     bırakır. Böylece kayan bir karta isabet ettirmek gerekmez ve telefon
 *     kullanıcısı da kartı büyük görür.
 *   - Yatay sürükleme desteyi çevirir, bırakınca ataletle yavaşlar. Dikey
 *     kaydırma dokunmatikte sayfaya kalır (`touch-action: pan-y`).
 *   - Proje kartı tıklanınca projeyi açar; sürükleme tıklama sayılmaz.
 *
 * Deste dekoratiftir (`aria-hidden`): aynı bağlantılar altındaki listede
 * klavye ve ekran okuyucu için tekrar eder. Hareket azaltma açıkken kendi
 * kendine dönmez ve atalet yoktur.
 */
export function ProjectDeck({
  projects,
  locale,
  soonLabel,
  paused,
  className,
}: {
  projects: readonly Project[];
  locale: Locale;
  soonLabel: string;
  paused: boolean;
  className?: string;
}) {
  const slots = buildSlots(projects);
  const step = 360 / slots.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const sizerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Üst katmandaki kopyalar: sarmalayıcı (görünürlük, opaklık) ve kart. */
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const overlayCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Kart başına öne çıkış oranı (0–1); kare kare hedefe yaklaşır. */
  const pops = useRef<number[]>([]);

  const reducedMotion = usePrefersReducedMotion();
  const documentVisible = useDocumentVisibility();
  const inView = useInView(stageRef, { amount: 0.1 });

  // Hareket durumu — render'ı tetiklemesin diye ref'te.
  const motion = useRef({
    angle: START_ANGLE,
    speed: 0,
    hover: false,
    /** Üzerine gelinen kartın sırası; yoksa -1. */
    hovered: -1,
    velocity: 0,
    dragging: false,
    pointerId: -1,
    lastX: 0,
    lastTime: 0,
    moved: 0,
  });
  /** Son basışın türü: dokunmatikte dokunuş, farede hover mantığı işler. */
  const lastPointerType = useRef('mouse');
  const frame = useRef(0);
  const running = useRef(false);
  const autoSpeed = reducedMotion || paused ? 0 : SPEED;
  const active = inView && documentVisible;

  // Döngüyü dışarıdan (sürükleme, durdur/başlat) yeniden başlatabilmek için
  // en güncel ayarlar ref'te tutulur.
  const settings = useRef({ autoSpeed, active, reducedMotion });

  const start = useRef<() => void>(() => {});

  useEffect(() => {
    let previous = 0;

    function render() {
      const { angle } = motion.current;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const own = index * step + angle;
        // Öne çıkan kartlar komşularını kendinden uzağa iter.
        let push = 0;
        pops.current.forEach((pop, other) => {
          if (pop === 0 || other === index) return;
          const distance = wrap(own - (other * step + angle));
          const falloff = Math.max(1 - Math.abs(distance) / PUSH_REACH, 0);
          push += Math.sign(distance) * PUSH * falloff * pop;
        });
        const pop = pops.current[index] ?? 0;
        const pose = cardPose(own + push, pop);

        // Öne çıkan kart üst katmandaki kopyasıyla çizilir: büyüyüp dönerken
        // komşularının içinden geçmesin. Kopya aynı pozla başlar ve kısa bir
        // geçişle belirir; tam opak olunca alttaki asıl kart gizlenir.
        const overlay = overlayRefs.current[index];
        const overlayCard = overlayCardRefs.current[index];
        const cover = Math.min(pop / OVERLAY_FADE, 1);
        if (overlay && overlayCard) {
          const display = pop > 0 ? 'block' : '';
          if (overlay.style.display !== display) overlay.style.display = display;
          if (pop > 0) {
            overlay.style.opacity = cover < 1 ? cover.toFixed(3) : '';
            applyPose(overlayCard, pose);
          }
        }
        applyPose(card, cover >= 1 ? { ...pose, visible: false } : pose);
      });
    }

    /** Öne çıkışları hedefe yaklaştırır; hepsi oturduysa true döner. */
    function settlePops(dt: number, hovered: number, instant: boolean) {
      let settled = true;
      cardRefs.current.forEach((_, index) => {
        const current = pops.current[index] ?? 0;
        const target = index === hovered ? 1 : 0;
        let next = instant ? target : current + (target - current) * (1 - Math.exp(-dt * 12));
        if (Math.abs(target - next) < 0.002) next = target;
        else settled = false;
        pops.current[index] = next;
      });
      return settled;
    }

    function tick(time: number) {
      const state = motion.current;
      const config = settings.current;
      const dt = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
      previous = time;

      const hovered = state.dragging ? -1 : state.hovered;
      // Bir kartın üstündeyken deste durur: kart imlecin altından kaçmasın.
      const target = hovered >= 0 ? 0 : -config.autoSpeed * (state.hover ? HOVER_FACTOR : 1);
      // Durdurulunca daha çabuk yavaşlar: düğmeye basan hareketin kesilmesini bekler.
      const easing = target === 0 ? 6 : 3;
      state.speed += (target - state.speed) * (1 - Math.exp(-dt * easing));

      if (!state.dragging) {
        state.velocity = config.reducedMotion ? 0 : state.velocity * Math.exp(-dt * 3.5);
        if (Math.abs(state.velocity) < 0.5) state.velocity = 0;
        state.angle += (state.speed + state.velocity) * dt;
      }

      const popsSettled = settlePops(dt, hovered, config.reducedMotion);
      render();

      const idle =
        !state.dragging &&
        state.velocity === 0 &&
        popsSettled &&
        Math.abs(state.speed - target) < 0.01;
      if (!config.active || (idle && target === 0)) {
        running.current = false;
        previous = 0;
        return;
      }
      frame.current = requestAnimationFrame(tick);
    }

    start.current = () => {
      if (running.current || !settings.current.active) return;
      running.current = true;
      previous = 0;
      frame.current = requestAnimationFrame(tick);
    };

    return () => {
      cancelAnimationFrame(frame.current);
      running.current = false;
    };
  }, [step]);

  // Görünürlük, durdurma veya hareket azaltma değişince ayarı güncelle ve
  // döngüyü uyandır.
  useEffect(() => {
    settings.current = { autoSpeed, active, reducedMotion };
    if (active) start.current();
  }, [active, autoSpeed, reducedMotion]);

  // Dokunmatikte seçili kart, başka bir yere dokunulunca bırakılır.
  useEffect(() => {
    function release(event: globalThis.PointerEvent) {
      if (event.pointerType === 'mouse' || motion.current.hovered === -1) return;
      if (event.target instanceof Element && event.target.closest('[data-deck-face]')) return;
      motion.current.hovered = -1;
      start.current();
    }
    document.addEventListener('pointerdown', release);
    return () => document.removeEventListener('pointerdown', release);
  }, []);

  /**
   * Fare: üzerine gelinen kart, yalnızca imleç GERÇEKTEN hareket edince
   * imlecin altındaki karttan belirlenir. Kartlara giriş/çıkış olayları
   * kullanılmıyor: imleç dururken altından kart kayınca da tetikleniyorlar;
   * kart öne çıkıp biçim değiştirince imleç dışında kalıp bırakılıyor, deste
   * yeniden akıyor ve dur-kalk titremesi oluşuyordu.
   */
  function trackHover(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || motion.current.dragging) return;
    const face =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-deck-face]')
        : null;
    const index = face ? Number(face.dataset.index) : -1;
    if (index === motion.current.hovered) return;
    motion.current.hovered = index;
    start.current();
  }

  /** Dokunmatik: ilk dokunuş seçer (bağlantıyı açmaz), ikincisi açar. */
  function tapCard(event: MouseEvent, index: number, opensLink: boolean) {
    if (lastPointerType.current === 'mouse') return;
    const state = motion.current;
    if (state.hovered === index) {
      if (!opensLink) {
        state.hovered = -1;
        start.current();
      }
      return;
    }
    event.preventDefault();
    state.hovered = index;
    start.current();
  }

  function radiusPx() {
    return sizerRef.current?.offsetWidth || 300;
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    lastPointerType.current = event.pointerType;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const state = motion.current;
    state.dragging = true;
    state.pointerId = event.pointerId;
    state.lastX = event.clientX;
    state.lastTime = event.timeStamp;
    state.velocity = 0;
    state.moved = 0;
    start.current();
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    trackHover(event);
    const state = motion.current;
    if (!state.dragging || event.pointerId !== state.pointerId) return;

    const dx = event.clientX - state.lastX;
    state.moved += Math.abs(dx);
    // Eşik aşılınca imleci yakala: sürükleme sahneden taşsa da kopmasın.
    // Eşikten önce yakalamak tıklamayı karttaki bağlantıdan koparırdı.
    if (state.moved > DRAG_THRESHOLD && !event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
      // Sürükleme başlayınca seçim bırakılır; bırakınca eski karta geri dönmesin.
      state.hovered = -1;
    }

    // Öndeki kart imlecin altında kalsın: yay uzunluğu / yarıçap.
    const delta = (dx / radiusPx()) * (180 / Math.PI);
    const dt = Math.max((event.timeStamp - state.lastTime) / 1000, 1 / 120);
    state.angle += delta;
    state.velocity = state.velocity * 0.6 + (delta / dt) * 0.4;
    state.lastX = event.clientX;
    state.lastTime = event.timeStamp;
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    const state = motion.current;
    if (event.pointerId !== state.pointerId) return;
    state.dragging = false;
    // Bırakmadan önce imleç durduysa atalet olmasın.
    if (event.timeStamp - state.lastTime > 80) state.velocity = 0;
    state.velocity = Math.min(Math.max(state.velocity, -MAX_FLING), MAX_FLING);
    start.current();
  }

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className={cn(
        // Öne çıkan kart sahneden biraz taşar; üst ve alttaki boşluk onu karşılar.
        'relative h-[calc(var(--s)*1.3)] cursor-grab touch-pan-y select-none active:cursor-grabbing',
        '[--r:calc(var(--s)/1.35)] [--s:clamp(7rem,40vw,19rem)] perspective-[calc(var(--s)*7)]',
        className,
      )}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return;
        motion.current.hover = true;
        start.current();
      }}
      onPointerLeave={(event) => {
        // Dokunmatikte her dokunuştan sonra leave gelir; seçimi o bozmasın.
        if (event.pointerType !== 'mouse') return;
        motion.current.hover = false;
        motion.current.hovered = -1;
        start.current();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onClickCapture={(event) => {
        if (motion.current.moved > DRAG_THRESHOLD) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onDragStart={(event) => event.preventDefault()}
    >
      {/* Sürüklemede pikseli açıya çevirmek için yarıçapın piksel karşılığı. */}
      <div ref={sizerRef} className="pointer-events-none absolute h-0 w-[var(--r)]" />

      {/* 3B isabet testi yalnızca kart yüzlerinde: kapsayıcı ve katmanlar
          tıklamayı yutmasın diye pointer-events kapalı. */}
      <div className="pointer-events-none absolute inset-0 transform-3d">
        {slots.map((item, index) => (
          <div
            key={index}
            ref={(element) => {
              cardRefs.current[index] = element;
            }}
            className="absolute top-1/2 left-1/2 -mt-[calc(var(--s)/2)] -ml-[calc(var(--s)/2)] size-[var(--s)] transform-3d"
            style={poseStyle(cardPose(index * step + START_ANGLE))}
          >
            <CardBody
              item={item}
              index={index}
              locale={locale}
              soonLabel={soonLabel}
              onTap={tapCard}
            />
          </div>
        ))}
      </div>

      {/* Üst katman: öne çıkan kartın kopyası. Her kopya kendi 3B bağlamında,
          destenin ÜSTÜNDE çizilir; desteyle derinlik sıralamasına girmediği
          için hiçbir kartın içinden geçemez. Yalnızca öne çıkarken görünür. */}
      {slots.map((item, index) => (
        <div
          key={index}
          ref={(element) => {
            overlayRefs.current[index] = element;
          }}
          className="pointer-events-none absolute inset-0 hidden perspective-[calc(var(--s)*7)]"
        >
          <div className="absolute inset-0 transform-3d">
            <div
              ref={(element) => {
                overlayCardRefs.current[index] = element;
              }}
              className="absolute top-1/2 left-1/2 -mt-[calc(var(--s)/2)] -ml-[calc(var(--s)/2)] size-[var(--s)] transform-3d"
            >
              <CardBody
                item={item}
                index={index}
                locale={locale}
                soonLabel={soonLabel}
                onTap={tapCard}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Kartın katı gövdesi: yan duvarlar ve iki yüz. Ön ve arka yüz aynı içeriği
 * taşır; arka yüz kalınlık kadar geride ve ters çevrili. `backface-hidden`
 * ile her an yalnızca izleyiciye bakan yüz çizilir ve isabet alır.
 */
function CardBody({
  item,
  index,
  locale,
  soonLabel,
  onTap,
}: {
  item: DeckItem;
  index: number;
  locale: Locale;
  soonLabel: string;
  onTap: (event: MouseEvent, index: number, opensLink: boolean) => void;
}) {
  const edge = item.kind === 'project' ? 'bg-line-strong' : 'bg-line';

  return (
    <>
      {WALLS.map((wall, wallIndex) => (
        <div
          key={wallIndex}
          className={cn('pointer-events-none absolute', edge)}
          style={{
            left: `calc(var(--s) * ${(wall.x - THICKNESS / 2).toFixed(4)})`,
            top: `calc(var(--s) * ${(wall.y - wall.length / 2).toFixed(4)})`,
            width: `calc(var(--s) * ${THICKNESS})`,
            height: `calc(var(--s) * ${wall.length.toFixed(4)})`,
            // Şerit önce yüze dik çevrilir, sonra kenar yönüne döndürülür ve
            // kalınlığın ortasına itilir: yüz ile arka yüz arasını doldurur.
            transform: `translateZ(calc(var(--s) * ${-THICKNESS / 2})) rotateZ(${wall.angle.toFixed(2)}deg) rotateY(90deg)`,
          }}
        />
      ))}

      {(['front', 'back'] as const).map((side) => (
        <div
          key={side}
          data-deck-face=""
          data-index={index}
          className="pointer-events-auto absolute inset-0 rounded-[22%] backface-hidden"
          style={
            side === 'back'
              ? { transform: `translateZ(calc(var(--s) * ${-THICKNESS})) rotateY(180deg)` }
              : undefined
          }
          onClick={(event) =>
            onTap(event, index, item.kind === 'project' && !!item.project.liveUrl)
          }
        >
          {item.kind === 'project' ? (
            <ProjectFace project={item.project} locale={locale} />
          ) : (
            <SoonFace number={item.number} label={soonLabel} />
          )}
        </div>
      ))}
    </>
  );
}

function ProjectFace({ project, locale }: { project: Project; locale: Locale }) {
  const face = project.cover ? (
    // eslint-disable-next-line @next/next/no-img-element -- 3B dönüşümlü yüz; next/image sarmalayıcısı preserve-3d'yi bozar.
    <img
      src={project.cover.url}
      alt=""
      width={project.cover.width}
      height={project.cover.height}
      draggable={false}
      loading="lazy"
      decoding="async"
      className="size-full object-cover"
      style={{ objectPosition: project.cover.focus }}
    />
  ) : (
    <span className="flex size-full items-end bg-fg p-[12%] text-title text-bg">
      {project.title[locale]}
    </span>
  );

  const className = 'absolute inset-0 overflow-hidden rounded-[22%] bg-fg';

  return project.liveUrl ? (
    <a
      href={project.liveUrl}
      target="_blank"
      rel="noreferrer noopener"
      tabIndex={-1}
      draggable={false}
      className={cn(className, 'pointer-events-auto cursor-pointer')}
    >
      {face}
    </a>
  ) : (
    <div className={className}>{face}</div>
  );
}

/** Henüz dolmamış yer: numara ve "Yakında". Uydurma proje değil, boş bir raf. */
function SoonFace({ number, label }: { number: string; label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between rounded-[22%] border border-line-strong/50 bg-bg-subtle p-[16%]">
      <span className="font-display text-[calc(var(--s)*0.22)] leading-none text-fg-subtle tabular-nums">
        {number}
      </span>
      <span className="font-mono text-[max(0.5625rem,calc(var(--s)*0.055))] tracking-[0.12em] text-accent">
        {label}
      </span>
    </div>
  );
}
