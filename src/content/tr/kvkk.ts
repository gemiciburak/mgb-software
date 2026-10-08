import { CONTACT_EMAIL, SITE_NAME } from '@/lib/constants';
import type { LegalDocument } from '@/types/content';

/**
 * KVKK Aydınlatma Metni — 6698 sayılı Kanun m.10 ve Aydınlatma Yükümlülüğünün
 * Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ'e göre.
 *
 * Yalnızca sitede GERÇEKTEN olan işlemeleri anlatır (bkz. api/contact,
 * i18n/routing.ts çerez ayarı, lib/theme.ts, components/contact). Yeni bir
 * veri işleme (analitik, yeni form alanı, yeni hizmet sağlayıcı) eklendiğinde
 * bu metin de güncellenmeli ve `updated` tarihi değişmeli.
 *
 * DİKKAT: Veri sorumlusunun ticari unvanı ve adresi henüz tanımlı değil;
 * bilindiğinde "Veri sorumlusu" bölümüne eklenmeli. Yayından önce bir
 * hukukçuya gözden geçirtilmesi önerilir.
 */
const email = CONTACT_EMAIL ?? '';

export const kvkk: LegalDocument = {
  title: 'KVKK Aydınlatma Metni',
  updated: '2026-10-09',
  intro: `Bu metin, ${SITE_NAME} internet sitesi ve teklif formu aracılığıyla işlenen kişisel verileriniz hakkında, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca sizi bilgilendirmek amacıyla hazırlanmıştır.`,
  sections: [
    {
      heading: 'Veri sorumlusu',
      blocks: [
        {
          type: 'p',
          text: `Kişisel verileriniz, veri sorumlusu sıfatıyla ${SITE_NAME} (“MGB Software”) tarafından işlenmektedir. Bize ${email} adresinden ulaşabilirsiniz.`,
        },
      ],
    },
    {
      heading: 'İşlenen kişisel veriler',
      blocks: [
        {
          type: 'list',
          items: [
            'Kimlik: ad soyad.',
            'İletişim: e-posta adresi; WhatsApp’tan yazarsanız telefon numaranız.',
            'Mesleki bilgi: şirket adı (isteğe bağlı).',
            'Talep bilgileri: ilgilendiğiniz hizmetler, bütçe aralığı, zaman beklentisi, proje durumu, proje açıklamanız ve tercih ettiğiniz dönüş kanalı.',
            'İşlem güvenliği: formu gönderdiğiniz IP adresi — yalnızca kötüye kullanımı önlemek için, kısa süreli olarak.',
            'Ön görüşme planlarsanız, Calendly üzerinden paylaştığınız bilgiler.',
          ],
        },
        {
          type: 'p',
          text: 'Formda özel nitelikli kişisel veri (sağlık, din, etnik köken vb.) istenmez; lütfen proje açıklamanızda bu tür bilgilere yer vermeyin.',
        },
      ],
    },
    {
      heading: 'İşleme amaçları',
      blocks: [
        {
          type: 'list',
          items: [
            'Proje talebinizi değerlendirmek, size dönüş yapmak ve teklif hazırlamak.',
            'Talep etmeniz hâlinde ön görüşme planlamak.',
            'Talebinizin bir sözleşmeye dönüşmesi hâlinde sözleşme öncesi iletişimi yürütmek.',
            'Siteyi ve formu spam ile kötüye kullanıma karşı korumak, bilgi güvenliğini sağlamak.',
            'Mevzuattan doğan yükümlülükleri yerine getirmek.',
          ],
        },
      ],
    },
    {
      heading: 'Toplama yöntemi ve hukuki sebepler',
      blocks: [
        {
          type: 'p',
          text: 'Kişisel verileriniz; sitedeki teklif formunu doldurmanız, bize e-posta göndermeniz veya ön görüşme planlamanız yoluyla, elektronik ortamda ve kısmen otomatik yollarla toplanır.',
        },
        {
          type: 'list',
          items: [
            'Talebinizin değerlendirilmesi ve teklif süreci: bir sözleşmenin kurulmasıyla doğrudan ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması (KVKK m.5/2-c).',
            'Güvenlik ve kötüye kullanımın önlenmesi: temel hak ve özgürlüklerinize zarar vermemek kaydıyla, veri sorumlusunun meşru menfaati (KVKK m.5/2-f).',
            'Mevzuattan doğan yükümlülükler: hukuki yükümlülüğün yerine getirilmesi (KVKK m.5/2-ç).',
            'Yurt dışına aktarım: aşağıda açıklanan açık rızanız (KVKK m.9/6-a).',
          ],
        },
      ],
    },
    {
      heading: 'Aktarım ve yurt dışına aktarım',
      blocks: [
        {
          type: 'p',
          text: 'Kişisel verileriniz satılmaz ve pazarlama amacıyla üçüncü kişilerle paylaşılmaz. Sitenin sunulması, talebinizin iletilmesi ve yanıtlanması için aşağıdaki hizmet sağlayıcılar kullanılır; bunların sunucuları yurt dışında (ABD ve/veya AB) bulunmaktadır:',
        },
        {
          type: 'list',
          items: [
            'Resend, Inc. — form içeriğini MGB Software’in e-posta kutusuna ileten e-posta altyapısı.',
            'Google LLC (Gmail) — MGB Software’in e-posta hesabı; talebiniz ve sonraki yazışmalar burada saklanır.',
            'Calendly LLC — yalnızca ön görüşme planlamayı seçerseniz; bu durumda Calendly kendi aydınlatma metnine tabi olarak veri işler.',
            'WhatsApp (Meta Platforms Ireland Ltd.) — yalnızca bize WhatsApp’tan yazmayı seçerseniz; bu durumda telefon numaranız, profil bilgileriniz ve mesajlarınız WhatsApp üzerinden bize ulaşır ve WhatsApp kendi gizlilik politikasına tabi olarak veri işler.',
            'Cloudflare, Inc. — sitenin barındırıldığı ve sunulduğu altyapı; siteye her erişimde IP adresiniz ve tarayıcı bilgileriniz gibi teknik bağlantı verileri, siteyi size ulaştırmak ve saldırılara karşı korumak için işlenir.',
          ],
        },
        {
          type: 'p',
          text: 'Formu gönderirken verdiğiniz açık rıza bu aktarım içindir. Muhtemel riskler hakkında bilgilendirme: aktarılan veriler, Türkiye’deki koruma düzeyine eşdeğer kabul edilmemiş bir hukuk düzeninde işlenebilir ve o ülkenin yetkili makamlarının erişimine konu olabilir. Açık rıza vermek zorunda değilsiniz; vermezseniz bize doğrudan e-posta ile yazabilirsiniz. Rızanızı dilediğiniz zaman geri alabilirsiniz.',
        },
        {
          type: 'p',
          text: 'Kişisel verileriniz ayrıca, talep edilmesi hâlinde ve yalnızca kanunen yetkili kamu kurum ve kuruluşlarına aktarılabilir.',
        },
      ],
    },
    {
      heading: 'Saklama süresi',
      blocks: [
        {
          type: 'p',
          text: 'Talebiniz bir sözleşmeye dönüşmezse, kişisel verileriniz son yazışmamızdan itibaren en geç bir yıl içinde silinir. Sözleşmeye dönüşmesi hâlinde ilgili mevzuatta öngörülen süreler boyunca saklanır. Kötüye kullanımı önlemek için tutulan IP bilgisi, kısa süreli olarak ve yalnızca bu amaçla işlenir.',
        },
      ],
    },
    {
      heading: 'Çerezler ve tarayıcı depolaması',
      blocks: [
        {
          type: 'p',
          text: 'Site analitik veya reklam çerezi kullanmaz. Yalnızca sitenin çalışması için gerekli şu kayıtlar tutulur:',
        },
        {
          type: 'list',
          items: [
            'MGB_LOCALE çerezi — seçtiğiniz dili hatırlar, bir yıl saklanır.',
            'Tema tercihi — açık/koyu tema seçiminiz tarayıcınızda (localStorage) tutulur, sunucuya gönderilmez.',
            'Form taslağı — teklif formunu yarıda bırakırsanız doldurduğunuz alanlar yalnızca o sekmede (sessionStorage) tutulur; sekme kapanınca silinir, gönderene kadar sunucuya iletilmez.',
            'Form taslağı — doldurduğunuz form, sekmeyi kapatana kadar tarayıcınızda (sessionStorage) tutulur ve gönderimden sonra silinir.',
          ],
        },
        {
          type: 'p',
          text: 'Teşekkür ekranındaki görüşme takvimi siz açana kadar yüklenmez; açtığınızda Calendly kendi çerezlerini kullanabilir.',
        },
      ],
    },
    {
      heading: 'Haklarınız',
      blocks: [
        { type: 'p', text: 'KVKK’nın 11. maddesi uyarınca;' },
        {
          type: 'list',
          items: [
            'kişisel verilerinizin işlenip işlenmediğini öğrenme,',
            'işlenmişse buna ilişkin bilgi talep etme,',
            'işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,',
            'yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,',
            'eksik veya yanlış işlenmişse düzeltilmesini isteme,',
            'KVKK’nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,',
            'düzeltme, silme ve yok etme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,',
            'münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,',
            'kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme',
          ],
        },
        { type: 'p', text: 'haklarına sahipsiniz.' },
      ],
    },
    {
      heading: 'Başvuru',
      blocks: [
        {
          type: 'p',
          text: `Haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ’e uygun olarak, bize daha önce bildirdiğiniz ve sistemimizde kayıtlı e-posta adresinizden ${email} adresine iletebilirsiniz. Başvurunuz, niteliğine göre en geç otuz gün içinde ücretsiz olarak sonuçlandırılır.`,
        },
      ],
    },
  ],
};
