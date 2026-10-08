'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import type { PointerEvent } from 'react';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { TechMark } from '@/components/ui/tech-mark';
import { useIsTouch } from '@/hooks/use-is-touch';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { EASE_ENTRANCE } from '@/lib/motion';
import { SECTION_ID } from '@/lib/sections';
import type { SectionIntro, TechEntry } from '@/types/content';

type TechnologyContent = SectionIntro & { entries: readonly TechEntry[] };

/** Levhanın imleçle alabileceği azami eğim (derece). */
const TILT = { x: 7, y: 9 } as const;
const TILT_SPRING = { stiffness: 90, damping: 18, mass: 0.6 } as const;

/**
 * Kartların dağınık başlangıç konumu.
 *
 * İki kural var ve ikisi de hydration içindir:
 *   1. Math.random yok — sinüs tabanlı deterministik hash, sunucu ve istemci
 *      aynı dağınıklığı birebir üretir.
 *   2. Değerler TAM SAYI — motion başlangıç stilini sunucuda yazarken
 *      transform sayılarını yuvarlıyor (-48.706001… → -48.706), istemcide ise
 *      ham float kullanıyor. Yuvarlak sayılarda iki taraf aynı metni üretir.
 */
function scatter(index: number) {
  const a = Math.sin((index + 1) * 12.9898) * 43758.5453;
  const b = Math.sin((index + 1) * 78.233) * 43758.5453;
  const rx = a - Math.floor(a);
  const ry = b - Math.floor(b);

  return {
    x: Math.round((rx - 0.5) * 110),
    y: Math.round((ry - 0.5) * 80),
    z: Math.round(-150 - rx * 200),
    rotate: Math.round((ry - 0.5) * 12),
  };
}

/**
 * Izgaradaki son hali. Varyant adı yerine düz nesne kullanılıyor: motion'ın
 * `custom` ile beslenen fonksiyon varyantları sunucuda çözülmüyor, bu yüzden
 * başlangıç stili HTML'e yazılmıyor ve hydration uyuşmazlığı veriyordu.
 */
const SETTLED = { opacity: 1, x: 0, y: 0, z: 0, rotate: 0 } as const;

/**
 * Teknoloji — 3B kart levhası.
 *
 * Her kart markanın kendi işaretini taşır. Durağan halde işaretler tek renk
 * (`currentColor`) çizilir, yani sayfanın tek-vurgu disiplini bozulmaz; marka
 * rengi ancak karta gelince açılır. Dokuz logonun hepsi aynı anda kendi
 * renginde olsaydı bölüm bir sponsor bandına dönerdi.
 *
 * Hareket iki katmanlı:
 *   1. Giriş — kartlar dağınık derinliklerden ızgaraya oturur. Bir kez olur,
 *      sonra bölüm sakinleşir.
 *   2. Eğim — levha imlece doğru birkaç derece döner. Perspektif yüzünden
 *      kenardaki kartlar merkezdekinden daha çok kayar; kabartma hissi
 *      sabit bir Z farkından değil, eğimin kendisinden çıkar.
 *
 * Her kart kendi çerçevesini taşır (container üst+sol, hücreler sağ+alt):
 * paylaşılan `bg-line` numarası kullanılsaydı kartlar uçarken arkadaki düz
 * çizgi rengi blok halinde görünürdü.
 *
 * Hareket azaltma veya dokunmatik: eğim yok, giriş yok — ızgara doğrudan
 * son halinde render edilir. İşaretler ve metin aynen kalır.
 */
export function TechnologyGrid({ content }: { content: TechnologyContent }) {
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouch();
  const interactive = !reducedMotion && !isTouch;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(pointerX, TILT_SPRING);
  const rotateX = useSpring(pointerY, TILT_SPRING);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!interactive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * TILT.y);
    pointerY.set(-((event.clientY - rect.top) / rect.height - 0.5) * TILT.x);
  }

  function resetTilt() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <section id={SECTION_ID.technology} className="overflow-x-clip border-t border-line py-section">
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            {...(content.description ? { description: content.description } : {})}
          />
        </ScrollReveal>

        <div
          className="mt-14 perspective-[1500px]"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
        >
          <motion.ul
            className="grid grid-cols-2 border-t border-l border-line transform-3d md:grid-cols-3"
            style={interactive ? { rotateX, rotateY } : undefined}
          >
            {content.entries.map((entry, index) => (
              <motion.li
                key={entry.slug}
                initial={reducedMotion ? false : { opacity: 0, ...scatter(index) }}
                whileInView={SETTLED}
                transition={{ duration: 0.85, delay: index * 0.05, ease: EASE_ENTRANCE }}
                viewport={{ once: true, margin: '-60px' }}
                {...(interactive ? { whileHover: { z: 30 } } : {})}
                className="group border-r border-b border-line bg-bg px-6 py-8 transition-colors duration-[var(--duration-fast)] last:col-span-2 hover:bg-bg-subtle md:last:col-span-1 lg:px-8 lg:py-10"
              >
                <TechMark
                  slug={entry.slug}
                  className="size-8 text-fg-muted transition-colors duration-[var(--duration-base)] group-hover:text-(color:--brand) lg:size-10"
                />
                <p className="mt-6 text-title">{entry.name}</p>
                <p className="mt-2 font-mono text-mono-sm text-fg-subtle">{entry.role}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </Container>
    </section>
  );
}
