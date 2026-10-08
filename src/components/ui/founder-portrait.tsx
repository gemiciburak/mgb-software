import { cn } from '@/lib/cn';
import type { FounderContent } from '@/types/content';

/**
 * Kurucu portresi — kare. Boyutu çağıran yer belirler (`className`).
 *
 * Fotoğraf `content` içinde tanımlıysa düz <img> ile gelir: boyutları
 * bilinen tek bir görsel için Next görüntü optimizasyonu gerekmiyor (ve
 * Cloudflare'de ayrı bir Images bağlaması isterdi). Fotoğraf yoksa yerinde
 * baş harfler durur — boş kutu ya da stok fotoğraf değil.
 *
 * Dekoratif sayılır: yanında her zaman isim yazılı, o yüzden baş harfler
 * ekran okuyucudan gizlenir; gerçek fotoğrafın ise kendi alt metni olur.
 */
export function FounderPortrait({
  founder,
  className,
  initialsClassName = 'text-title',
}: {
  founder: FounderContent;
  className?: string;
  /** Fotoğraf yokken baş harflerin puntosu — kutu boyutuna göre seçilir. */
  initialsClassName?: string;
}) {
  const initials = founder.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('');

  return (
    <div
      className={cn(
        'relative aspect-square overflow-hidden border border-line bg-bg-subtle',
        className,
      )}
    >
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
            className="absolute inset-0 blueprint-grid [--grid-opacity:0.6] [--grid-size:24px]"
          />
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-0 flex items-center justify-center font-display text-line-strong',
              initialsClassName,
            )}
          >
            {initials}
          </span>
        </>
      )}
    </div>
  );
}
