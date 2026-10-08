import type { MetadataRoute } from 'next';
import { LOCALE_TAGS, LOCALES } from '@/shared';
import { getPathname } from '@/i18n/navigation';
import { PUBLISHED_ROUTES, SITE_URL } from '@/lib/constants';

/**
 * Sitemap yalnızca GERÇEKTEN var olan rotaları listeler (bkz.
 * `PUBLISHED_ROUTES`, lib/constants.ts) — arama motorlarına 404 adresi
 * bildirilmez.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLISHED_ROUTES.flatMap((pathname) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${getPathname({ href: pathname, locale })}`,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((candidate) => [
            LOCALE_TAGS[candidate],
            `${SITE_URL}${getPathname({ href: pathname, locale: candidate })}`,
          ]),
        ),
      },
    })),
  );
}
