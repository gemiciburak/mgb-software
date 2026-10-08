import type { AboutContent } from '@/types/content';

/**
 * Hakkımızda — Türkçe.
 *
 * Ses kuralı: MGB Software bir marka, Burak Gemici markanın kurucusu.
 *   • Kurumsal bölümler "biz" der — stüdyonun sesi.
 *   • Kurucu bölümü birinci tekil konuşur — kişinin sesi.
 * "Ekibimiz", "uzman kadromuz", "yılların deneyimi" gibi gerçeği
 * yansıtmayan ifadeler kullanılmaz; küçüklük gizlenmez, avantaj olarak
 * anlatılır (doğrudan iletişim, sınırlı proje, tek muhatap).
 *
 * NOT: mono etiketler ZATEN büyük harfle yazılır (Türkçe İ kuralı).
 */
export const about: AboutContent = {
  meta: {
    title: 'Hakkımızda',
    description:
      'MGB Software, tasarım ve yazılımı tek elden yürüten bir dijital teknoloji stüdyosu. Vizyonumuz, kurucumuz ve çalışma anlayışımız.',
  },

  intro: {
    eyebrow: 'HAKKIMIZDA',
    title: 'Tasarımı ve yazılımı aynı masada buluşturan bir stüdyo.',
    body: [
      'MGB Software, işletmelerin dijital ürünlerini fikir aşamasından yayına kadar tek elden tasarlayan ve geliştiren bir teknoloji stüdyosu. Web siteleri ve uygulamalar, arayüz tasarımı, backend sistemleri, e-ticaret, Apple platformları ve teknik çizim aynı çatı altında, aynı özenle ele alınıyor.',
      'Vizyonumuz basit: iyi görünen ama aynı zamanda hızlı açılan, doğru çalışan ve yıllar sonra da bakımı yapılabilen ürünler. Bunun için tasarım ile yazılımı ayrı iki iş olarak değil, aynı işin iki yüzü olarak görüyoruz — ve kararların ikisini de baştan birlikte veriyoruz.',
    ],
    facts: [
      { label: 'MODEL', value: 'Kurucu liderliğinde stüdyo' },
      { label: 'KAPSAM', value: 'Tasarım → Yazılım → Yayın' },
      { label: 'ÇALIŞMA DİLİ', value: 'Türkçe · English' },
    ],
  },

  founder: {
    eyebrow: 'KURUCUSUYLA TANIŞIN',
    name: 'Burak Gemici',
    role: 'Founder & Software Engineer',
    bio: [
      'MGB Software’i, yazılım geliştirme ve dijital tasarıma duyduğum tutkuyla kurdum. Her projenin kendine özgü ihtiyaçları olduğuna inanıyor; modern, işlevsel ve uzun ömürlü dijital çözümler geliştirmeyi hedefliyorum.',
      'Bir projeye başladığınızda karşınızda bir satış temsilcisi ya da hesap yöneticisi değil, ürününüzü tasarlayan ve kodunu yazan kişi olur. Sorunuzu doğrudan bana sorar, cevabı aracısız alırsınız.',
    ],
    contactLine: 'Projenizi doğrudan benimle konuşmak isterseniz:',
  },

  principles: {
    eyebrow: 'ÇALIŞMA ANLAYIŞIMIZ',
    title: 'Küçük bir stüdyonun büyük avantajları',
    description:
      'Bir ajansın katmanları yok; bu yüzden hız, şeffaflık ve özen doğrudan size yansıyor.',
    entries: [
      {
        title: 'Doğrudan iletişim',
        description:
          'Aradaki halkalar yok. Toplantıda konuştuğunuz kişi, ürününüzü geliştiren kişi — hiçbir talep aktarılırken anlam kaybetmez.',
      },
      {
        title: 'Şeffaf süreç',
        description:
          'Her adımın sonunda somut bir çıktı, her hafta çalışan bir sürüm. Nerede olduğumuzu raporlardan değil, ürünün kendisinden görürsünüz.',
      },
      {
        title: 'İhtiyaca özel geliştirme',
        description:
          'Hazır şablon uyarlamıyoruz. Kapsamı işinizin gerçek ihtiyacına göre çiziyor, gerekmeyen özelliği önermiyoruz.',
      },
      {
        title: 'Kaliteli teslimat',
        description:
          'Temiz ve belgelenmiş kod, test edilmiş akışlar, size ait kaynak kodu ve erişimler. Teslimattan sonra ürünü başkası da geliştirebilir.',
      },
      {
        title: 'Sınırlı sayıda proje',
        description:
          'Aynı anda yalnızca özen gösterebileceğimiz kadar proje alıyoruz. Takvim doluysa bunu en başta, açıkça söylüyoruz.',
      },
      {
        title: 'Dürüst kapsam',
        description:
          'Bir iş uzmanlık alanımızın dışındaysa bunu saklamıyoruz. Gerektiğinde güvendiğimiz bir uzmanla çalışır ve bunu baştan sizinle paylaşırız.',
      },
    ],
  },

  cta: {
    title: 'Projenizi anlatın, birlikte başlayalım.',
    description: 'Proje talepleri bir kuyrukta beklemez; kurucunun kendisi okur ve size döner.',
  },
};
