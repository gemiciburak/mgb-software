'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { type FormEvent, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { buttonStyles } from '@/components/ui/button';
import { ArrowRightIcon, MailIcon } from '@/components/ui/icons';
import { ServiceGlyph } from '@/components/ui/service-glyph';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { CALENDLY_URL, CONTACT_EMAIL, WHATSAPP_NUMBER } from '@/lib/constants';
import { DURATION, EASE_ENTRANCE } from '@/lib/motion';
import {
  BUDGET_RANGES,
  CONTACT_CHANNELS,
  CONTACT_LIMITS,
  isServiceSlug,
  PROJECT_STAGES,
  serviceNumber,
  TIMELINES,
  validateContactPayload,
  type BudgetRange,
  type ContactChannel,
  type ContactErrorCode,
  type ContactField,
  type ProjectStage,
  type ServiceSlug,
  type Timeline,
} from '@/shared';

/* ---------------------------------------------------------------------------
   Taslak — adımlar arasında ve sayfa yenilense de kaybolmayan durum
   --------------------------------------------------------------------------- */

const STORAGE_KEY = 'mgb-project-brief';

const STEPS = ['services', 'scope', 'details', 'contact'] as const;
type StepName = (typeof STEPS)[number];

/** Her adımın doğruladığı alanlar — shared'daki doğrulayıcıya verilir. */
const STEP_FIELDS: Record<StepName, readonly ContactField[]> = {
  services: ['services'],
  scope: ['budget', 'timeline', 'stage'],
  details: ['message'],
  contact: ['name', 'email', 'company', 'channel', 'consent'],
};

interface Draft {
  step: number;
  services: ServiceSlug[];
  /** "Emin değilim" — hizmet seçimiyle karşılıklı dışlayan açık bir seçim. */
  unsure: boolean;
  budget: BudgetRange | null;
  timeline: Timeline | null;
  stage: ProjectStage | null;
  message: string;
  name: string;
  email: string;
  company: string;
  channel: ContactChannel;
  consent: boolean;
}

const EMPTY_DRAFT: Draft = {
  step: 0,
  services: [],
  unsure: false,
  budget: null,
  timeline: null,
  stage: null,
  message: '',
  name: '',
  email: '',
  company: '',
  channel: 'email',
  consent: false,
};

type Errors = Partial<Record<ContactField, ContactErrorCode>>;

/** Yapılandırılmış kanallar: numarası/takvimi olmayan seçenek sunulmaz. */
const CHANNELS = CONTACT_CHANNELS.filter(
  (channel) =>
    channel === 'email' ||
    (channel === 'meeting' && CALENDLY_URL !== null) ||
    (channel === 'whatsapp' && WHATSAPP_NUMBER !== null),
);

