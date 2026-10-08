import type { SVGProps } from 'react';
import type { SocialId } from '@/lib/constants';

/**
 * İkon seti.
 *
 * Hepsi 16×16 kutuda, 1.25px çizgi kalınlığında ve kare uçlu — teknik çizim
 * diliyle aynı. Dolgu yerine `currentColor` konturu kullanılır, böylece
 * her iki temada ve her metin renginde doğru görünürler.
 *
 * İkonlar dekoratiftir: `aria-hidden` varsayılan olarak açık, erişilebilir
 * isim her zaman onları saran düğme veya linkte durur.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Açık tema — çember ve ışınlar. */
export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v1.75M8 13.25V15M1 8h1.75M13.25 8H15M3.05 3.05l1.24 1.24M11.71 11.71l1.24 1.24M12.95 3.05l-1.24 1.24M4.29 11.71l-1.24 1.24" />
    </Icon>
  );
}

/** Koyu tema — hilal. */
export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.5 9.6A5.9 5.9 0 0 1 6.4 2.5a5.9 5.9 0 1 0 7.1 7.1Z" />
    </Icon>
  );
}

/** Sistem teması — yarısı dolu çember. */
export function SystemIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 2.5a5.5 5.5 0 0 0 0 11Z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/** Mobil menü — bilinçli olarak iki çizgi, farklı uzunlukta. */
export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M1.5 5.5h13M1.5 10.5h8.5" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 3l10 10M13 3L3 13" />
    </Icon>
  );
}

/** Dış/ileri bağlantı göstergesi. */
export function ArrowUpRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 8h12M9.5 3.5L14 8l-4.5 4.5" />
    </Icon>
  );
}

/** Hareketi durdur — iki dikey çizgi. */
export function PauseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5.5 3v10M10.5 3v10" />
    </Icon>
  );
}

/** Hareketi başlat — üçgen. */
export function PlayIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 2.75v10.5L13 8z" />
    </Icon>
  );
}

/** E-posta — zarf. */
export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M1.5 3.5h13v9h-13z" />
      <path d="M1.5 3.5 8 8.6l6.5-5.1" />
    </Icon>
  );
}

/**
 * WhatsApp — kuyruklu konuşma balonu ve içinde ahize. Instagram gibi kontur
 * hali; dolu marka logosu ikon setinde yama gibi dururdu. Balon eğrisi
 * köşeli birleşimde kırık göründüğü için bu ikonda uçlar yuvarlak.
 */
export function WhatsAppIcon(props: IconProps) {
  return (
    <Icon strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 1.75a6.25 6.25 0 0 0-5.4 9.4L1.75 14.25l3.2-.83A6.25 6.25 0 1 0 8 1.75Z" />
      <path d="M5.9 5.3c-.2.5-.1 1.4.6 2.4.8 1.1 1.8 1.8 2.6 2 .6.1 1-.1 1.3-.5l.2-.5-1.3-.7-.6.5c-.6-.3-1.2-.9-1.5-1.5l.5-.6-.6-1.3h-.5c-.3 0-.6.1-.7.2Z" />
    </Icon>
  );
}

/**
 * Instagram.
 *
 * Markanın dolu işareti yerine kontur hali: ikon setinin geri kalanı da
 * konturdan oluşuyor, dolu bir logo aralarında yama gibi dururdu. Teknoloji
 * bölümündeki marka işaretleri ayrı bir mesele — orada logo zaten konu.
 */
export function InstagramIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="1.9" y="1.9" width="12.2" height="12.2" rx="3.6" />
      <circle cx="8" cy="8" r="3" />
      <circle cx="11.4" cy="4.6" r="0.85" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/** Hesap türünden ikona. Yeni bir ağ eklenince buraya da eklenmeli. */
const SOCIAL_ICONS: Record<SocialId, (props: IconProps) => React.ReactElement> = {
  instagram: InstagramIcon,
};

export function SocialIcon({ id, ...props }: IconProps & { id: SocialId }) {
  const Glyph = SOCIAL_ICONS[id];
  return <Glyph {...props} />;
}
