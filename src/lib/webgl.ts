/**
 * Tarayıcı bir WebGL bağlamı kurabiliyor mu?
 *
 * Donanım hızlandırması kapalı tarayıcılar, bazı eski cihazlar, GPU'su kara
 * listeye alınmış sürücüler ve bazı kurumsal/gizlilik ayarları WebGL vermez.
 * Three.js bu durumda hata FIRLATIR; yakalanmazsa sayfanın tamamı hata
 * ekranına düşer (ölçüldü). Canvas monte edilmeden önce buraya bakılır.
 *
 * Sonuç önbelleğe alınır: deneme bağlamı hemen bırakılsa da her çağrıda
 * yeni bir bağlam açmak gereksiz.
 */
let cached: boolean | undefined;

export function supportsWebGL(): boolean {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    cached = context !== null;
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}
