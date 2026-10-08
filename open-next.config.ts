import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

/**
 * Cloudflare Workers dağıtımı (OpenNext).
 *
 * Bütün sayfalar build sırasında statik üretiliyor, yeniden doğrulama
 * (revalidate/ISR) yok. Bu yüzden önbellek ayrı bir depoda (R2/KV) değil,
 * Workers statik varlıkları içinde tutulur: ek servis, ek ücret yok.
 * ISR eklenirse bu ayar R2 önbelleğine geçirilmeli.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
