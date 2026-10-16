import type { HomeContent } from '@/types/content';

/**
 * Ana sayfa metinleri — Türkçe.
 *
 * NOT: mono etiketler (`eyebrow`) burada ZATEN büyük harfle yazılır.
 * `text-transform: uppercase` Türkçe "i" harfini İ değil I yapar
 * ("İŞLER" yerine "ISLER"), bu yüzden dönüştürme CSS'e bırakılmaz.
 */
export const home: HomeContent = {
  philosophy: {
    eyebrow: 'HAKKIMIZDA',
    title: 'Tasarım ve yazılım, tek elden.',
    body: [
      'MGB Software, işletmelerin dijital ürünlerini fikirden yayına kadar tasarlayan ve geliştiren bir teknoloji stüdyosu.',
      'Tasarımı ve yazılımı ayrı iki iş gibi değil, aynı işin iki yüzü gibi ele alıyoruz. Sonuç: iyi görünen, hızlı açılan, doğru çalışan ve yıllar sonra da bakımı yapılabilen ürünler.',
    ],
    facts: [
      { label: 'MODEL', value: 'Kurucu liderliğinde stüdyo' },
      { label: 'KAPSAM', value: 'Tasarımdan yayına' },
      { label: 'DİL', value: 'Türkçe · English' },
    ],
    caption: 'YAZILIM + TASARIM',
  },

  // Ses kuralı: stüdyo "biz" der, kurucu birinci tekil konuşur. "Ekibimiz",
  // "uzman kadromuz" gibi gerçeği yansıtmayan ifadeler kullanılmaz.
  founder: {
    eyebrow: 'KURUCUSUYLA TANIŞIN',
    name: 'Burak Gemici',
    role: 'Founder & Software Engineer',
    photo: { src: '/founder.webp', width: 960, height: 1200, alt: 'Burak Gemici’nin portresi' },
    bio: [
      'MGB Software’i, yazılım geliştirme ve dijital tasarıma duyduğum tutkuyla kurdum. Her projenin kendine özgü ihtiyaçları olduğuna inanıyor; modern, işlevsel ve uzun ömürlü dijital çözümler geliştirmeyi hedefliyorum.',
      'Bir projeye başladığınızda karşınızda bir satış temsilcisi değil, ürününüzü tasarlayan ve kodunu yazan kişi olur. Sorunuzu doğrudan bana sorar, cevabı aracısız alırsınız.',
    ],
    contactLabel: 'DOĞRUDAN İLETİŞİM',
  },

  services: {
    eyebrow: 'HİZMETLER',
    title: 'Ne yapıyoruz',
    entries: [
      {
        slug: 'web-development',
        title: 'Web Development',
        summary:
          'Kurumsal siteler, landing page’ler ve web uygulamaları. Hızlı açılan, arama motorlarında görünen, içeriğini kendi başınıza yönetebildiğiniz siteler.',
        deliverables: ['Kurumsal site', 'Landing page', 'Web uygulaması', 'İçerik yönetimi'],
      },
      {
        slug: 'ui-ux-design',
        title: 'UI/UX Design',
        summary:
          'Arayüz tasarımı, UX stratejisi, prototipleme ve tasarım sistemleri. Kullanıcının ne yapacağını düşünmek zorunda kalmadığı akışlar.',
        deliverables: ['Arayüz tasarımı', 'UX stratejisi', 'Prototipleme', 'Tasarım sistemi'],
      },
      {
        slug: 'software-backend',
        title: 'Software & Backend',
        summary:
          'Özel yazılım, backend sistemleri, API geliştirme ve entegrasyon, yönetim panelleri ve tekrar eden işleri ortadan kaldıran otomasyonlar.',
        deliverables: ['API geliştirme', 'Sistem entegrasyonu', 'Yönetim paneli', 'Otomasyon'],
      },
      {
        slug: 'mobile-apple',
        title: 'Mobile & Apple',
        summary:
          'iOS ve macOS uygulamaları. Platformun kendi diline sadık, hızlı ve akıcı; web sitesinin uygulama kılığına sokulmuş hali değil.',
        deliverables: ['iOS uygulaması', 'macOS uygulaması', 'App Store yayını'],
      },
      {
        slug: 'e-commerce',
        title: 'E-Commerce',
        summary:
          'Online mağazalar ve ödeme entegrasyonları. Ürün girişinden kasaya, kargodan iadeye kadar uçtan uca çalışan bir akış.',
        deliverables: ['Online mağaza', 'Ödeme entegrasyonu', 'Ürün yönetimi'],
      },
      {
        slug: 'technical-design-3d',
        title: '3D & Technical Design',
        summary:
          'AutoCAD teknik çizim ve SketchUp 3D modelleme. Dijital ürünlerde gösterdiğimiz hassasiyetin fiziksel projelerdeki karşılığı.',
        deliverables: ['AutoCAD teknik çizim', 'SketchUp 3D modelleme', 'Görselleştirme'],
      },
    ],
  },

  work: {
    eyebrow: 'SEÇİLMİŞ İŞLER',
    title: 'Projelerimiz şu an üretimde.',
    body: 'MGB Software yeni kurulmuş bir stüdyo. Vitrini doldurmak için yapmadığımız işleri buraya koymuyoruz — ilk projeler yayına girdiğinde tam olarak burada olacaklar.',
    status: 'ÜRETİMDE',
    concept: 'Konsept',
    indexTitle: 'İlk işler yayında, yenileri yolda.',
    soon: 'YAKINDA',
    visit: 'Siteyi aç',
  },

  process: {
    eyebrow: 'SÜREÇ',
    title: 'Nasıl çalışıyoruz',
    description: 'Beş adım. Her adımın sonunda elinize somut bir şey geçiyor.',
    steps: [
      {
        title: 'Keşif',
        description:
          'Ne yapmak istediğinizi, kimin için yapacağımızı ve başarıyı nasıl ölçeceğimizi netleştiriyoruz.',
        deliverable: 'Kapsam ve yol haritası',
      },
      {
        title: 'Tasarım',
        description:
          'Akışları ve arayüzleri kuruyoruz. Tek satır kod yazılmadan önce ürünü görüyor ve tıklayarak deneyebiliyorsunuz.',
        deliverable: 'Prototip ve tasarım sistemi',
      },
      {
        title: 'Geliştirme',
        description:
          'Önyüz ve altyapı birlikte ilerliyor. Her hafta çalışan bir sürüm üzerinden nerede olduğumuzu görüyorsunuz.',
        deliverable: 'Çalışan sürüm',
      },
      {
        title: 'Yayın',
        description:
          'Alan adı, sunucu, izleme ve güvenlik ayarları. Yayına alma işini size bırakmıyoruz.',
        deliverable: 'Yayındaki ürün',
      },
      {
        title: 'Destek',
        description:
          'Yayın bitiş değil başlangıç. Gerçek kullanımı ölçüyor, aksayanı düzeltiyor ve ürünü geliştirmeye devam ediyoruz.',
        deliverable: 'Bakım ve sürekli geliştirme',
      },
    ],
  },

  // Cevaplar sitenin geri kalanıyla çelişmez: süreç adımları /teklif-al
  // sayfasındaki "Sonraki adımlar"la aynı.
  // Fiyat, gün sayısı gibi taahhüt edilmemiş rakamlar bilinçli olarak yok.
  faq: {
    eyebrow: 'SSS',
    title: 'Sıkça sorulan sorular',
    description: 'Başlamadan önce en çok merak edilenler.',
    contactLine: 'Sorunuzun cevabı burada yoksa doğrudan yazın:',
    entries: [
      {
        question: 'Bir proje nasıl başlıyor?',
        answer:
          'Teklif formunu doldurursunuz; dört kısa adım, yaklaşık iki dakika. Talebinizi okuyup tercih ettiğiniz kanaldan size dönüyoruz. İsterseniz 30 dakikalık bir ön görüşmede detayları konuşuyor, ardından kapsamı, süreyi ve bütçeyi yazılı bir teklifle iletiyoruz.',
      },
      {
        question: 'Fiyatlandırma nasıl belirleniyor?',
        answer:
          'Hazır paket satmıyoruz; fiyat projenin kapsamına göre belirleniyor. Kapsam netleştikten sonra neyin dahil olduğunu açıkça yazan bir teklif hazırlıyoruz. Bütçeniz belliyse formda belirtmeniz, kapsamı ona göre çizmemizi kolaylaştırır.',
      },
      {
        question: 'Bir proje ne kadar sürüyor?',
        answer:
          'Kapsama göre değişiyor; tek sayfalık bir site ile yönetim paneli olan bir web uygulaması aynı takvimde ilerlemiyor. Süre yazılı teklifte belirtiliyor ve geliştirme boyunca her hafta çalışan bir sürüm üzerinden nerede olduğumuzu görüyorsunuz.',
      },
      {
        question: 'Projemi kim geliştiriyor?',
        answer:
          'MGB Software kurucu liderliğinde bir stüdyo: projenizi kurucu Burak Gemici tasarlıyor ve geliştiriyor, aradaki bir hesap yöneticisi değil. Uzmanlık alanımızın dışında bir iş gerekirse güvendiğimiz bir uzmanla çalışıyor ve bunu en başta sizinle paylaşıyoruz.',
        hideOnMobile: true,
      },
      {
        question: 'Kaynak kodu ve hesaplar kime ait?',
        answer:
          'Size. Kaynak kodu ve ürünün çalıştığı servislerin erişimleri teslimatla birlikte size devrediliyor. Böylece ürününüzü ileride başka bir ekip de geliştirmeye devam edebilir.',
      },
      {
        question: 'Hangi teknolojileri kullanıyorsunuz?',
        answer:
          'Araç seçimini modaya değil, projenin ömrüne göre yapıyoruz. Web tarafında Next.js, React ve TypeScript; backend’de Node.js ve NestJS; veritabanında MongoDB; dağıtımda Docker kullanıyoruz. Tasarım Figma’da, Apple platformları için geliştirme Swift ile yapılıyor. Hepsi olgun ve iyi belgelenmiş araçlar: yıllar sonra da bakımı yapılabilir, başka bir ekip de kolayca devralabilir.',
        hideOnMobile: true,
      },
      {
        question: 'Yayından sonra destek veriyor musunuz?',
        answer:
          'Evet. Yayın bizim için bitiş değil: gerçek kullanımı izliyor, aksayanı düzeltiyor ve ürünü geliştirmeye devam ediyoruz. Bakım ve geliştirmenin kapsamı teklifte ayrıca belirtiliyor.',
      },
      {
        question: 'Mevcut bir projeyi devralabilir misiniz?',
        answer:
          'Evet. Önce mevcut kodu ve altyapıyı inceleyip durumunu açıkça paylaşıyoruz. Üzerine geliştirmeye devam etmenin mi yoksa yeniden kurmanın mı daha mantıklı olduğuna birlikte karar veriyoruz.',
      },
      {
        question: 'İngilizce ya da uzaktan çalışabiliyor musunuz?',
        answer:
          'Evet. Türkçe ve İngilizce çalışıyoruz; görüşmeler çevrim içi yapılabiliyor, yani konumunuz fark etmiyor.',
        hideOnMobile: true,
      },
    ],
  },

  cta: {
    title: 'Bir fikriniz mi var? Birlikte inşa edelim.',
    description: 'Projenizi anlatın; nereden başlayacağımıza birlikte bakalım.',
  },
};
