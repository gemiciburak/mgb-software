# Fontlar

## Clash Display (self-hosted)

`ClashDisplay-600.woff2` (sitede kullanılan tek ağırlık)

- Döküm evi: Indian Type Foundry — https://www.fontshare.com/fonts/clash-display
- Lisans: ITF Free Font License (ticari kullanım dahil, ücretsiz). Lisans metni
  Fontshare indirme paketinin içindedir; font güncellenirse yeni metinle birlikte
  bu klasöre kopyalanmalı.
- Neden self-hosted: üçüncü taraf font CDN'ine çalışma anı bağımlılığı olmasın,
  `next/font/local` dosyaları build'e gömüp CLS'i sıfırlasın.

### Doğrulama

Dosyalar indirildiğinde `OS/2.usWeightClass` değeri ve `cmap` tablosundaki
15 Türkçe kod noktası (ğĞşŞıİçÇöÖüÜâîû) programatik olarak kontrol edilmiştir.

Fontshare CSS API'sinde `@variable` sorgusu **değişken font döndürmez** —
sessizce Extralight (200) statiğini verir. Bu yüzden gerekli ağırlıklar tek tek
statik olarak indirilir. Yeni bir ağırlık eklerken ağırlık sınıfını doğrulayın.

## Inter ve JetBrains Mono

Bu fontlar `next/font/google` ile yüklenir, bu klasörde dosyası yoktur.
Next.js build sırasında indirip kendi domaininden sunar — çalışma anında
Google'a istek gitmez.

## Neden hem woff2 hem ttf?

`ClashDisplay-600.ttf` yalnızca **OG görseli üretimi** için var. `next/og`'un
altındaki Satori woff2 formatını okumuyor; tarayıcıya giden fontlar ise woff2
(daha küçük). TTF istemciye hiç gönderilmez, yalnızca build sırasında okunur.
