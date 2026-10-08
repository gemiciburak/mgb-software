/**
 * Hizmet grupları. Sıra önemlidir: ana sayfadaki numaralı liste (01–06) ve
 * hizmet detay sayfalarının sırası bu diziden gelir.
 */

export const SERVICE_SLUGS = [
  'web-development',
  'ui-ux-design',
  'software-backend',
  'mobile-apple',
  'e-commerce',
  'technical-design-3d',
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export function isServiceSlug(value: unknown): value is ServiceSlug {
  return typeof value === 'string' && (SERVICE_SLUGS as readonly string[]).includes(value);
}

/** Listede gösterilen iki haneli numara: 'web-development' → '01' */
export function serviceNumber(slug: ServiceSlug): string {
  return String(SERVICE_SLUGS.indexOf(slug) + 1).padStart(2, '0');
}
