import { getTranslations } from 'next-intl/server';

/**
 * Klavye kullanıcılarının navigasyonu atlayıp doğrudan içeriğe gitmesi için.
 * Sayfadaki ilk odaklanabilir öğe olmalı; odaklanınca görünür hale gelir.
 */
export async function SkipLink() {
  const t = await getTranslations('a11y');

  return (
    <a
      href="#main"
      className="sr-only-focusable z-50 rounded-sm bg-accent px-4 py-2 font-mono text-label text-accent-fg focus-visible:top-4 focus-visible:left-4 focus-visible:outline-offset-4"
    >
      {t('skipToContent')}
    </a>
  );
}