function pick<T extends string>(list: readonly T[], value: unknown): T | null {
  return typeof value === 'string' && (list as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

/**
 * Saklanan taslağı güvenle okur. Bozuk ya da eski biçimli veri sessizce boş
 * taslağa düşer. Açık rıza bilinçli olarak geri yüklenmez: her gönderimde
 * kullanıcı tarafından yeniden verilmeli.
 */
function parseDraft(raw: string | null): Draft {
  if (!raw) return EMPTY_DRAFT;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const str = (value: unknown) => (typeof value === 'string' ? value : '');
    return {
      step: Math.min(Math.max(Number(data.step) || 0, 0), STEPS.length - 1),
      services: Array.isArray(data.services) ? data.services.filter(isServiceSlug) : [],
      unsure: data.unsure === true,
      budget: pick(BUDGET_RANGES, data.budget),
      timeline: pick(TIMELINES, data.timeline),
      stage: pick(PROJECT_STAGES, data.stage),
      message: str(data.message).slice(0, CONTACT_LIMITS.messageMax),
      name: str(data.name),
      email: str(data.email),
      company: str(data.company),
      channel: pick(CHANNELS, data.channel) ?? 'email',
      consent: false,
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

function readStoredDraft(): string {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

const subscribeNothing = () => () => {};

/* ---------------------------------------------------------------------------
   Dış bileşen — taslağı hidrasyon güvenli şekilde geri yükler
   --------------------------------------------------------------------------- */

export interface BriefService {
  slug: ServiceSlug;
  title: string;
}

/**
 * Proje başlatma formu — dört adım: ihtiyaç, kapsam, detaylar, iletişim.
 *
 * Taslak `sessionStorage`'da tutulur: sayfa yenilense ya da kullanıcı KVKK
 * metnine bakıp geri gelse de yazdıkları durur. Sunucu bunu bilemediği için
 * ilk render boş taslakla yapılır; hidrasyondan sonra `useSyncExternalStore`
 * saklanan değeri okur ve form `key` değişimiyle bir kez, taslakla yeniden
 * kurulur. Effect içinde setState yok, hidrasyon uyuşmazlığı yok.
 */
export function ProjectBrief({ services }: { services: readonly BriefService[] }) {
  const stored = useSyncExternalStore(subscribeNothing, readStoredDraft, () => null);

  return (
    <BriefForm
      key={stored === null ? 'server' : 'client'}
      initial={parseDraft(stored)}
      persist={stored !== null}
      services={services}
    />
  );
}

/* ---------------------------------------------------------------------------
   Form
   --------------------------------------------------------------------------- */

type Status = 'editing' | 'submitting' | 'sent' | 'failed';

function BriefForm({
  initial,
  persist,
  services,
}: {
  initial: Draft;
  /** Sunucu render'ında false: boş taslak saklanan taslağın üstüne yazılmasın. */
  persist: boolean;
  services: readonly BriefService[];
}) {
  const t = useTranslations('contact');
  const locale = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const uid = useId();

  const [draft, setDraft] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('editing');
  const [rateLimited, setRateLimited] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  /** Odak yalnızca kullanıcı adım değiştirince taşınır, ilk yüklemede değil. */
  const moveFocus = useRef(false);

  /**
   * Yeni adımın başlığı DOM'a girdiği an odağı alır.
   *
   * Effect ile yapılamıyor: AnimatePresence `mode="wait"` yeni adımı eski adımın
   * çıkış animasyonu BİTTİKTEN sonra ekliyor; effect o sırada kaybolmakta olan
   * eski başlığı buluyor ve odak gövdeye düşüyordu (ölçüldü). Ref callback'i
   * tam doğru anda, yeni başlık bağlanınca çalışır.
   */
  function focusOnMount(element: HTMLHeadingElement | null) {
    if (!element || !moveFocus.current) return;
    moveFocus.current = false;
    element.focus();
  }

  const stepName = STEPS[draft.step] ?? 'services';
  const isLast = draft.step === STEPS.length - 1;
  const fieldId = (field: ContactField) => `${uid}-${field}`;
  const errorId = (field: ContactField) => `${uid}-${field}-error`;

  useEffect(() => {
    if (!persist || status === 'sent') return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, consent: false }));
    } catch {
      // Gizli sekme veya kapalı depolama — form çalışır, yalnızca hatırlanmaz.
    }
  }, [draft, persist, status]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    const field = key === 'unsure' ? 'services' : key;
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field as ContactField];
      return next;
    });
  }

  function payload() {
    return {
      services: draft.services,
      budget: draft.budget,
      timeline: draft.timeline,
      stage: draft.stage,
      message: draft.message,
      name: draft.name,
      email: draft.email,
      company: draft.company,
      channel: draft.channel,
      consent: draft.consent,
      locale,
    };
  }

  function stepErrors(index: number): Errors {
    const name = STEPS[index] ?? 'services';
    const result = validateContactPayload(payload(), STEP_FIELDS[name]);
    const found: Errors = result.ok ? {} : { ...result.errors };
    if (name === 'services' && draft.services.length === 0 && !draft.unsure) {
      found.services = 'required';
    }
    return found;
  }

  function focusFirstError(found: Errors, index: number) {
    const first = STEP_FIELDS[STEPS[index] ?? 'services'].find((field) => field in found);
    if (first) requestAnimationFrame(() => document.getElementById(fieldId(first))?.focus());
  }

  function goTo(index: number) {
    moveFocus.current = true;
    setErrors({});
    setDraft((current) => ({ ...current, step: index }));
  }

  async function send() {
    // Bütün adımlar yeniden doğrulanır; hatalı ilk adıma dönülür.
    for (let index = 0; index < STEPS.length; index += 1) {
      const found = stepErrors(index);
      if (Object.keys(found).length > 0) {
        if (index !== draft.step) goTo(index);
        setErrors(found);
        focusFirstError(found, index);
        return;
      }
    }

    setStatus('submitting');
    setRateLimited(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload(), website: honeypot }),
      });

      if (response.ok) {
        try {
          window.sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // önemsiz
        }
        moveFocus.current = true;
        setStatus('sent');
        return;
      }

      if (response.status === 400) {
        const data = (await response.json().catch(() => null)) as { fields?: Errors } | null;
        const fields = data?.fields ?? {};
        const index = STEPS.findIndex((step) => STEP_FIELDS[step].some((field) => field in fields));
        if (index >= 0) {
          setStatus('editing');
          if (index !== draft.step) goTo(index);
          setErrors(fields);
          focusFirstError(fields, index);
          return;
        }
      }

      setRateLimited(response.status === 429);
    } catch {
      // Ağ hatası — aşağıdaki başarısız duruma düşer.
    }

    setStatus('failed');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    if (!isLast) {
      const found = stepErrors(draft.step);
      if (Object.keys(found).length > 0) {
        setErrors(found);
        focusFirstError(found, draft.step);
        return;
      }
      goTo(draft.step + 1);
      return;
    }

    void send();
  }

  /** Gönderim başarısızsa aynı içerikle hazır e-posta — yazılanlar kaybolmaz. */
  function mailtoHref(): string {
    const serviceTitles = new Map(services.map((service) => [service.slug, service.title]));
    const lines = [
      `${t('mail.services')}: ${
        draft.services.length > 0
          ? draft.services.map((slug) => serviceTitles.get(slug) ?? slug).join(', ')
          : t('mail.unsure')
      }`,
      `${t('mail.budget')}: ${draft.budget ? t(`budget.${draft.budget}`) : '—'}`,
      `${t('mail.timeline')}: ${draft.timeline ? t(`timeline.${draft.timeline}`) : '—'}`,
      `${t('mail.stage')}: ${draft.stage ? t(`stage.${draft.stage}`) : '—'}`,
      `${t('mail.channel')}: ${t(`channel.${draft.channel}`)}`,
      `${t('mail.company')}: ${draft.company || '—'}`,
      '',
      `${t('mail.message')}:`,
      draft.message,
      '',
      `— ${draft.name}`,
    ];
    const subject = t('mail.subject', { name: draft.name });
    return `mailto:${CONTACT_EMAIL ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  }

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: DURATION.base, ease: EASE_ENTRANCE },
      };

  if (status === 'sent') {
    return (
      <SentPanel
        headingRef={focusOnMount}
        name={draft.name}
        email={draft.email}
        preferMeeting={draft.channel === 'meeting'}
        onReset={() => {
          moveFocus.current = true;
          setDraft({ ...EMPTY_DRAFT, channel: draft.channel });
          setStatus('editing');
        }}
      />
    );
  }

  const error = (field: ContactField): string | null => {
    const code = errors[field];
    if (!code) return null;
    if (field === 'services') return t('errors.services');
    if (field === 'consent') return t('errors.consent');
    if (field === 'email' && code === 'invalid') return t('errors.email');
    if (code === 'too-short') return t('errors.too-short', { min: CONTACT_LIMITS.messageMin });
    if (code === 'too-long') {
      const max =
        field === 'message'
          ? CONTACT_LIMITS.messageMax
          : field === 'email'
            ? CONTACT_LIMITS.emailMax
            : CONTACT_LIMITS.nameMax;
      return t('errors.too-long', { max });
    }
    return t(`errors.${code}`);
  };

  const describe = (field: ContactField, hintId?: string) =>
    [hintId, errors[field] ? errorId(field) : null].filter(Boolean).join(' ') || undefined;

  return (
    <form noValidate onSubmit={handleSubmit} className="relative">
      <StepProgress current={draft.step} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={stepName} {...motionProps} className="mt-12">
          <h2 ref={focusOnMount} tabIndex={-1} className="text-display-3 outline-none">
            <span className="sr-only">
              {t('progress', { current: draft.step + 1, total: STEPS.length })} —{' '}
            </span>
            {t(`${stepName}.title`)}
          </h2>

          {stepName === 'services' && (
            <fieldset
              className="mt-8"
              aria-describedby={describe('services', `${uid}-services-hint`)}
            >
              <legend className="sr-only">{t('services.title')}</legend>
              <p id={`${uid}-services-hint`} className="text-body-sm text-fg-muted">
                {t('services.hint')}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service, index) => {
                  const checked = draft.services.includes(service.slug);
                  return (
                    <label
                      key={service.slug}
                      className={cn(
                        CARD_CLASS,
                        'flex-col items-start gap-4 p-5',
                        checked && 'border-accent bg-accent-wash',
                      )}
                    >
                      <input
                        id={index === 0 ? fieldId('services') : undefined}
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        aria-invalid={Boolean(errors.services)}
                        onChange={(event) => {
                          update(
                            'services',
                            event.target.checked
                              ? [...draft.services, service.slug]
                              : draft.services.filter((slug) => slug !== service.slug),
                          );
                          if (event.target.checked) update('unsure', false);
                        }}
                      />
                      <span className="flex w-full items-start justify-between">
                        <span
                          className={cn(
                            'font-mono text-mono-sm tabular-nums',
                            checked ? 'text-accent' : 'text-fg-subtle',
                          )}
                        >
                          {serviceNumber(service.slug)}
                        </span>
                        <CheckMark checked={checked} shape="square" />
                      </span>
                      <ServiceGlyph
                        slug={service.slug}
                        className={cn(
                          'h-14 w-auto transition-colors',
                          checked ? 'text-accent' : 'text-line-strong',
                        )}
                      />
                      <span className="text-title">{service.title}</span>
                    </label>
                  );
                })}
              </div>

              <label
                className={cn(
                  CARD_CLASS,
                  'mt-3 gap-3 px-5 py-4',
                  draft.unsure && 'border-accent bg-accent-wash',
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={draft.unsure}
                  onChange={(event) => {
                    update('unsure', event.target.checked);
                    if (event.target.checked) update('services', []);
                  }}
                />
                <CheckMark checked={draft.unsure} shape="square" />
                <span className="text-body">{t('services.unsure')}</span>
              </label>

              <FieldError id={errorId('services')} message={error('services')} />
            </fieldset>
          )}

          {stepName === 'scope' && (
            <div className="mt-8 space-y-10">
              <p className="text-body-sm text-fg-muted">{t('scope.hint')}</p>
              <ChoiceGroup
                legend={t('budget.label')}
                name={`${uid}-budget`}
                firstId={fieldId('budget')}
                options={BUDGET_RANGES.map((value) => ({ value, label: t(`budget.${value}`) }))}
                value={draft.budget}
                onChange={(value) => update('budget', value)}
                error={error('budget')}
                errorId={errorId('budget')}
              />
              <ChoiceGroup
                legend={t('timeline.label')}
                name={`${uid}-timeline`}
                firstId={fieldId('timeline')}
                options={TIMELINES.map((value) => ({ value, label: t(`timeline.${value}`) }))}
                value={draft.timeline}
                onChange={(value) => update('timeline', value)}
                error={error('timeline')}
                errorId={errorId('timeline')}
              />
              <ChoiceGroup
                legend={t('stage.label')}
                name={`${uid}-stage`}
                firstId={fieldId('stage')}
                options={PROJECT_STAGES.map((value) => ({ value, label: t(`stage.${value}`) }))}
                value={draft.stage}
                onChange={(value) => update('stage', value)}
                error={error('stage')}
                errorId={errorId('stage')}
              />
            </div>
          )}

          {stepName === 'details' && (
            <div className="mt-8">
              <label htmlFor={fieldId('message')} className={LABEL_CLASS}>
                {t('details.label')}
              </label>
              <p
                id={`${uid}-message-hint`}
                className="mt-2 max-w-[60ch] text-body-sm text-fg-muted"
              >
                {t('details.hint')}
              </p>
              <textarea
                id={fieldId('message')}
                rows={8}
                maxLength={CONTACT_LIMITS.messageMax}
                value={draft.message}
                onChange={(event) => update('message', event.target.value)}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={describe('message', `${uid}-message-hint ${uid}-message-count`)}
                className={cn(INPUT_CLASS, 'mt-4 h-auto min-h-48 resize-y py-3 leading-relaxed')}
              />
              <div className="mt-2 flex items-start justify-between gap-4">
                <FieldError id={errorId('message')} message={error('message')} />
                <span
                  id={`${uid}-message-count`}
                  className="ml-auto shrink-0 font-mono text-mono-sm text-fg-subtle tabular-nums"
                >
                  {t('details.counter', {
                    count: draft.message.trim().length,
                    max: CONTACT_LIMITS.messageMax,
                  })}
                </span>
              </div>
            </div>
          )}

          {stepName === 'contact' && (
            <div className="mt-8 space-y-7">
              <div className="grid gap-7 md:grid-cols-2">
                <TextField
                  id={fieldId('name')}
                  label={t('contact.name')}
                  value={draft.name}
                  onChange={(value) => update('name', value)}
                  autoComplete="name"
                  maxLength={CONTACT_LIMITS.nameMax}
                  error={error('name')}
                  errorId={errorId('name')}
                />
                <TextField
                  id={fieldId('email')}
                  label={t('contact.email')}
                  type="email"
                  inputMode="email"
                  value={draft.email}
                  onChange={(value) => update('email', value)}
                  autoComplete="email"
                  maxLength={CONTACT_LIMITS.emailMax}
                  error={error('email')}
                  errorId={errorId('email')}
                />
              </div>
              <TextField
                id={fieldId('company')}
                label={t('contact.company')}
                optional={t('contact.optional')}
                value={draft.company}
                onChange={(value) => update('company', value)}
                autoComplete="organization"
                maxLength={CONTACT_LIMITS.companyMax}
                error={error('company')}
                errorId={errorId('company')}
              />

              {CHANNELS.length > 1 && (
                <ChoiceGroup
                  legend={t('channel.label')}
                  name={`${uid}-channel`}
                  firstId={fieldId('channel')}
                  options={CHANNELS.map((value) => ({ value, label: t(`channel.${value}`) }))}
                  value={draft.channel}
                  onChange={(value) => update('channel', value)}
                  error={error('channel')}
                  errorId={errorId('channel')}
                />
              )}

              <div>
                <label
                  className={cn(
                    CARD_CLASS,
                    'items-start gap-4 p-5',
                    draft.consent && 'border-accent bg-accent-wash',
                  )}
                >
                  <input
                    id={fieldId('consent')}
                    type="checkbox"
                    className="sr-only"
                    checked={draft.consent}
                    onChange={(event) => update('consent', event.target.checked)}
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={describe('consent', `${uid}-consent-notice`)}
                  />
                  <CheckMark checked={draft.consent} shape="square" className="mt-0.5" />
                  <span className="text-body-sm text-fg">{t('consent.label')}</span>
                </label>
                <p id={`${uid}-consent-notice`} className="mt-3 text-body-sm text-fg-muted">
                  <Link
                    href="/kvkk"
                    target="_blank"
                    className="rounded-xs text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
                  >
                    {t('consent.notice')}
                  </Link>{' '}
                  {CONTACT_EMAIL !== null && t('consent.alternative', { email: CONTACT_EMAIL })}
                </p>
                <FieldError id={errorId('consent')} message={error('consent')} />
              </div>

              {/* Bal küpü: insanlar görmez, botlar doldurur (bkz. api/contact). */}
              <div aria-hidden="true" className="absolute -left-[10000px] size-px overflow-hidden">
                <label>
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(event) => setHoneypot(event.target.value)}
                  />
                </label>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {status === 'failed' && (
        <div role="alert" className="mt-10 border-l-2 border-accent bg-bg-subtle px-6 py-5">
          <p className="text-title">{t('failed.title')}</p>
          <p className="mt-2 max-w-[60ch] text-body-sm text-fg-muted">
            {rateLimited ? t('failed.rateLimited') : t('failed.body')}
          </p>
          {CONTACT_EMAIL !== null && (
            <a href={mailtoHref()} className={buttonStyles({ size: 'sm', className: 'mt-4' })}>
              <MailIcon className="size-4" />
              {t('failed.mail')}
            </a>
          )}
        </div>
      )}

      <div className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-6">
        {draft.step > 0 ? (
          <button
            type="button"
            onClick={() => goTo(draft.step - 1)}
            className={buttonStyles({ variant: 'ghost' })}
          >
            {t('nav.back')}
          </button>
        ) : (
          <span aria-hidden="true" />
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          aria-busy={status === 'submitting'}
          className={buttonStyles()}
        >
          {isLast
            ? status === 'submitting'
              ? t('nav.submitting')
              : status === 'failed'
                ? t('failed.retry')
                : t('nav.submit')
            : t('nav.next')}
          {status !== 'submitting' && <ArrowRightIcon className="size-4" />}
        </button>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------------------
   Parçalar
   --------------------------------------------------------------------------- */

const CARD_CLASS =
  'relative flex cursor-pointer rounded-sm border border-line bg-bg transition-colors ' +
  'duration-[var(--duration-fast)] hover:border-line-strong ' +
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent';

const LABEL_CLASS = 'block font-mono text-label text-fg-muted';

const INPUT_CLASS =
  'block h-12 w-full rounded-sm border border-line-strong bg-surface px-4 text-body text-fg ' +
  'transition-colors duration-[var(--duration-fast)] placeholder:text-fg-subtle ' +
  'hover:border-fg-subtle focus-visible:border-accent focus-visible:outline-offset-0 ' +
  'aria-[invalid=true]:border-accent';

/** Seçim göstergesi. Seçili hali yalnızca renkle değil işaretle de belli. */
function CheckMark({
  checked,
  shape,
  className,
}: {
  checked: boolean;
  shape: 'square' | 'circle';
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-4.5 shrink-0 items-center justify-center border transition-colors',
        shape === 'circle' ? 'rounded-full' : 'rounded-xs',
        checked ? 'border-accent bg-accent text-accent-fg' : 'border-line-strong bg-surface',
        className,
      )}
    >
      {checked &&
        (shape === 'circle' ? (
          <span className="size-1.5 rounded-full bg-current" />
        ) : (
          <svg
            viewBox="0 0 12 12"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M2.5 6.2 5 8.5l4.5-5" />
          </svg>
        ))}
    </span>
  );
}

function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-3 flex items-baseline gap-2 text-body-sm text-fg">
      <span aria-hidden="true" className="font-mono text-mono-sm text-accent">
        !
      </span>
      {message}
    </p>
  );
}

function ChoiceGroup<T extends string>({
  legend,
  name,
  firstId,
  options,
  value,
  onChange,
  error,
  errorId,
}: {
  legend: string;
  name: string;
  firstId: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  error: string | null;
  errorId: string;
}) {
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className={LABEL_CLASS}>{legend}</legend>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {options.map((option, index) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                CARD_CLASS,
                'items-center gap-3 px-4 py-3',
                checked && 'border-accent bg-accent-wash',
              )}
            >
              <input
                id={index === 0 ? firstId : undefined}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <CheckMark checked={checked} shape="circle" />
              <span className="text-body-sm text-fg">{option.label}</span>
            </label>
          );
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}

function TextField({
  id,
  label,
  optional,
  value,
  onChange,
  error,
  errorId,
  type = 'text',
  ...inputProps
}: {
  id: string;
  label: string;
  optional?: string;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  errorId: string;
  type?: 'text' | 'email';
  autoComplete: string;
  maxLength: number;
  inputMode?: 'email';
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
        {optional && <span className="ml-2 text-fg-subtle">({optional})</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(INPUT_CLASS, 'mt-3')}
        {...inputProps}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

/** Dört kademe: mono numara + dolan hairline, sitenin "Neden MGB" diliyle. */
function StepProgress({ current }: { current: number }) {
  const t = useTranslations('contact');

  return (
    <div>
      <p className="font-mono text-mono-sm text-fg-subtle tabular-nums" aria-hidden="true">
        <span className="text-accent">{String(current + 1).padStart(2, '0')}</span> /{' '}
        {String(STEPS.length).padStart(2, '0')}
      </p>
      <ol className="mt-4 grid grid-cols-4 gap-2">
        {STEPS.map((step, index) => (
          <li key={step} aria-current={index === current ? 'step' : undefined}>
            <span aria-hidden="true" className="relative block h-0.5 overflow-hidden bg-line">
              <span
                className={cn(
                  'absolute inset-0 origin-left bg-accent transition-transform duration-[var(--duration-slow)] ease-[var(--ease-entrance)]',
                  index <= current ? 'scale-x-100' : 'scale-x-0',
                )}
              />
            </span>
            <span
              className={cn(
                'mt-3 block font-mono text-mono-sm',
                index === current ? 'text-fg' : 'text-fg-subtle',
              )}
            >
              <span className="sr-only">{String(index + 1)}. </span>
              <span className="hidden sm:inline">{t(`stepNames.${step}`)}</span>
              <span className="sm:hidden" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="sr-only sm:hidden">{t(`stepNames.${step}`)}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Teşekkür ekranı + ön görüşme
   --------------------------------------------------------------------------- */

/**
 * Calendly üçüncü taraf bir hizmet ve çerez bırakıyor; bu yüzden iframe
 * kendiliğinden yüklenmez, kullanıcı "Görüşme planla" deyince yüklenir.
 * Ad ve e-posta Calendly'ye önceden doldurulmuş gider.
 */
function SentPanel({
  headingRef,
  name,
  email,
  preferMeeting,
  onReset,
}: {
  headingRef: (element: HTMLHeadingElement | null) => void;
  name: string;
  email: string;
  preferMeeting: boolean;
  onReset: () => void;
}) {
  const t = useTranslations('contact');
  const [calendarSrc, setCalendarSrc] = useState<string | null>(null);

  const calendlyLink =
    CALENDLY_URL === null
      ? null
      : `${CALENDLY_URL}?${new URLSearchParams({ name, email }).toString()}`;

  return (
    <div role="status">
      <p className="font-mono text-label text-accent">{t('sent.eyebrow')}</p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-5 max-w-[20ch] text-display-2 outline-none">
        {t('sent.title')}
      </h2>
      <p className="mt-6 max-w-[52ch] text-body-lg text-fg-muted">{t('sent.body', { email })}</p>

      {calendlyLink !== null && (
        <div className="mt-12 border-t border-line pt-8">
          <h3 className="text-title">{t('sent.meetingTitle')}</h3>
          <p className="mt-2 text-body text-fg-muted">{t('sent.meetingBody')}</p>

          {calendarSrc === null ? (
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                type="button"
                onClick={() =>
                  setCalendarSrc(
                    `${calendlyLink}&${new URLSearchParams({
                      embed_domain: window.location.host,
                      embed_type: 'Inline',
                    }).toString()}`,
                  )
                }
                className={buttonStyles({ variant: preferMeeting ? 'primary' : 'secondary' })}
              >
                {t('sent.meetingCta')}
              </button>
              <a
                href={calendlyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xs text-body-sm text-fg-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg"
              >
                {t('sent.meetingOpen')}
              </a>
            </div>
          ) : (
            <iframe
              src={calendarSrc}
              title={t('sent.calendarTitle')}
              className="mt-6 h-[44rem] w-full rounded-sm border border-line bg-surface"
            />
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className={buttonStyles({ variant: 'ghost', className: 'mt-12 -ml-6' })}
      >
        {t('sent.again')}
      </button>
    </div>
  );
}
