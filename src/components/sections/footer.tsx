import { getLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Copyright } from '@/components/ui/copyright';
import { ArrowUpRightIcon, MailIcon, WhatsAppIcon, SocialIcon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/logo';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import {
  BRAND_SIGNATURE,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  SOCIAL_LINKS,
  isPublished,
  whatsappHref,
} from '@/lib/constants';
import { NAV_ITEMS, navHref } from '@/lib/sections';

const LINK_CLASS = 'rounded-xs text-body-sm text-fg-muted transition-colors hover:text-fg';

/**
 * Footer.
 *
 * İletişim sütunu koşullu kalır: her kanal yalnızca tanımlıysa görünür;
 * `CONTACT_EMAIL` ve `CONTACT_PHONE` null, `SOCIAL_LINKS` boşsa sütun hiç
 * render edilmez — uydurma adres ya da kırık link üretilmez.
 * Kanallar lib/constants.ts'ten gelir, buradan değil.
 *
 * Yasal sütun da aynı kurala uyar: gizlilik ve KVKK sayfaları yayına
 * alınana kadar (`PUBLISHED_ROUTES`) linkleri render edilmez — 404'e giden
 * link vermektense hiç vermemek doğru. Sütun yokken iletişim sütunu sağa
 * yaslanır, ızgara boşluk bırakmaz.
 */
export async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tReach = await getTranslations('reach');
  const locale = await getLocale();

  const legalLinks = (
    [
      { href: '/privacy', label: t('privacy') },
      { href: '/kvkk', label: t('kvkk') },
    ] as const
  ).filter((link) => isPublished(link.href));
  const hasLegal = legalLinks.length > 0;

  return (
    <footer className="border-t border-line">
      <Container width="wide" className="py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className={cn('lg:col-span-4', hasLegal ? 'md:col-span-6' : 'md:col-span-4')}>
            <Logo size="lg" />
            <p className="mt-4 max-w-[28ch] text-body-sm text-fg-muted">{t('tagline')}</p>
          </div>

          <nav aria-label={t('navHeading')} className="md:col-span-3 lg:col-span-2">
            <h2 className="font-mono text-mono-sm text-fg-subtle">{t('navHeading')}</h2>
            <ul className="mt-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a href={navHref(locale, item.id)} className={LINK_CLASS}>
                    {tNav(item.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {hasLegal && (
            <div className="md:col-span-3 lg:col-span-2">
              <h2 className="font-mono text-mono-sm text-fg-subtle">{t('legalHeading')}</h2>
              <ul className="mt-4 space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={LINK_CLASS}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(CONTACT_EMAIL !== null || CONTACT_PHONE !== null || SOCIAL_LINKS.length > 0) && (
            <div
              className={cn(
                'lg:col-span-4',
                // Tablette 5 sütun: e-posta adresi 4 sütunda satır ortasından kırılıyordu.
                hasLegal ? 'md:col-span-6' : 'md:col-span-5 lg:col-start-9',
              )}
            >
              <h2 className="font-mono text-mono-sm text-fg-subtle">{t('contactHeading')}</h2>
              <ul className="mt-4 space-y-3">
                {CONTACT_EMAIL !== null && (
                  <li>
                    {/* İkon dekoratif: linkin erişilebilir adı zaten adresin
                        kendisi. İkon ayrıca okunursa gereksiz tekrar olur. */}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="group/link inline-flex items-center gap-2.5 rounded-xs text-body-sm break-all text-fg-muted transition-colors hover:text-fg"
                    >
                      <MailIcon className="size-4 shrink-0 text-fg-subtle transition-colors group-hover/link:text-accent" />
                      {CONTACT_EMAIL}
                    </a>
                  </li>
                )}
                {CONTACT_PHONE !== null && (
                  <li>
                    <a
                      href={whatsappHref(CONTACT_PHONE.digits, tReach('whatsappDraft'))}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${tReach('whatsappLabel')} — ${CONTACT_PHONE.display}`}
                      className="group/link inline-flex items-center gap-2.5 rounded-xs text-body-sm text-fg-muted transition-colors hover:text-fg"
                    >
                      <WhatsAppIcon className="size-4 shrink-0 text-fg-subtle transition-colors group-hover/link:text-accent" />
                      {CONTACT_PHONE.display}
                      <ArrowUpRightIcon className="size-3 shrink-0 text-fg-subtle" />
                    </a>
                  </li>
                )}
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${social.label} — ${social.handle}`}
                      className="group/link inline-flex items-center gap-2.5 rounded-xs text-body-sm text-fg-muted transition-colors hover:text-fg"
                    >
                      <SocialIcon
                        id={social.id}
                        className="size-4 shrink-0 text-fg-subtle transition-colors group-hover/link:text-accent"
                      />
                      {social.handle}
                      <ArrowUpRightIcon className="size-3 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-6 font-mono text-mono-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <Copyright buildYear={new Date().getFullYear()} />
          <span className="text-accent">{BRAND_SIGNATURE}</span>
        </div>
      </Container>
    </footer>
  );
}
