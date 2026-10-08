# MGB Software

Kurumsal site — tek bir Next.js uygulaması. Türkçe varsayılan ve öneksiz,
İngilizce `/en` altında. Ayrı bir backend ve veritabanı yok.

```
src/app          Rotalar (App Router): ana sayfa, /hakkimizda, /start, /kvkk, api/contact
src/components   Bölümler, form, animasyonlar, UI parçaları
src/content      Sayfa içerikleri (TR/EN, TypeScript) ve projeler
src/messages     Kısa arayüz metinleri (next-intl)
src/shared       Dil, rota haritası, hizmetler, form sözleşmesi ve doğrulaması
src/styles       Tasarım token'ları ve temel katman
```

Next.js 16 · App Router · Tailwind 4 · next-intl

## Başlangıç

```bash
nvm use            # .nvmrc → Node 24 LTS
pnpm install
cp .env.example .env.local
pnpm dev           # http://localhost:3000
```

| Komut            | Ne yapar            |
| ---------------- | ------------------- |
| `pnpm dev`       | Geliştirme sunucusu |
| `pnpm build`     | Üretim derlemesi    |
| `pnpm start`     | Üretim sunucusu     |
| `pnpm lint`      | ESLint              |
| `pnpm typecheck` | Tip kontrolü        |
| `pnpm format`    | Prettier            |

## Sürüm kararları

İki yerde bilinçli olarak en yeni sürüm kullanılmıyor:

- **TypeScript 6.0.3, 7.0.2 değil.** `eslint-config-next@16.4.0` içindeki
  `typescript-eslint@8` peer aralığı `typescript <6.1.0`. TS 7 ile tip
  farkındalıklı lint kuralları çalışmaz.
- **ESLint 9.39.5, 10.x değil.** `eslint-plugin-import`, `eslint-plugin-react`
  ve `eslint-plugin-jsx-a11y` henüz ESLint 10'u desteklemiyor.

Ayrıca `react` / `react-dom` **19.3.0'da sabit**: `@react-three/fiber@9.8.1`
peer aralığı `>=19 <19.4`.

Node 26 bu projenin yazıldığı tarihte henüz LTS değildi; `.nvmrc` Node 24
(Krypton) gösterir, `engines` ise `>=24.21.0` kabul eder.

## Mimari notlar

**Tasarım token'ları** `src/styles/tokens.css` içinde yaşar. Tailwind 4
CSS-first olduğu için `tailwind.config.js` yoktur. Renkler üç durumlu temaya
göre tanımlıdır: `:root` (açık), `prefers-color-scheme: dark` ve
`[data-theme]`. Hiçbir renk yalnızca media sorgusu içinde tanımlanmaz.

**Tema** kütüphanesizdir. Tek doğruluk kaynağı `<html data-theme-choice>`
attribute'u; `<body>`'nin ilk çocuğu olan inline script onu boyamadan önce
yazar (flash yok), React `useSyncExternalStore` ile okur.

**`cn()` özel yapılandırılmıştır.** Tasarım sistemimizde hem punto hem renk
token'ları `text-` önekini paylaşıyor (`text-body` punto, `text-accent-fg`
renk). tailwind-merge varsayılan haliyle ikisini aynı grup sayıp rengi
siliyordu — bu, koyu temada buton metnini WCAG AA altına düşürüyordu.
`src/lib/cn.ts` hangi adın punto hangisinin renk olduğunu açıkça bildirir.
**Yeni token eklerken o listeler de güncellenmeli.**

**İki ayrı animasyon motoru var, ikisi de kendi dosyasında:**

- `src/lib/ink-field.ts` — hero'daki mürekkep yüzeyi. Aynı alan hem GLSL'de
  (WebGL canvas) hem TypeScript'te (statik SVG fallback) hesaplanır; biri
  değişirse diğeri de değişmeli.
- `src/lib/polyhedra.ts` — Felsefe bölümündeki iç içe geçmiş tel kafes küpler
  ve kenarları boyayan mürekkep darbeleri (referans: Zach Lieberman,
  "Wireframe Ink"). Bu **2B canvas** ile çizilir, WebGL ile değil: fırça
  darbesinin konikleşmesi, yayılma ve çok geçişli mürekkep etkisi 2B'de hem
  daha kolay hem daha ucuz, ayrıca sayfada ikinci bir WebGL bağlamı açılmaz.

İkisi de görünüm dışına çıkınca ve sekme gizlenince durur; hareket azaltma
açıkken canvas ya hiç yüklenmez (hero) ya da tek bir kare çizip durur (küpler).

