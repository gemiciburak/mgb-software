import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { FinalCta } from '@/components/sections/final-cta';
import { Container } from '@/components/ui/container';
import { MailIcon } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/section-heading';
import { getContent } from '@/content';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from '@/lib/constants';
import { buildAlternates } from '@/lib/seo';
import { LOCALE_TAGS } from '@/shared';
import type { FounderContent } from '@/types/content';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { meta } = getContent(locale).about;

  return {
    title: meta.title,
    description: meta.description,
    alternates: buildAlternates('/about', locale),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: LOCALE_TAGS[locale],
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}${getPathname({ href: '/about', locale })}`,
    },
  };
}

/**
 * Hakkımızda (`/hakkimizda` ↔ `/en/about`).
 *
 * Üç katman, iki ses:
 *   1. Stüdyo — kurumsal "biz". Vizyon, kapsam ve doğrulanabilir kısa
 *      gerçekler (uydurma yıl/proje sayısı yok).
 *   2. Kurucu — birinci tekil. Kurumsal metnin ortasında bilinçli bir ses
 *      değişimi: markanın arkasındaki kişi gizlenmiyor.
 *   3. Çalışma anlayışı — küçük olmanın getirdiği somut avantajlar.
 * Kapanışta ana sayfadaki çağrı bileşeni, sayfaya özel metinle.
 *
 * Tamamı sunucu bileşeni; içerik content/{tr,en}/about.ts'ten gelir.
 */
export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const { about } = getContent(locale);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      {/* 1 — Stüdyo. Başlık ekranın üstünde: animasyonsuz, ilk boyamada hazır. */}
      <Container className="pt-36 pb-section lg:pt-44">
        <p className="font-mono text-label text-accent">{about.intro.eyebrow}</p>
        <h1 className="mt-8 max-w-[18ch] text-display-1 text-balance">{about.intro.title}</h1>

        <div className="mt-16 grid gap-y-14 md:grid-cols-12 md:gap-y-0 lg:mt-20">
          <div className="space-y-6 text-body-lg text-fg-muted md:col-span-7">
            {about.intro.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          {/* Kısa gerçekler — teknik çizimdeki antet kutusu gibi. */}
          <dl className="border-t border-line md:col-span-4 md:col-start-9 md:self-start">
            {about.intro.facts.map((fact) => (
              <div key={fact.label} className="border-b border-line py-5">
                <dt className="font-mono text-mono-sm text-fg-subtle">{fact.label}</dt>
                <dd className="mt-2 text-body">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      {/* 2 — Kurucu. */}
      <section aria-labelledby="founder-name" className="border-t border-line py-section">
        <Container>
          <ScrollReveal>
            <p className="font-mono text-label text-accent">{about.founder.eyebrow}</p>
          </ScrollReveal>

          <div className="mt-12 grid gap-y-12 md:grid-cols-12 md:gap-y-0 lg:mt-16">
            <div className="md:col-span-5 lg:col-span-4">
              <FounderPortrait founder={about.founder} />
            </div>

            <ScrollReveal className="md:col-span-6 md:col-start-7 md:self-center lg:col-span-6 lg:col-start-6 lg:pl-8">
              <h2 id="founder-name" className="text-display-2">
                {about.founder.name}
              </h2>
              <p className="mt-4 font-mono text-mono-sm text-fg-subtle">{about.founder.role}</p>

              <div className="mt-8 space-y-5 border-l border-accent pl-6 text-body-lg text-fg-muted">
                {about.founder.bio.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>

              {CONTACT_EMAIL !== null && (
                <div className="mt-10 border-t border-line pt-6">
                  <p className="text-body-sm text-fg-muted">{about.founder.contactLine}</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="group/mail mt-3 inline-flex items-center gap-2.5 rounded-xs text-body break-all text-fg transition-colors hover:text-accent"
                  >
                    <MailIcon className="size-4 shrink-0 text-fg-subtle transition-colors group-hover/mail:text-accent" />
                    {CONTACT_EMAIL}
                  </a>
                </div>
              )}
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* 3 — Çalışma anlayışı. Hücreler kendi çerçevesini taşır (üst+sol
          kapsayıcıda, sağ+alt hücrede) — teknoloji ızgarasıyla aynı dil. */}
      <section className="border-t border-line py-section">
        <Container>
          <ScrollReveal>
            <SectionHeading
              eyebrow={about.principles.eyebrow}
              title={about.principles.title}
              {...(about.principles.description
                ? { description: about.principles.description }
                : {})}
            />
          </ScrollReveal>

          <ol className="mt-14 grid border-t border-l border-line md:grid-cols-2 lg:mt-20 lg:grid-cols-3">
            {about.principles.entries.map((principle, index) => (
              <li
                key={principle.title}
                className="border-r border-b border-line px-6 py-8 lg:px-8 lg:py-10"
              >
                <span className="font-mono text-mono-sm text-accent tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 text-title">{principle.title}</h3>
                <p className="mt-3 text-body-sm text-fg-muted">{principle.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <FinalCta content={about.cta} />
    </main>
  );
}

/**
 * Kurucu portresi.
 *
 * Fotoğraf `content` içinde tanımlıysa düz <img> ile gelir: boyutları
 * bilinen tek bir görsel için Next görüntü optimizasyonu gerekmiyor (ve
 * Cloudflare'de ayrı bir Images bağlaması isterdi). Fotoğraf yoksa yerinde
 * baş harfler durur — boş kutu ya da stok fotoğraf değil.
 */
function FounderPortrait({ founder }: { founder: FounderContent }) {
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
              className="absolute inset-0 flex items-center justify-center font-display text-display-1 text-line-strong"
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
