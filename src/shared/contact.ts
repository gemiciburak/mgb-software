import { isLocale, type Locale } from './locale';
import { isServiceSlug, type ServiceSlug } from './service';

/**
 * Proje başlatma formunun sözleşmesi.
 *
 * Seçenekler serbest metin değil sabit değerler: gelen talepler karşılaştırılabilir
 * kalsın ve etiketler dile göre çevrilebilsin (etiketler web'in messages
 * dosyalarında). Doğrulama da burada — istemci her adımda, sunucu gönderimde
 * AYNI fonksiyonu çalıştırır, iki kural seti birbirinden kopamaz.
 */

/** Bütçe aralıkları, Türk lirası (KDV hariç). */
export const BUDGET_RANGES = [
  'under-50k',
  '50k-150k',
  '150k-500k',
  'over-500k',
  'undecided',
] as const;
export type BudgetRange = (typeof BUDGET_RANGES)[number];

export const TIMELINES = ['urgent', '1-3-months', 'flexible'] as const;
export type Timeline = (typeof TIMELINES)[number];

/** Sıfırdan mı, mevcut bir ürünün geliştirilmesi mi? */
export const PROJECT_STAGES = ['new', 'existing'] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

/** Müşterinin tercih ettiği dönüş kanalı. */
export const CONTACT_CHANNELS = ['email', 'meeting', 'whatsapp'] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export const CONTACT_LIMITS = {
  messageMin: 20,
  messageMax: 3000,
  nameMax: 120,
  companyMax: 120,
  emailMax: 254,
} as const;

/** Formun gönderdiği yük. */
export interface ContactPayload {
  /** İlgilenilen hizmetler. Boş dizi: "Emin değilim, birlikte bakalım". */
  services: ServiceSlug[];
  budget: BudgetRange;
  timeline: Timeline;
  stage: ProjectStage;
  message: string;
  name: string;
  email: string;
  /** İsteğe bağlı; boş olabilir. */
  company: string;
  channel: ContactChannel;
  /** KVKK açık rızası. `true` olmadan talep kabul edilmez. */
  consent: true;
  /** Yanıt e-postasının dili. */
  locale: Locale;
}

export type ContactField = Exclude<keyof ContactPayload, 'locale'>;
export type ContactErrorCode = 'required' | 'invalid' | 'too-short' | 'too-long';
export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;

export type ContactValidation =
  { ok: true; data: ContactPayload } | { ok: false; errors: ContactErrors };

/** Pratik bir kontrol: RFC'nin tamamı değil, yazım hatalarını yakalayacak kadar. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function oneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value);
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Ham girdiyi doğrular ve temizlenmiş yükü döner.
 *
 * `fields` verilirse yalnızca o alanlar kontrol edilir — çok adımlı formda her
 * adım kendi alanlarını doğrular. Sunucu `fields` vermez, her şeyi kontrol eder.
 */
export function validateContactPayload(
  input: unknown,
  fields?: readonly ContactField[],
): ContactValidation {
  const raw = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  const errors: ContactErrors = {};
  const check = (field: ContactField) => !fields || fields.includes(field);

  const services = Array.isArray(raw.services) ? raw.services : null;
  if (check('services') && (services === null || !services.every(isServiceSlug))) {
    errors.services = 'invalid';
  }

  if (check('budget') && !oneOf(BUDGET_RANGES, raw.budget)) errors.budget = 'required';
  if (check('timeline') && !oneOf(TIMELINES, raw.timeline)) errors.timeline = 'required';
  if (check('stage') && !oneOf(PROJECT_STAGES, raw.stage)) errors.stage = 'required';

  const message = text(raw.message);
  if (check('message')) {
    if (!message) errors.message = 'required';
    else if (message.length < CONTACT_LIMITS.messageMin) errors.message = 'too-short';
    else if (message.length > CONTACT_LIMITS.messageMax) errors.message = 'too-long';
  }

  const name = text(raw.name);
  if (check('name')) {
    if (!name) errors.name = 'required';
    else if (name.length > CONTACT_LIMITS.nameMax) errors.name = 'too-long';
  }

  const email = text(raw.email);
  if (check('email')) {
    if (!email) errors.email = 'required';
    else if (email.length > CONTACT_LIMITS.emailMax || !EMAIL_PATTERN.test(email)) {
      errors.email = 'invalid';
    }
  }

  const company = text(raw.company);
  if (check('company') && company.length > CONTACT_LIMITS.companyMax) errors.company = 'too-long';

  if (check('channel') && !oneOf(CONTACT_CHANNELS, raw.channel)) errors.channel = 'required';
  if (check('consent') && raw.consent !== true) errors.consent = 'required';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  // Kısmi doğrulamada tam yük üretilmez; çağıran yalnızca `ok`a bakar.
  if (fields) return { ok: true, data: raw as unknown as ContactPayload };

  return {
    ok: true,
    data: {
      services: [...new Set(services as ServiceSlug[])],
      budget: raw.budget as BudgetRange,
      timeline: raw.timeline as Timeline,
      stage: raw.stage as ProjectStage,
      message,
      name,
      email,
      company,
      channel: raw.channel as ContactChannel,
      consent: true,
      locale: isLocale(raw.locale) ? raw.locale : 'tr',
    },
  };
}
