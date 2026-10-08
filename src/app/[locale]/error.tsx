'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { StatusScreen } from '@/components/sections/status-screen';
import { Button, buttonStyles } from '@/components/ui/button';
import { getPathname } from '@/i18n/navigation';

/**
 * Dil segmenti içindeki beklenmeyen çalışma hataları.
 *
 * Layout'un altında render edildiği için navigasyon ve footer yerinde kalır;
 * kullanıcı sayfayı yeniden denemeden de siteyi kullanmaya devam edebilir.
 * Hata ayrıntısı ekrana yazılmaz — üretimde zaten gizlenir, geliştirmede
 * konsola düşer.
 */
export default function ErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations('error');
  const tNotFound = useTranslations('notFound');
  const locale = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen code={t('code')} title={t('title')} description={t('description')}>
      <Button type="button" onClick={() => retry()}>
        {t('retry')}
      </Button>
      {/* Bilinçli olarak düz <a>: istemci tarafı yönlendirme aynı rotada hata
          sınırını sıfırlamıyor, kullanıcı bu ekranda kalıyordu (ölçüldü).
          Tam sayfa yüklemesi hatalı durumu temizler. */}
      <a
        href={getPathname({ href: '/', locale })}
        className={buttonStyles({ variant: 'secondary' })}
      >
        {tNotFound('backHome')}
      </a>
    </StatusScreen>
  );
}
