import { getTranslations } from 'next-intl/server';
import { ArrowUpRightIcon, MailIcon, SocialIcon, WhatsAppIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { CONTACT_EMAIL, CONTACT_PHONE, SOCIAL_LINKS, whatsappHref } from '@/lib/constants';

/** En az bir kanal tanımlı mı? Değilse kanalları taşıyan blok hiç render edilmez. */
export const HAS_CONTACT_CHANNELS =
  CONTACT_EMAIL !== null || CONTACT_PHONE !== null || SOCIAL_LINKS.length > 0;

/**
 * Doğrudan iletişim kanalları: e-posta, WhatsApp, sosyal hesaplar.
 *
 * Hakkımızda kartı, kapanış bölümü ve footer aynı listeyi gösterir; üç ayrı
 * kopya zamanla birbirinden kayıyordu (ör. footer'da ok ikonu farklı renkteydi).
 * Kanallar lib/constants.ts'ten gelir ve yalnızca tanımlıysa görünür.
 *
 *   • size  — sm: kart ve footer, md: kapanış bölümü
 *   • tone  — default: metin fg, hover vurgu · muted: footer'ın sönük tonu
 *
 * İkonlar dekoratif: linkin erişilebilir adı adresin kendisi ya da
 * `aria-label` ("WhatsApp — +90 …"); ikon ayrıca okunursa gereksiz tekrar olur.
 */
export async function ContactChannels({
  size = 'sm',
  tone = 'default',
  className,
}: {
  size?: 'sm' | 'md';
  tone?: 'default' | 'muted';
  className?: string;
}) {
  if (!HAS_CONTACT_CHANNELS) return null;

  const tReach = await getTranslations('reach');

  const link = cn(
    'group/link inline-flex items-center gap-2.5 rounded-xs transition-colors',
    size === 'md' ? 'text-body' : 'text-body-sm',
    tone === 'muted' ? 'text-fg-muted hover:text-fg' : 'text-fg hover:text-accent',
  );
  const icon = 'size-4 shrink-0 text-fg-subtle transition-colors group-hover/link:text-accent';
  const external = 'size-3 shrink-0 text-fg-subtle';

  return (
    <ul className={cn(size === 'md' ? 'space-y-4' : 'space-y-3', className)}>
      {CONTACT_EMAIL !== null && (
        <li>
          {/* break-all yalnızca adres satıra sığmazsa devreye girer. */}
          <a href={`mailto:${CONTACT_EMAIL}`} className={cn(link, 'break-all')}>
            <MailIcon className={icon} />
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
            className={link}
          >
            <WhatsAppIcon className={icon} />
            {CONTACT_PHONE.display}
            <ArrowUpRightIcon className={external} />
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
            className={link}
          >
            <SocialIcon id={social.id} className={icon} />
            {social.handle}
            <ArrowUpRightIcon className={external} />
          </a>
        </li>
      ))}
    </ul>
  );
}
