import type { FounderContent } from '@/types/content';

/**
 * Kurucu portresi.
 *
 * Fotoğraf `content` içinde tanımlıysa düz <img> ile gelir: boyutları
 * bilinen tek bir görsel için Next görüntü optimizasyonu gerekmiyor (ve
 * Cloudflare'de ayrı bir Images bağlaması isterdi). Fotoğraf yoksa yerinde
 * baş harfler durur — boş kutu ya da stok fotoğraf değil.
 */
export function FounderPortrait({ founder }: { founder: FounderContent }) {
  const initials = founder.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('');

  return (
    <figure>
      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-bg-subtle">
        {founder.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- bkz. yukarıdaki not
          <img
            src={founder.photo.src}
            width={founder.photo.width}
            height={founder.photo.height}
            alt={founder.photo.alt}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0 blueprint-grid [--grid-opacity:0.6] [--grid-size:32px]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center font-display text-display-2 text-line-strong"
            >
              {initials}
            </span>
          </>
        )}
      </div>
      <figcaption className="mt-4 flex items-baseline justify-between border-t border-line pt-4 font-mono text-mono-sm text-fg-subtle">
        <span>{founder.name}</span>
        <span>MGB</span>
      </figcaption>
    </figure>
  );
}
