import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProjectBrief } from '@/components/contact/project-brief';
import { Container } from '@/components/ui/container';
import { MailIcon } from '@/components/ui/icons';
import { getContent } from '@/content';
import { routing } from '@/i18n/routing';
import { CONTACT_EMAIL } from '@/lib/constants';
import { subpageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'contact' });

  return subpageMetadata({
    pathname: '/quote',
    locale,
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

/** Yan paftadaki adımlar — sıra, müşterinin gerçekten yaşayacağı sıra. */
const NEXT_STEPS = ['read', 'reply', 'meeting', 'proposal'] as const;

/**
 * Teklif sayfası (`/teklif-al` ↔ `/en/get-a-quote`).
 *
 * Sitedeki bütün "Teklif Al" düğmeleri buraya gelir. Tek giriş kapısı
 * dört adımlı form; yan paftada gönderimden sonra ne olacağı ve dosyalar için
 * e-posta adresi durur. Ön görüşme formdan sonra, teşekkür ekranında sunulur.
 * Başlık ve giriş sunucu HTML'inde, form istemci bileşeni.
 */
export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('contact');
  const services = getContent(locale).home.services.entries.map(({ slug, title }) => ({
    slug,
    title,
  }));

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Container className="pt-36 pb-section lg:pt-44">
        <p className="font-mono text-label text-accent">{t('eyebrow')}</p>
        <h1 className="mt-6 max-w-[16ch] text-display-1">{t('title')}</h1>
        <p className="mt-7 max-w-[52ch] text-body-lg text-fg-muted">{t('intro')}</p>

        <div className="mt-16 grid gap-16 lg:mt-20 lg:grid-cols-12 lg:gap-0">
          <div className="lg:col-span-8">
            <ProjectBrief services={services} />
          </div>

          <aside className="space-y-6 lg:col-span-4 lg:col-start-9 lg:pl-12">
            {/*
              Bilgi paftası. Ön görüşme bilinçli olarak buradan doğrudan
              açılmaz: görüşmeye talep okunmadan girilmesin diye takvim yalnızca
              form gönderildikten sonra, teşekkür ekranında sunulur. Burası
              yalnızca sonrasında ne olacağını anlatır.
            */}
            <div className="overflow-hidden rounded-sm border border-line bg-surface">
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 className="font-mono text-mono-sm text-fg-subtle">{t('aside.title')}</h2>
                <span
                  aria-hidden="true"
                  className="font-mono text-mono-sm text-accent tabular-nums"
                >
                  {String(NEXT_STEPS.length).padStart(2, '0')}
                </span>
              </div>

              <ol className="relative px-6 py-7">
                {/* Numaraları bağlayan dikey ray — Süreç bölümüyle aynı dil. */}
                <span
                  aria-hidden="true"
                  className="absolute top-9 bottom-12 left-[2.15rem] w-px bg-line"
                />
                {NEXT_STEPS.map((step, index) => (
                  <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
                    <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface font-mono text-[0.625rem] text-accent tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="pt-0.5">
                      <h3 className="font-sans text-body font-medium text-fg">
                        {t(`aside.steps.${step}.title`)}
                      </h3>
                      <p className="mt-1 text-body-sm text-fg-muted">
                        {t(`aside.steps.${step}.body`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {CONTACT_EMAIL !== null && (
                <div className="border-t border-line bg-bg-subtle px-6 py-5">
                  <h2 className="font-mono text-mono-sm text-fg-subtle">{t('aside.filesTitle')}</h2>
                  <p className="mt-2 text-body-sm text-fg-muted">{t('aside.filesBody')}</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="group/mail mt-3 inline-flex items-center gap-2.5 rounded-xs text-body font-medium break-all text-fg transition-colors hover:text-accent"
                  >
                    <MailIcon className="size-4 shrink-0 text-accent" />
                    {CONTACT_EMAIL}
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
