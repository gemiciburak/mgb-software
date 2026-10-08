'use client';

/**
 * Kök düzeydeki son çare hata ekranı.
 *
 * `[locale]/error.tsx` layout'un ALTINDAKİ hataları yakalar; layout'un
 * kendisi (fontlar, tema betiği, sağlayıcılar) hata verirse Next bu dosyayı
 * kullanır. Layout yerine geçtiği için kendi <html>/<body>'sini kurar ve
 * global stilleri ALMAZ — bu yüzden stil burada satır içi, renkler
 * tokens.css'teki zemin/metin değerleriyle aynı ve sistem temasını izler.
 * Dil bilinemediği için metin iki dilli.
 */
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="tr">
      <body>
        <title>Hata / Error · MGB Software</title>
        <style>{`
          :root { color-scheme: light dark; }
          body { margin: 0; min-height: 100svh; display: grid; place-items: center;
                 font-family: system-ui, sans-serif; background: #f6f5f2; color: #0d1015; }
          @media (prefers-color-scheme: dark) { body { background: #0a0b0e; color: #f4f5f7; } }
          main { max-width: 32rem; padding: 2rem 1.25rem; }
          p.code { font-family: ui-monospace, monospace; font-size: .75rem; letter-spacing: .12em; color: #1f46e0; }
          h1 { font-size: 2rem; line-height: 1.1; margin: 1rem 0; }
          p { line-height: 1.6; opacity: .8; }
          .actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
          button, a { font: inherit; padding: .75rem 1.25rem; border-radius: 4px; cursor: pointer;
                      text-decoration: none; border: 1px solid currentColor; color: inherit; background: none; }
          button { background: #1f46e0; border-color: #1f46e0; color: #fff; }
        `}</style>
        <main>
          <p className="code">HATA / ERROR</p>
          <h1>Bir şeyler ters gitti.</h1>
          <p>
            Sayfa yüklenirken beklenmeyen bir hata oluştu. Tekrar deneyin ya da ana sayfaya dönün.
            <br />
            Something went wrong while loading the page. Please try again or go back home.
          </p>
          <div className="actions">
            <button type="button" onClick={() => retry()}>
              Tekrar dene / Try again
            </button>
            {/* Düz <a>: istemci tarafı geçiş bozuk layout'u yeniden kullanırdı;
                tam sayfa yüklemesi durumu temizler. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- bkz. yukarıdaki not */}
            <a href="/">Ana sayfa / Home</a>
          </div>
        </main>
      </body>
    </html>
  );
}