**Etkileşim modelleri bölüm başına farklıdır, ortak dil altında.** Her bölümün
tek bir güçlü fikri var; efektler biriktirilmiyor:

- **Hizmetler** — kontur tipografi. Seçili olmayan hizmetler içi boş, seçili
  olan dolu harflerle yazılır (`@utility type-outline`). "Diğerlerini soldur"
  kalıbı yerine bu kullanılıyor: opaklık düşürmek etiketleri okunmaz yapardı.
  Kontur rengi `--fg-muted` — ölçüldü, açık temada 7.24:1, koyuda 8.51:1
  (büyük metin eşiği 3:1). Kontur yalnızca `lg` ve üzerinde: mobilde hover
  olmadığı için altı satırın beşi kalıcı kontur kalırdı.
- **İşler** — imleci takip eden önizleme. Görsel imlecin tam altında değil,
  sağ kenara demirli ve dikeyde imleci izliyor; tam altında olsaydı okunan
  proje adının üstünü kapatırdı. Künye başlığın altında, sağ taraf boş.
- **Yaklaşım** — kelime kelime açılan tez cümlesi
  (`components/animations/word-reveal.tsx`). Sayfadaki tek "ekranı domine
  eden" an; ikincisi olsaydı ikisi de sıradanlaşırdı.
- **Teknoloji** — 3B kart levhası. Kartlar dağınık derinliklerden ızgaraya bir
  kez oturuyor, levha imlece doğru birkaç derece dönüyor.

- **Neden MGB** — çevrilebilir kademe düğmesi (amfi düğmesi mantığı: altta
  boşluk bırakan ~300°'lik çentik ölçeği, merkez disk, ölçeğin dışında küçük
  bir iğne, boşlukta kademe adı). Bölüm boş başlar: dört taahhüdün çerçevesi
  (hairline satırlar + mono numaralar) görünür, içeriği değil. Scroll dört eşit
  kademeye bölünür ve her kademe bir taahhüdü açar. Düğme süs değil kontrol:
  `role="slider"`, sürüklenebilir ve ok tuşlarıyla gezilebilir — çevirmek
  sayfayı kaydırır, yani scroll konumu tek doğruluk kaynağı olarak kalır ve üç
  giriş yolu çakışmaz. Çentiklerin dolması React'le değil **maskeyle** yapılır:
  altmış bir çentiği kare başına yeniden render etmek yerine ölçek iki kez
  çizilir ve mürekkepli kopya scroll'a bağlı bir yay maskesiyle kırpılır. İçerik hiçbir zaman DOM'dan çıkmaz ve `aria-hidden`
  olmaz — yalnızca opaklık/dönüşümle gizlenir, yani ekran okuyucu ve arama
  motoru dördünü de baştan görür. `lg` altında ve hareket azaltmada sabitleme
  yok: küçük ekranda kadran + dört satır aynı anda sığmaz.
- **Navigasyon** — konum göstergesi. Üstü ekranın %40 çizgisini en son geçen
  bölümün linki işaretlenir ve `aria-current` ile de bildirilir; hairline
  gösterge linkler arasında kayar, imleç çekilince bulunulan bölüme döner.
  Sayfada dokuz bölüm, navigasyonda dört başlık olduğu için her bölüm
  `SECTION_NAV_OWNER` ile bir başlığa bağlanır — yoksa gösterge sayfanın
  yarısı boyunca takılı kalıyordu. Başlığın alt kenarı aynı zamanda sayfa
  ilerleme çubuğudur.

**Marka işaretleri** `src/lib/tech-marks.ts` içinde, tek yollu SVG olarak
yazdırılmıştır (kaynak: simple-icons 16.34.0, ikon verisi CC0-1.0; işaretler
ilgili şirketlerin ticari markasıdır, burada yalnızca atıf amaçlı). Çalışma
zamanında paket bağımlılığı yok. İşaretler durağan halde `currentColor` ile
tek renk çizilir — dokuz logo aynı anda kendi renginde olsaydı bölüm bir
sponsor bandına dönerdi; marka rengi yalnızca hover'da açılır. Renk seçimi
`light-dark()` ile tamamen CSS'te kalır, yani tema hook'u okunmaz ve sunucu
çıktısı istemciyle birebir aynı olur. Resmî rengi zeminde kaybolan markalarda
(Next.js koyuda 1.07, React açıkta 1.49) kendi ikincil paletlerinden okunur
bir ton seçilmiştir.

