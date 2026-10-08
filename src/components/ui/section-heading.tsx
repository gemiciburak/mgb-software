import { cn } from '@/lib/cn';

/**
 * Bölüm başlığı: mono etiket + display başlık + isteğe bağlı açıklama.
 *
 * Etiket metni içerik dosyalarında zaten büyük harfle gelir; burada
 * `uppercase` uygulanmaz — Türkçe'de "i" harfi yanlış dönüşürdü.
 *
 * DİKKAT: satır uzunluğu sınırı sarmalayıcıya değil, metin öğelerinin
 * KENDİSİNE verilir. `ch` birimi elementin kendi fontuna göre hesaplanır;
 * sarmalayıcıya konduğunda gövde fontunun (16px) genişliğini kullanıyor ve
 * 64px'lik başlıkları gereksiz yere satır atlatıyordu.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  id,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  id?: string;
}) {
  return (
    <div className={className}>
      <p className="font-mono text-label text-accent">{eyebrow}</p>
      <h2 id={id} className={cn('mt-5 max-w-[20ch] text-display-2')}>
        {title}
      </h2>
      {description && <p className="mt-5 max-w-[46ch] text-body-lg text-fg-muted">{description}</p>}
    </div>
  );
}
