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
    eyebrow: 'YAKLAŞIM',
    title: 'Her fikrin bir arayüze ihtiyacı var.',
    body: [
      'Bir ürünün iyi görünmesi yetmez; hızlı açılması, doğru çalışması ve büyüdüğünüzde ayak uydurması gerekir. Bu yüzden tasarımı ve yazılımı ayrı iki iş gibi değil, aynı işin iki yüzü gibi ele alıyoruz.',
      'Her proje tek bir soruyla başlar: bu ürün kimin, hangi işini kolaylaştıracak? Cevap netleşmeden tek satır kod yazmıyoruz.',
    ],
    caption: 'TEL KAFES + MÜREKKEP',
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

  build: {
    eyebrow: 'ÜRETTİKLERİMİZ',
    title: 'Elle tutulur çıktılar',
    entries: [
      'Web Siteleri',
      'Web Uygulamaları',
      'API’ler',
      'Yönetim Panelleri',
      'E-Ticaret',
      'Mobil Uygulamalar',
      'Otomasyon',
      '3D & Teknik Çizim',
    ],
  },

  work: {
    eyebrow: 'SEÇİLMİŞ İŞLER',
    title: 'Projelerimiz şu an üretimde.',
    body: 'MGB Software yeni kurulmuş bir stüdyo. Vitrini doldurmak için yapmadığımız işleri buraya koymuyoruz — ilk projeler yayına girdiğinde tam olarak burada olacaklar.',
    status: 'ÜRETİMDE',
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

  technology: {
    eyebrow: 'TEKNOLOJİ',
    title: 'Ne ile kuruyoruz',
    description:
      'Araç seçimi modaya değil, projenin ömrüne göre yapılır. Hepsi olgun, belgelenmiş ve uzun vadede bakımı yapılabilir.',
    entries: [
      { slug: 'nextjs', name: 'Next.js', role: 'Web çatısı' },
      { slug: 'react', name: 'React', role: 'Arayüz' },
      { slug: 'typescript', name: 'TypeScript', role: 'Tip güvenliği' },
      { slug: 'nestjs', name: 'NestJS', role: 'Backend çatısı' },
      { slug: 'nodejs', name: 'Node.js', role: 'Çalışma zamanı' },
      { slug: 'mongodb', name: 'MongoDB', role: 'Veritabanı' },
      { slug: 'docker', name: 'Docker', role: 'Dağıtım' },
      { slug: 'figma', name: 'Figma', role: 'Tasarım' },
      { slug: 'swift', name: 'Swift', role: 'Apple platformları' },
    ],
  },

  values: {
    eyebrow: 'NEDEN MGB',
    title: 'Dört net taahhüt',
    entries: [
      {
        slug: 'tailored',
        title: 'Size Özel',
        description: 'İhtiyacınıza göre kuruyoruz; hazır şablon uyarlamıyoruz.',
      },
      {
        slug: 'modern',
        title: 'Modern',
        description: 'Güncel teknoloji ve güncel tasarım; beş yıl sonra da bakımı yapılabilir.',
      },
      {
        slug: 'scalable',
        title: 'Ölçeklenebilir',
        description: 'Büyüdüğünüzde baştan yazmak gerekmeyecek şekilde kuruluyor.',
      },
      {
        slug: 'endToEnd',
        title: 'Uçtan Uca',
        description: 'Fikirden yayına tek ekip; aralarda kaybolan iş olmuyor.',
      },
    ],
  },

  cta: {
    title: 'Bir fikriniz mi var? Birlikte inşa edelim.',
    description: 'Projenizi anlatın; nereden başlayacağımıza birlikte bakalım.',
  },
};
