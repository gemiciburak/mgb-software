import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { getContent } from '@/content';
import { routing } from '@/i18n/routing';
import { subpageMetadata } from '@/lib/seo';
import { LOCALE_TAGS } from '@/shared';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'kvkk' });

  return subpageMetadata({
    pathname: '/kvkk',
    locale,
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

/**
 * KVKK Aydınlatma Metni (`/kvkk` ↔ `/en/data-protection`).
 *
 * Metin content/{tr,en}/kvkk.ts içinde yapılandırılmış olarak durur; bu sayfa
 * yalnızca dizer. Okuma kolonu dar tutuldu (≈68ch) — uzun hukuki metinde satır
 * uzunluğu okunabilirliğin kendisi.
 */
export default async function KvkkPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('kvkk');
  const { kvkk } = getContent(locale);
  const updated = new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    dateStyle: 'long',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(`${kvkk.updated}T12:00:00Z`));

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Container className="pt-36 pb-section lg:pt-44">
        <article className="max-w-[68ch]">
          <p className="font-mono text-label text-accent">{t('eyebrow')}</p>
          <h1 className="mt-6 text-display-2">{kvkk.title}</h1>
          <p className="mt-5 font-mono text-mono-sm text-fg-subtle">
            {t('updated', { date: updated })}
          </p>
          <p className="mt-10 text-body-lg text-fg-muted">{kvkk.intro}</p>

          {kvkk.sections.map((section, index) => (
            <section key={section.heading} className="mt-14 border-t border-line pt-8">
              <h2 className="flex items-baseline gap-4 text-title">
                <span className="font-mono text-mono-sm text-accent tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {section.heading}
              </h2>
              <div className="mt-5 space-y-4 text-body text-fg-muted">
                {section.blocks.map((block, blockIndex) =>
                  block.type === 'p' ? (
                    <p key={blockIndex}>{block.text}</p>
                  ) : (
                    <ul key={blockIndex} className="space-y-2.5">
                      {block.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-[0.8em] h-px w-3 shrink-0 bg-accent"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}

          {kvkk.note && (
            <p className="mt-14 border-t border-line pt-6 font-mono text-mono-sm text-fg-subtle">
              {kvkk.note}
            </p>
          )}
        </article>
      </Container>
    </main>
  );
}
