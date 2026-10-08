import { getContent } from '@/content';
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/constants';
import labels from '@/messages/tr.json';
import { serviceNumber, validateContactPayload, type ContactPayload } from '@/shared';

/**
 * Proje başlatma formunun uç noktası.
 *
 * Veritabanı yok: doğrulanan talep Resend üzerinden ekibin gelen kutusuna
 * e-posta olarak düşer, `Reply-To` müşterinin adresidir — "Yanıtla" demek
 * yeterli. Doğrulama istemcinin kullandığı fonksiyonun AYNISI (`@/shared`).
 *
 * Ortam değişkenleri (bkz. .env.example):
 *   RESEND_API_KEY      — zorunlu
 *   CONTACT_FROM_EMAIL  — zorunlu, Resend'de doğrulanmış alan adından
 *   CONTACT_TO_EMAIL    — isteğe bağlı, varsayılan CONTACT_EMAIL
 * Biri eksikse 503 döner ve form kullanıcıya "e-posta ile gönder" yolunu
 * açar. Sahte başarı yanıtı verilmez.
 */

const MAX_BODY_BYTES = 20_000;

/** İstemcinin ürettiği gönderim kimliği — crypto.randomUUID() biçimi. */
const SUBMISSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Basit hız sınırı: IP başına 10 dakikada 5 talep.
 *
 * Bellekte tutulur, yani sunucu örneği başınadır — sunucusuz ortamda
 * örnekler arasında paylaşılmaz. Amaç tek kaynaktan gelen seri denemeleri
 * kesmek; dağıtık saldırıya karşı koruma değil. Spam artarsa Turnstile gibi
 * bir doğrulama eklenmeli.
 */
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 } as const;
const attempts = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < RATE_LIMIT.windowMs);
  recent.push(now);
  attempts.set(key, recent);

  // Harita sınırsız büyümesin.
  if (attempts.size > 5_000) {
    for (const [ip, times] of attempts) {
      if (times.every((time) => now - time >= RATE_LIMIT.windowMs)) attempts.delete(ip);
    }
  }

  return recent.length > RATE_LIMIT.max;
}

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Origin başlığı kendi alan adımız mı? `null` veya bozuk değer reddedilir. */
function isSameOrigin(origin: string, host: string): boolean {
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Gövdeyi en fazla `limit` BAYT okuyarak alır; aşılırsa `null`.
 *
 * Önce Content-Length'e bakılır, ama ona güvenilmez: akış okunurken bayt
 * sayılır ve sınır aşıldığı an okuma kesilir — dev bir gövde belleğe
 * alınmaz. `string.length` UTF-16 birimi saydığı için bayt sınırı değildi.
 */
async function readBody(request: Request, limit: number): Promise<string | null> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > limit) return null;
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Ekibe giden e-postanın satırları. Ekip Türkçe çalıştığı için etiketler TR. */
function summaryRows(payload: ContactPayload): [string, string][] {
  const t = labels.contact;
  const titles = new Map(
    getContent('tr').home.services.entries.map((entry) => [entry.slug, entry.title]),
  );
  const services =
    payload.services.length > 0
      ? payload.services
          .map((slug) => `${serviceNumber(slug)} ${titles.get(slug) ?? slug}`)
          .join(', ')
      : t.mail.unsure;

  return [
    [t.mail.name, payload.name],
    [t.mail.email, payload.email],
    [t.mail.company, payload.company || '—'],
    [t.mail.channel, t.channel[payload.channel]],
    [t.mail.services, services],
    [t.mail.budget, t.budget[payload.budget]],
    [t.mail.timeline, t.timeline[payload.timeline]],
    [t.mail.stage, t.stage[payload.stage]],
    ['Dil', payload.locale.toUpperCase()],
  ];
}

function buildEmail(payload: ContactPayload) {
  const rows = summaryRows(payload);
  const subject = labels.contact.mail.subject.replace('{name}', payload.name);

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    `${labels.contact.mail.message}:`,
    payload.message,
  ].join('\n');

  const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#0d1015;line-height:1.55">
<table cellpadding="6" style="border-collapse:collapse;font-size:14px">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="color:#4c525a;vertical-align:top">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
    )
    .join('')}</table>
<h3 style="font-size:14px;margin:20px 0 6px">${escapeHtml(labels.contact.mail.message)}</h3>
<p style="white-space:pre-wrap;font-size:14px;margin:0">${escapeHtml(payload.message)}</p>
</body></html>`;

  return { subject, text, html };
}

export async function POST(request: Request): Promise<Response> {
  // Yalnızca kendi sayfamızdan gelen istekler. Tarayıcı Origin başlığını
  // her POST'ta gönderir; başka bir siteden form gönderimi burada kesilir.
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (origin && host && !isSameOrigin(origin, host)) {
    return json({ error: 'forbidden' }, 403);
  }

  const raw = await readBody(request, MAX_BODY_BYTES);
  if (raw === null) return json({ error: 'too-large' }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid' }, 400);
  }

  // Bal küpü: gerçek kullanıcı bu alanı hiç görmez (görsel olarak ve
  // erişilebilirlik ağacından gizli). Doluysa gönderen bir bottur; hata
  // vermek ona hangi alanın tuzak olduğunu öğretirdi, sessizce yutulur.
  if (typeof body === 'object' && body !== null && (body as { website?: unknown }).website) {
    return json({ ok: true }, 200);
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) return json({ error: 'rate-limited' }, 429);

  const result = validateContactPayload(body);
  if (!result.ok) return json({ error: 'invalid', fields: result.errors }, 400);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || CONTACT_EMAIL;
  if (!apiKey || !from || !to) {
    return json({ error: 'unavailable' }, 503);
  }

  const email = buildEmail(result.data);

  // Aynı gönderimin yeniden denenmesi (ör. istemci zaman aşımına düştü ama
  // ilk istek aslında ulaştı) ikinci bir e-posta üretmesin: Resend aynı
  // anahtarı 24 saat boyunca tek gönderim sayar.
  const submissionId = request.headers.get('x-submission-id');
  const idempotency: Record<string, string> =
    submissionId && SUBMISSION_ID.test(submissionId)
      ? { 'Idempotency-Key': `contact-${submissionId}` }
      : {};

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...idempotency,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: result.data.email,
        subject: `${email.subject} · ${SITE_NAME}`,
        text: email.text,
        html: email.html,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      // Kişisel veri loglanmaz; yalnızca servis durumu.
      console.error(`[contact] Resend ${response.status}`);
      return json({ error: 'unavailable' }, 502);
    }
  } catch (error) {
    console.error('[contact] Resend isteği başarısız', error instanceof Error ? error.name : '');
    return json({ error: 'unavailable' }, 502);
  }

  return json({ ok: true }, 200);
}
