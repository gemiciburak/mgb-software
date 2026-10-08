import { getTranslations } from 'next-intl/server';
import type { CSSProperties } from 'react';
import type { Locale } from '@/shared';
import { HeroBackdrop } from '@/components/animations/hero-backdrop';
import { buttonStyles } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ArrowRightIcon } from '@/components/ui/icons';
import { getContent } from '@/content';
import { Link } from '@/i18n/navigation';
import { SECTION_ID } from '@/lib/sections';
import { HeroFallback } from './hero-fallback';

/**
 * Hero — "Wireframe Ink Motion".
 *
 * Sunucu bileşeni: başlık, alt metin ve CTA'lar sunucu HTML'inde gelir, yani
 * LCP öğesi H1 metnidir — canvas asla LCP adayı olmaz. Arka plan katmanı
 * (HeroBackdrop) istemci tarafında kendi yükleme stratejisini yönetir.
 *
 * Metnin okunurluğu iki katmanla korunur: (1) çizgiler düşük opaklıkta ve
 * kompozisyon sağa kaydırılmış, (2) soldan zemin rengine giden bir gradient
 * metin alanını örtüyor. Arka plan hiçbir durumda metnin önüne geçmez.
 */
export async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations('actions');
  const { hero } = getContent(locale);

  return (
    <section
      id={SECTION_ID.hero}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <HeroBackdrop>
        <HeroFallback className="size-full" />
      </HeroBackdrop>

      {/*
        Metin koruma katmanı. Soldan zemin rengine, aşağıdan da zemine giden
        iki gradient; token kullandığı için her iki temada doğru çalışır.

        Eğri bilinçli olarak erken biter: ilk ayarda maske genişliğin %72'sine
        kadar uzanıyordu ve mürekkep yüzeyinin neredeyse tamamını siliyordu.
        Başlık zaten 18:1 kontrastta olduğu için metnin üzerinde tam örtü
        gerekmiyor — yalnızca gürültüyü kısmak yetiyor.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--bg)_0%,var(--bg)_18%,color-mix(in_srgb,var(--bg)_62%,transparent)_42%,transparent_66%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,var(--bg),transparent)]"
      />

      <Container className="relative z-10 pt-28 pb-20">
        <p
          className="hero-reveal font-mono text-label text-accent"
          style={{ '--reveal-delay': '40ms' } as CSSProperties}
        >
          {hero.eyebrow}
        </p>

        {/* LCP öğesi. CSS animasyonu parse anında başlar; JS beklemez. */}
        <h1
          className="mt-6 max-w-[19ch] hero-reveal text-display-1"
          style={{ '--reveal-delay': '100ms' } as CSSProperties}
        >
          {hero.title}
        </h1>

        <p
          className="mt-7 max-w-[46ch] hero-reveal text-body-lg text-fg-muted"
          style={{ '--reveal-delay': '220ms' } as CSSProperties}
        >
          {hero.subtitle}
        </p>

        <div
          className="mt-10 flex hero-reveal flex-wrap items-center gap-3"
          style={{ '--reveal-delay': '320ms' } as CSSProperties}
        >
          <Link href="/start" className={buttonStyles()}>
            {t('startProject')}
            <ArrowRightIcon className="size-4" />
          </Link>
          <a href={`#${SECTION_ID.services}`} className={buttonStyles({ variant: 'secondary' })}>
            {t('exploreServices')}
          </a>
        </div>

        <p
          className="mt-16 hero-reveal font-mono text-mono-sm text-fg-subtle"
          style={{ '--reveal-delay': '420ms' } as CSSProperties}
        >
          {hero.axis}
        </p>
      </Container>
    </section>
  );
}