**İçerik** `src/content/{tr,en}` altındaki TypeScript dosyalarından gelir
(tip güvenliği ve yorum yazabilmek için). Kısa arayüz metinleri — buton
etiketleri, aria metinleri — `src/messages/*.json` içinde next-intl ile.

**Yollar** `src/shared/routes.ts` içindeki tek haritadan türer;
next-intl, sitemap ve hreflang hepsi oradan okur. Haritada olup henüz yayında
olmayan sayfalara link verilmez: `src/lib/constants.ts` içindeki
`PUBLISHED_ROUTES` hem sitemap'i hem footer'daki yasal linkleri yönetir.

**Projeler** (`İşler` bölümü) `src/content/projects.ts` dizisinden gelir;
proje eklemek bir nesne eklemektir. Dizi boşken bölüm bilinçli bekleme
durumunu gösterir — uydurma proje yok.

**Proje başlatma formu** (`/start` ↔ `/en/start`) dört adımdır: ihtiyaç,
kapsam, detaylar, iletişim. Seçenekler ve doğrulama `src/shared/contact.ts`
içinde — istemci her adımda, sunucu gönderimde aynı fonksiyonu çalıştırır.
Bütçe aralıkları TL (KDV hariç). Yarım kalan form `sessionStorage`'da durur.
Gönderim `src/app/api/contact/route.ts` üzerinden Resend ile MGB Software’in gelen
kutusuna e-posta olarak düşer (`Reply-To` müşteri). Bal küpü, Origin kontrolü
ve IP başına hız sınırı var. Resend yapılandırılmamışsa uç nokta 503 döner ve
form kullanıcıya yazdıklarını hazır bir e-postaya aktarma seçeneği sunar —
sahte başarı mesajı gösterilmez. Teşekkür ekranında Calendly ön görüşme
takvimi tıklanınca yüklenir (ad/e-posta önceden dolu). WhatsApp seçeneği
`WHATSAPP_NUMBER` girilince görünür.

**Araç kutusu karakterleri** (iletişim sayfası, yan sütun) teknoloji
işaretlerinin silüetinden ve marka renginden türetilmiş, gözleri olan küçük
karakterlerdir (`components/contact/tech-crew.tsx`). Hareket saf CSS
(`crew-*`, `styles/base.css`): gövde sallanır ve esner, gözler bakar, eğilir,
kırpılır; süre ve faz karakter başına farklıdır. Logoların kendisine göz
konmaz — harf ve detayların üstüne biniyordu.

**KVKK aydınlatma metni** (`/kvkk` ↔ `/en/data-protection`) `src/content/{tr,en}/kvkk.ts`
içindedir ve yalnızca sitede gerçekten olan işlemeleri anlatır. Yeni bir veri
işleme (analitik, yeni form alanı, yeni hizmet sağlayıcı) eklenirse metin ve
`updated` tarihi güncellenmeli.

## Türkçe'ye özel kural

`text-transform: uppercase` Türkçe "i" harfini **İ değil I** yapar
("İletişim" → "ILETIŞIM"). Bu yüzden mono etiketler içerik dosyalarında
**zaten büyük harfle** yazılır ve dönüştürme CSS'e bırakılmaz.
Kullanılan üç fontun da (Clash Display, Inter, JetBrains Mono) Türkçe kapsamı
`cmap` tablosu okunarak doğrulanmıştır — bkz. `src/assets/fonts/README.md`.

## Yayına almadan önce

- **Alan adı** — `NEXT_PUBLIC_SITE_URL`; canonical, hreflang, sitemap ve OG
  görseli ondan üretilir.
- **Resend** — hesap aç, alan adını DNS ile doğrula, `.env` içine
  `RESEND_API_KEY` ve `CONTACT_FROM_EMAIL` gir (bkz. `.env.example`). Bunlar
  olmadan form gönderimi "e-posta ile gönder" yedeğine düşer.
- **KVKK metni** — veri sorumlusunun ticari unvanı ve adresi eklenmeli;
  saklama süresi (talep sözleşmeye dönüşmezse 1 yıl) iç süreçle uyumlu
  olmalı; metin bir hukukçuya gözden geçirtilmeli. Barındırma sağlayıcısı
  belli olunca aktarım listesine eklenmeli.
- **Sonraki sayfalar** — hizmet detayları, işler, hakkımızda, gizlilik.
  Yolları `PATHNAMES`'te hazır; yayına alınınca `PUBLISHED_ROUTES`'a eklenir.
