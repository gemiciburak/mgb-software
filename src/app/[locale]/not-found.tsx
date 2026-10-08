import { getTranslations } from 'next-intl/server';
import { StatusScreen } from '@/components/sections/status-screen';
import { ButtonLink } from '@/components/ui/button';
import { ArrowRightIcon } from '@/components/ui/icons';
import { SITE_NAME } from '@/lib/constants';

/**
 * Dil segmenti içindeki 404.
 *
 * `[...rest]` catch-all'ı tanımsız her yolda `notFound()` çağırır; böylece
 * kullanıcı Next'in çıplak varsayılan sayfası yerine navigasyon, footer ve
 * doğru dildeki metinle karşılaşır. Next, 404 durumunda `noindex` etiketini
 * kendisi ekler.
 *
 * Sekme başlığı: segment `not-found` dosyası metadata veremiyor (yalnızca kök
 * not-found verebilir, kökümüz ise `[locale]`). React 19'un `<title>`
 * hoisting'i hidrasyonda başlığı head'in başına ekler; tarayıcı ilkini
 * kullanır. Sunucu HTML'inde ana sayfa başlığı kalır — sayfa `noindex`
 * olduğu için arama motoru açısından fark yok.
 */
export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <StatusScreen code={t('code')} title={t('title')} description={t('description')}>
      <title>{`${t('code')} — ${t('title')} · ${SITE_NAME}`}</title>
      <ButtonLink href="/">
        {t('backHome')}
        <ArrowRightIcon className="size-4" />
      </ButtonLink>
    </StatusScreen>
  );
}
