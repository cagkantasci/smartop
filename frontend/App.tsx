
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MachineManagement } from './components/MachineManagement';
import { OperatorManagement } from './components/OperatorManagement';
import { ApprovalWorkflow } from './components/ApprovalWorkflow';
import { JobManagement } from './components/JobManagement';
import { FinanceModule } from './components/FinanceModule';
import { ChecklistManagement } from './components/ChecklistManagement';
import { Settings } from './components/Settings';
import { LandingPage } from './components/LandingPage';
import { MobileAppSimulator } from './components/MobileAppSimulator';
import { NotificationCenter } from './components/NotificationCenter';
import { useAuth } from './src/contexts/AuthContext';
import { useToast } from './src/contexts/ToastContext';
import {
  useMachines,
  useCreateMachine,
  useUpdateMachine,
  useDeleteMachine,
  useOperators,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useJobs,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  useAssignJob,
  useChecklistTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  usePendingSubmissions,
  useReviewSubmission,
} from './src/hooks';
import { Machine as APIMachine } from './src/services/machineService';
import { User as APIUser } from './src/services/userService';
import { Job as APIJob } from './src/services/jobService';
import {
  ChecklistTemplate as APITemplate,
  ChecklistSubmission,
} from './src/services/checklistService';
// import { GeminiAdvisor } from './components/GeminiAdvisor';
import { Machine, MachineStatus, ChecklistItem, ChecklistStatus, Operator, ChecklistTemplate, Job, Invoice, FirmDetails, Language, TranslationDictionary } from './types';

// Empty arrays - no mock data, API will provide real data
const MOCK_OPERATORS: Operator[] = [];
const MOCK_TEMPLATES: ChecklistTemplate[] = [];
const MOCK_MACHINES: Machine[] = [];
const MOCK_JOBS: Job[] = [];
const MOCK_CHECKLISTS: ChecklistItem[] = [];
const MOCK_INVOICES: Invoice[] = [];

const DICTIONARY: Record<Language, TranslationDictionary> = {
  tr: {
    sidebar: { dashboard: 'Kontrol Paneli', machines: 'Makine Parkı', operators: 'Operatör Yönetimi', jobs: 'İş Yönetimi', checklists: 'Kontrol Listeleri', approvals: 'Onay İşlemleri', notifications: 'Bildirim Merkezi', finance: 'Finans & Faturalar', settings: 'Ayarlar', firmInfo: 'Firma Bilgileri', managerPortal: 'Yönetici Portalı', logout: 'Çıkış Yap', darkMode: 'Karanlık Mod', lightMode: 'Aydınlık Mod' },
    dashboard: { title: 'Operasyonel Genel Bakış', subtitle: 'Filo durumunuzun gerçek zamanlı özeti.', totalEngineHours: 'Toplam Motor Saati', pendingApprovals: 'Bekleyen Onaylar', activeMachines: 'Aktif Makineler', avgUsage: 'Ort. Kullanım', weeklyHours: 'Haftalık Çalışma Saatleri', fleetStatus: 'Filo Durum Dağılımı', activeJobs: 'Aktif Şantiyeler ve İşler', viewAll: 'Tümünü Gör', assignedMachines: 'Atanan Makineler:', allFleetAverage: 'Tüm Filo Ortalaması', table: { machine: 'Makine', serial: 'Seri No', status: 'Durum', hours: 'Motor Saati', location: 'Konum', projectName: 'Proje Adı', progress: 'İlerleme', assignedMachine: 'Atanan Makine' }, stats: { active: 'Aktif', maintenance: 'Bakımda', idle: 'Boşta', hours: 'saat' }, days: { mon: 'Pzt', tue: 'Sal', wed: 'Çar', thu: 'Per', fri: 'Cum', sat: 'Cmt', sun: 'Paz' }, unknown: 'Bilinmiyor', backToList: 'Listeye Dön', lastMaintenance: 'Son Bakım', operator: 'Operatör', commonFaults: 'Sık Görülen Arızalar / Parça Değişimi', serviceRecords: 'Servis ve Bakım Kayıtları', liveMap: 'Canlı Harita - Makine, Operatör ve İş Konumları', machines: 'Makineler', operators: 'Operatörler', jobPoints: 'İş Noktaları', noServiceHistory: 'Kayıtlı servis geçmişi bulunamadı.', machinesAssigned: 'makine atandı', inProgress: 'Devam Ediyor', delayed: 'Gecikmede', completed: 'Tamamlandı' },
    landing: {
      nav: {
        features: 'Özellikler',
        calculator: 'Hesaplama',
        pricing: 'Fiyatlandırma',
        portalLogin: 'Portal Girişi'
      },
      hero: {
        badge: '🚀 İş Makineleri Yönetiminde Yeni Çağ',
        title: 'Saha Operasyonlarını',
        titleHighlight: 'Dijitalleştirin.',
        subtitle: 'Kağıt formlardan kurtulun. Ekskavatör, vinç ve kamyonlarınızı cebinizden yönetin. Arızaları %40 azaltın, verimliliği artırın.',
        startFree: 'Ücretsiz Başlayın',
        requestDemo: 'Demo Talep Et'
      },
      roi: {
        title: 'Ne Kadar Tasarruf Edersiniz?',
        subtitle: 'Makine sayınıza göre aylık operasyonel kayıpları ve Smartop ile kazanacağınız net tasarrufu hesaplayın.',
        machineCount: 'Filodaki Makine Sayısı:',
        estimatedSavings: 'Aylık Tahmini Tasarruf',
        benefits: {
          speed: { title: 'Hız', desc: 'Form doldurma süresinde %70 azalma.' },
          security: { title: 'Güvenlik', desc: 'Arızaları önceden tespit edin.' },
          analysis: { title: 'Analiz', desc: 'Veriye dayalı bakım kararları.' },
          mobile: { title: 'Mobil', desc: 'Her operatörün cebinde.' }
        }
      },
      features: {
        title: 'Neden Smartop?',
        subtitle: 'Geleneksel yöntemler yavaş, hataya açık ve pahalıdır. Biz süreci modernize ediyoruz.',
        remoteTracking: {
          title: 'Uzaktan Takip',
          desc: 'Şantiyeye gitmeden hangi makinenin çalıştığını, hangisinin yattığını harita üzerinden görün.'
        },
        digitalApproval: {
          title: 'Dijital Onay',
          desc: 'Operatör formu doldurur, yönetici anında onaylar. Islak imza bekleme derdine son.'
        },
        advancedReporting: {
          title: 'Gelişmiş Raporlama',
          desc: 'Hangi parça ne sıklıkla arıza yapıyor? Hangi operatör daha verimli? Hepsi tek ekranda.'
        }
      },
      cta: {
        title: 'Filo Yönetimini Şimdi Başlatın',
        subtitle: 'Kredi kartı gerekmeden 14 gün boyunca tüm özellikleri ücretsiz deneyin.',
        button: 'Hemen Kayıt Olun'
      },
      footer: {
        privacy: 'Gizlilik Politikası',
        terms: 'Kullanım Şartları',
        support: 'Destek',
        copyright: '© 2024 Smartop Inc. Tüm hakları saklıdır.'
      },
      auth: {
        login: 'Portal Girişi',
        register: 'Kayıt Ol',
        forgotPassword: 'Şifremi Unuttum',
        email: 'E-posta',
        emailPlaceholder: 'ornek@firma.com',
        password: 'Şifre',
        passwordPlaceholder: '••••••••',
        rememberMe: 'Beni hatırla',
        forgotPasswordLink: 'Şifremi unuttum',
        loginButton: 'Giriş Yap',
        loggingIn: 'Giriş yapılıyor...',
        or: 'veya',
        googleLogin: 'Google ile Giriş Yap',
        noAccount: 'Hesabınız yok mu?',
        registerLink: 'Kayıt Ol',
        companyName: 'Şirket Adı',
        companyPlaceholder: 'Şirket Adı',
        firstName: 'Ad',
        firstNamePlaceholder: 'Ad',
        lastName: 'Soyad',
        lastNamePlaceholder: 'Soyad',
        passwordMinLength: 'En az 8 karakter',
        confirmPassword: 'Şifre Tekrar',
        confirmPasswordPlaceholder: 'Şifreyi tekrar girin',
        registering: 'Kayıt yapılıyor...',
        registerButton: 'Kayıt Ol',
        hasAccount: 'Zaten hesabınız var mı?',
        loginLink: 'Giriş Yap',
        forgotPasswordDesc: 'E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.',
        sending: 'Gönderiliyor...',
        sendResetLink: 'Sıfırlama Bağlantısı Gönder',
        backToLogin: '← Giriş sayfasına dön',
        errors: {
          loginFailed: 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.',
          passwordMismatch: 'Şifreler eşleşmiyor.',
          passwordTooShort: 'Şifre en az 8 karakter olmalıdır.',
          registerFailed: 'Kayıt başarısız. Lütfen tekrar deneyin.',
          emailRequired: 'Lütfen e-posta adresinizi girin.',
          googleSoon: 'Google ile giriş yakında aktif olacak.'
        },
        success: {
          registerSuccess: 'Kayıt başarılı! Giriş yapabilirsiniz.',
          resetLinkSent: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.'
        }
      }
    },
    machines: {
      title: 'Makine Parkı', subtitle: 'Filo yönetimi, atamalar ve kullanım maliyetleri.', payAsYouGo: 'Kullandığın Kadar Öde', addMachine: 'Makine Ekle', searchPlaceholder: 'İsim, marka veya seri no ile arayın...',
      subscription: {
        title: 'Abonelik Modeli',
        payAsYouGo: 'Kullandığın Kadar Öde',
        basePrice: 'Temel Fiyat',
        perMachine: '/makine/ay',
        machinesInCart: 'Sepetteki Makine',
        totalMachines: 'Toplam Makine',
        discount: 'İndirim',
        discountEarned: 'Kazanılan İndirim',
        monthlyTotal: 'Aylık Toplam',
        savingsInfo: 'makine daha eklerseniz',
        savingsInfo2: 'indirim kazanacaksınız.',
        or: 'veya',
        activeMachines: 'Aktif Makine',
        twoFactorEnabled: 'İki Faktörlü Doğrulama Aktif'
      },
      operations: {
        title: 'Operasyonel Atamalar',
        quickAssign: 'Hızlı Ata',
        workArea: 'İş Alanı',
        noAssignment: 'Atama Yapılmadı',
        assignedOperator: 'Atanan Operatör',
        assignedChecklist: 'Atanan Kontrol Listesi'
      },
      stats: {
        engineHours: 'Motor Saati',
        lastMaintenance: 'Son Bakım',
        hours: 'saat',
        daysAgo: 'gün önce'
      },
      filters: {
        all: 'Tümü',
        active: 'Aktif',
        maintenance: 'Bakımda',
        idle: 'Boşta'
      },
      actions: {
        noList: 'Liste Yok',
        editAll: 'Tümünü Düzenle',
        edit: 'Düzenle',
        viewDetails: 'Detayları Gör'
      },
      cart: { title: 'Sepet Tutarı', confirm: 'Sepeti Onayla', total: 'Toplam Tutar', empty: 'Sepetiniz boş.' },
      modal: { title: 'Yeni Makine Ekle', smartFill: 'Bilgileri Getir', cancel: 'İptal', add: 'Listeye ve Sepete Ekle', selectType: 'Makine Tipi Seçin', technicalDetails: 'Teknik Detaylar', searchBrandModel: 'Marka ve Model Ara', machineName: 'Makine Adı', brand: 'Marka', model: 'Model', serialNumber: 'Seri Numarası', licensePlate: 'Plaka', year: 'Üretim Yılı', engineHours: 'Motor Saati', fuelType: 'Yakıt Tipi', fuelCapacity: 'Yakıt Kapasitesi', operator: 'Operatör', checklist: 'Kontrol Listesi', selectOperator: 'Operatör Seç', selectChecklist: 'Kontrol Listesi Seç', editMachine: 'Makine Düzenle', status: 'Durum', delete: 'Sil', save: 'Kaydet', close: 'Kapat', noOperator: 'Operatör Atanmadı', noChecklist: 'Liste Atanmadı', operationalAssignments: 'Operasyonel Atamalar', operatorSelection: 'Operatör Seçimi', checklistSelection: 'Kontrol Listesi Seçimi', notAssigned: 'Atama Yapılmadı (Daha Sonra)', imageUrl: 'Görsel URL', changeImage: 'Fotoğrafı Değiştir', findDifferentImage: 'Farklı Bir Görsel Bul', generateRandom: 'Rastgele Üret', fetchingData: 'Veriler Getiriliyor...', resultsFound: 'Sonuç Bulundu', modelBrandCategory: 'Marka/Kategori', searchPlaceholder: 'Örn: Bobcat Forklift, CAT 320, Komatsu PC200...', searchHint: 'Marka ve model yazıp "Ara" butonuna tıklayın, listeden seçim yapın.', search: 'Ara', deleteConfirm: 'Makineyi Sil', confirmDelete: 'Makineyi silmek istediğinizden emin misiniz?' },
      types: { excavator: 'Ekskavatör', dozer: 'Dozer', crane: 'Vinç', loader: 'Yükleyici', truck: 'Kamyon', grader: 'Greyder', roller: 'Silindir', forklift: 'Forklift', backhoe: 'Kazıcı Yükleyici', skidSteer: 'Mini Yükleyici', telehandler: 'Teleskopik Yükleyici', compactor: 'Kompaktör', paver: 'Asfalt Makinesi', trencher: 'Hendek Açma Makinesi', drill: 'Delme Makinesi', generator: 'Jeneratör', compressor: 'Kompresör', concreteEquipment: 'Beton Ekipmanı', lift: 'Platform', trailer: 'Römork', scraper: 'Kazıyıcı', other: 'Diğer' }
    },
    operators: { title: 'Operatör Yönetimi', subtitle: 'Saha personelini, yetki belgelerini ve iletişim bilgilerini yönetin.', addOperator: 'Operatör Ekle', editOperator: 'Operatörü Düzenle', searchPlaceholder: 'İsim veya uzmanlık ara...', deleteButton: 'Sil', noSpecialty: 'Uzmanlık Yok', licenses: 'Belgeler', multiSelect: '(Çoklu Seçim)', deleteConfirmTitle: 'Operatörü Silmek İstediğinize Emin Misiniz?', deleteWarning: 'Bu işlem geri alınamaz. Operatör ve tüm ilişkili veriler kalıcı olarak silinecektir.', confirmDelete: 'Evet, Sil', form: { name: 'Ad Soyad', license: 'Ehliyet / Sertifika', specialty: 'Uzmanlık', phone: 'Telefon', email: 'E-posta', save: 'Kaydet', cancel: 'İptal' } },
    jobs: { title: 'İş ve Şantiye Yönetimi', subtitle: 'Aktif projeleri takip edin ve makineleri şantiyelere atayın.', addJob: 'Yeni İş Ekle', mapView: 'Harita Görünümü', listView: 'Listeye Dön', searchPlaceholder: 'İş adı, konum veya açıklama ara...', filters: 'Filtreler', clearFilters: 'Filtreleri Temizle', noJobsFound: 'Arama kriterlerinize uygun iş bulunamadı. Filtreleri temizlemeyi deneyin.', progressStatus: 'İlerleme Durumu', assignedMachines: 'Atanan Makineler', assignedOperators: 'Atanan Operatörler', noOperatorsAssigned: 'Henüz operatör atanmadı.', startDate: 'Başlangıç', details: 'Detaylar', detailsView: 'Detayları Gör', edit: 'Düzenle', delete: 'Sil', filterLabels: { status: 'Durum', priority: 'Öncelik', all: 'Tümü' }, status: { inProgress: 'Devam Ediyor', delayed: 'Gecikmede', completed: 'Tamamlandı', scheduled: 'Planlandı' }, priority: { low: 'Düşük', medium: 'Orta', high: 'Yüksek', urgent: 'Acil' }, modal: { addTitle: 'Yeni İş Ekle', editTitle: 'İşi Düzenle', jobName: 'İş Adı', location: 'Konum', description: 'Açıklama', startDate: 'Başlangıç Tarihi', endDate: 'Bitiş Tarihi', status: 'Durum', priority: 'Öncelik', progress: 'İlerleme', assignMachines: 'Makine Ata', assignOperators: 'Operatör Ata', cancel: 'İptal', save: 'Kaydet', close: 'Kapat', coordinates: 'Koordinatlar', selectStatus: 'Durum Seçin', selectPriority: 'Öncelik Seçin', required: 'Zorunlu Alan' }, resultsFound: 'sonuç bulundu', searchFor: 'araması için', jobAndMachineLocations: 'İş ve Makine Konumları', jobs: 'İşler', idleMachines: 'Boşta Makineler', noResults: 'Sonuç Bulunamadı', noOperator: 'Operatör Yok', noMachinesAssigned: 'Henüz makine atanmadı.', jobTitle: 'İş Başlığı', jobTitlePlaceholder: 'örn: Kuzey Otoyolu Viyadük İnşaatı', descriptionPlaceholder: 'İş detaylarını girin...', locationLabel: 'Konum / Şantiye Adı', locationPlaceholder: 'örn: İstanbul, Levent Şantiyesi', noMachinesAdded: 'Henüz makine eklenmemiş.', noOperatorsAdded: 'Henüz operatör eklenmemiş.', endLabel: 'Bitiş:', noLocationInfo: 'Konum bilgisi mevcut değil', noCoordinates: 'Bu iş için koordinat eklenmemiş.', openGoogleMaps: 'Google Maps\'te Aç', deleteConfirmTitle: 'Bu İşi Silmek İstediğinize Emin Misiniz?', deleteWarning: 'Bu işlem geri alınamaz. İş ve tüm ilişkili veriler kalıcı olarak silinecektir.', confirmDelete: 'Evet, Sil', descriptionLabel: 'Açıklama', latitude: 'Enlem (Lat)', longitude: 'Boylam (Lng)', startDateLabel: 'Başlangıç Tarihi', endDateLabel: 'Bitiş Tarihi', statusLabel: 'Durum', priorityLabel: 'Öncelik', progressLabel: 'İlerleme', assignMachineLabel: 'Makine Ata', assignOperatorLabel: 'Operatör Ata', noLicenseInfo: 'Lisans bilgisi yok', noMachineAssigned: 'Henüz makine atanmadı.', dates: 'Tarihler', coordinatesLabel: 'Koordinatlar', clickMapToSelect: 'Haritaya tıklayarak konum seçin', engineHour: 'Motor Saati', saving: 'Kaydediliyor...', machineStatus: { active: 'Aktif', maintenance: 'Bakımda', idle: 'Boşta' } },
    checklists: { title: 'Kontrol Listesi Şablonları', subtitle: 'Makineler için günlük kontrol formlarını yönetin.', addTemplate: 'Yeni Şablon Oluştur', itemsCount: 'Kontrol Maddesi', modal: { titleNew: 'Yeni Kontrol Listesi', titleEdit: 'Şablonu Düzenle', nameLabel: 'Şablon Adı', itemsLabel: 'Kontrol Maddeleri', save: 'Şablonu Kaydet', cancel: 'İptal', namePlaceholder: 'Örn: Ekskavatör Günlük Bakım', itemPlaceholder: 'Örn: Motor Yağı Kontrolü' } },
    approvals: { title: 'Onay Kuyruğu', subtitle: 'Operatörlerden gelen günlük kontrol formlarını inceleyin.', empty: 'Her Şey Güncel!', approve: 'Onayla', reject: 'Reddet', review: 'İncele', queue: 'Ön Kontrol', reportedIssues: 'Raporlanan Sorunlar', allSystemsNormal: 'Tüm sistemler normal raporlandı.', checklistDetail: 'Kontrol Listesi Detayı', machine: 'Makine', checklistItems: 'Kontrol Maddeleri', issueReported: 'Sorun Bildirildi.', operatorPhoto: 'Operatör Fotoğrafı:', noDetailData: 'Detaylı liste verisi bulunamadı.', operatorNote: 'Operatör Notu' },
    finance: { title: 'Finans ve Faturalandırma', subtitle: 'Harcamalarınızı ve geçmiş faturalarınızı yönetin.', downloadStatement: 'Ekstre İndir', currentMonth: 'Güncel Ay Tahmini', nextBilling: 'Sonraki Fatura Tarihi', discountStatus: 'İndirim Durumu', paymentMethod: 'Ödeme Yöntemi', invoiceHistory: 'Fatura Geçmişi', activeMachine: 'Aktif Makine', autoDebit: 'Otomatik çekim yapılacaktır.', discountActive: '%10 Aktif', discountStandard: '%0 Standart', volumeDiscount: 'Hacim indirimi uygulanıyor.', earnDiscount: 'makine daha eklerseniz %10 indirim kazanacaksınız.', updateCard: 'Kartı Güncelle', downloadPDF: 'PDF İndir', table: { invoiceNo: 'Fatura No', date: 'Tarih', desc: 'Açıklama', amount: 'Tutar', status: 'Durum' }, statuses: { paid: 'Ödendi', pending: 'Bekliyor', overdue: 'Gecikmiş' }, paymentMethods: { creditCard: 'Kredi Kartı', autoMonthly: 'Otomatik aylık çekim', marketplace: 'Hepsiburada / Trendyol', marketplaceDesc: 'Market üzerinden ödeme', linkedAccount: 'Hesabınıza bağlı', bankTransfer: 'Havale/EFT', manualTransfer: 'Manuel banka transferi' }, modal: { updateCard: 'Kredi Kartı Güncelle', cardNumber: 'Kart Numarası', expiry: 'Son Kullanma', cvv: 'CVV', cardName: 'Kart Üzerindeki İsim', cancel: 'İptal', save: 'Kartı Kaydet' }, bankInfo: { title: 'Banka Hesap Bilgileri', bank: 'Banka', accountName: 'Hesap Adı', iban: 'IBAN', note: 'Açıklamaya firma adınızı ve fatura numaranızı yazmayı unutmayın.' }, marketplaceInfo: { title: 'Market Ödeme Bilgileri', description: 'Hepsiburada veya Trendyol hesabınız üzerinden otomatik ödeme yapabilirsiniz.', note: 'Market hesabınıza bağlı kredi kartınızdan çekim yapılacaktır.' }, print: { accountStatement: 'Hesap Ekstresi', company: 'Firma', address: 'Adres', phone: 'Tel', date: 'Tarih', monthlyAmount: 'Aylık Tutar', total: 'Toplam', documentCreatedAt: 'Bu belge tarihinde oluşturulmuştur', sender: 'Gönderen', recipient: 'Alıcı', description: 'Açıklama', period: 'Dönem', electronicInvoice: 'Bu fatura elektronik olarak oluşturulmuştur.', cardUpdated: 'Kart bilgileri başarıyla güncellendi!', notSpecified: 'Belirtilmemiş' } },
    settings: { title: 'Ayarlar', subtitle: 'Hesap, firma ve uygulama tercihlerinizi yönetin.', tabs: { profile: 'Profil Ayarları', company: 'Firma Bilgileri', notifications: 'Bildirimler', security: 'Güvenlik' }, save: 'Değişiklikleri Kaydet', saved: 'Kaydedildi!', labels: { fullName: 'Ad Soyad', title: 'Unvan', email: 'E-posta Adresi', language: 'Dil Seçimi', theme: 'Tema', firmName: 'Firma Unvanı', taxNo: 'Vergi Numarası', taxOffice: 'Vergi Dairesi', phone: 'Telefon', address: 'Adres', profilePhoto: 'Profil Fotoğrafı', profilePhotoHint: 'PNG, JPG formatında max 2MB.', appPreferences: 'Uygulama Tercihleri', darkMode: 'Karanlık Mod', lightMode: 'Aydınlık Mod', companyInfoImportant: 'Firma Bilgileri Önemlidir', companyInfoDesc: 'Bu bilgiler faturalarınızda ve operatörlerinizin ekranında görünecektir.', currentPassword: 'Mevcut Şifre', newPassword: 'Yeni Şifre', confirmPassword: 'Yeni Şifre (Tekrar)', accountSecurity: 'Hesap Güvenliği', securityHint: 'Şifrenizi düzenli olarak değiştirmeniz önerilir.', twoFactor: 'İki Faktörlü Doğrulama (2FA)', twoFactorDesc: 'Giriş yaparken telefonunuza kod gönderilir.', activate: 'Aktifleştir' }, notifications: { emailAlerts: 'E-posta Bildirimleri', emailAlertsDesc: 'Önemli güncellemeleri e-posta ile al.', pushNotifications: 'Anlık Bildirimler (Push)', pushDesc: 'Tarayıcı üzerinden anlık uyarılar.', maintenanceAlerts: 'Bakım Uyarıları', maintenanceDesc: 'Makine bakım zamanı geldiğinde uyar.', weeklyReport: 'Haftalık Rapor', weeklyReportDesc: 'Her Pazartesi haftalık özet raporu gönder.', marketing: 'Kampanya ve Duyurular', marketingDesc: 'Yeni özellikler ve indirimlerden haberdar ol.' } }
  },
  en: {
    sidebar: { dashboard: 'Dashboard', machines: 'Fleet Management', operators: 'Operator Management', jobs: 'Job Management', checklists: 'Checklists', approvals: 'Approvals', notifications: 'Notification Center', finance: 'Finance & Invoices', settings: 'Settings', firmInfo: 'Company Info', managerPortal: 'Manager Portal', logout: 'Log Out', darkMode: 'Dark Mode', lightMode: 'Light Mode' },
    dashboard: { title: 'Operational Overview', subtitle: 'Real-time summary of your fleet status.', totalEngineHours: 'Total Engine Hours', pendingApprovals: 'Pending Approvals', activeMachines: 'Active Machines', avgUsage: 'Avg. Usage', weeklyHours: 'Weekly Operating Hours', fleetStatus: 'Fleet Status Distribution', activeJobs: 'Active Sites & Jobs', viewAll: 'View All', assignedMachines: 'Assigned Machines:', allFleetAverage: 'All Fleet Average', table: { machine: 'Machine', serial: 'Serial No', status: 'Status', hours: 'Engine Hours', location: 'Location', projectName: 'Project Name', progress: 'Progress', assignedMachine: 'Assigned Machine' }, stats: { active: 'Active', maintenance: 'Maintenance', idle: 'Idle', hours: 'hours' }, days: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }, unknown: 'Unknown', backToList: 'Back to List', lastMaintenance: 'Last Maintenance', operator: 'Operator', commonFaults: 'Common Faults / Part Replacement', serviceRecords: 'Service and Maintenance Records', liveMap: 'Live Map - Machine, Operator and Job Locations', machines: 'Machines', operators: 'Operators', jobPoints: 'Job Points', noServiceHistory: 'No service history found.', machinesAssigned: 'machines assigned', inProgress: 'In Progress', delayed: 'Delayed', completed: 'Completed' },
    landing: {
      nav: {
        features: 'Features',
        calculator: 'Calculator',
        pricing: 'Pricing',
        portalLogin: 'Portal Login'
      },
      hero: {
        badge: '🚀 New Era in Heavy Equipment Management',
        title: 'Digitize Your',
        titleHighlight: 'Field Operations.',
        subtitle: 'Say goodbye to paper forms. Manage your excavators, cranes and trucks from your pocket. Reduce breakdowns by 40%, increase efficiency.',
        startFree: 'Start Free',
        requestDemo: 'Request Demo'
      },
      roi: {
        title: 'How Much Will You Save?',
        subtitle: 'Calculate monthly operational losses and net savings with Smartop based on your machine count.',
        machineCount: 'Machines in Fleet:',
        estimatedSavings: 'Estimated Monthly Savings',
        benefits: {
          speed: { title: 'Speed', desc: '70% reduction in form filling time.' },
          security: { title: 'Security', desc: 'Detect breakdowns in advance.' },
          analysis: { title: 'Analysis', desc: 'Data-driven maintenance decisions.' },
          mobile: { title: 'Mobile', desc: 'In every operator\'s pocket.' }
        }
      },
      features: {
        title: 'Why Smartop?',
        subtitle: 'Traditional methods are slow, error-prone and expensive. We\'re modernizing the process.',
        remoteTracking: {
          title: 'Remote Tracking',
          desc: 'See which machine is working and which is down on the map without going to the site.'
        },
        digitalApproval: {
          title: 'Digital Approval',
          desc: 'Operator fills the form, manager approves instantly. No more waiting for wet signature.'
        },
        advancedReporting: {
          title: 'Advanced Reporting',
          desc: 'Which part breaks down most frequently? Which operator is more efficient? All on one screen.'
        }
      },
      cta: {
        title: 'Start Fleet Management Now',
        subtitle: 'Try all features free for 14 days without a credit card.',
        button: 'Sign Up Now'
      },
      footer: {
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        support: 'Support',
        copyright: '© 2024 Smartop Inc. All rights reserved.'
      },
      auth: {
        login: 'Portal Login',
        register: 'Register',
        forgotPassword: 'Forgot Password',
        email: 'Email',
        emailPlaceholder: 'example@company.com',
        password: 'Password',
        passwordPlaceholder: '••••••••',
        rememberMe: 'Remember me',
        forgotPasswordLink: 'Forgot password',
        loginButton: 'Login',
        loggingIn: 'Logging in...',
        or: 'or',
        googleLogin: 'Sign in with Google',
        noAccount: 'Don\'t have an account?',
        registerLink: 'Register',
        companyName: 'Company Name',
        companyPlaceholder: 'Company Name',
        firstName: 'First Name',
        firstNamePlaceholder: 'First Name',
        lastName: 'Last Name',
        lastNamePlaceholder: 'Last Name',
        passwordMinLength: 'At least 8 characters',
        confirmPassword: 'Confirm Password',
        confirmPasswordPlaceholder: 'Re-enter password',
        registering: 'Registering...',
        registerButton: 'Register',
        hasAccount: 'Already have an account?',
        loginLink: 'Login',
        forgotPasswordDesc: 'Enter your email address and we\'ll send you a password reset link.',
        sending: 'Sending...',
        sendResetLink: 'Send Reset Link',
        backToLogin: '← Back to login page',
        errors: {
          loginFailed: 'Login failed. Please check your credentials.',
          passwordMismatch: 'Passwords do not match.',
          passwordTooShort: 'Password must be at least 8 characters.',
          registerFailed: 'Registration failed. Please try again.',
          emailRequired: 'Please enter your email address.',
          googleSoon: 'Google sign-in coming soon.'
        },
        success: {
          registerSuccess: 'Registration successful! You can now login.',
          resetLinkSent: 'Password reset link has been sent to your email address.'
        }
      }
    },
    machines: {
      title: 'Machine Fleet', subtitle: 'Fleet management, assignments and usage costs.', payAsYouGo: 'Pay As You Go', addMachine: 'Add Machine', searchPlaceholder: 'Search by name, brand or serial...',
      subscription: {
        title: 'Subscription Model',
        payAsYouGo: 'Pay As You Go',
        basePrice: 'Base Price',
        perMachine: '/machine/month',
        machinesInCart: 'Machines in Cart',
        totalMachines: 'Total Machines',
        discount: 'Discount',
        discountEarned: 'Discount Earned',
        monthlyTotal: 'Monthly Total',
        savingsInfo: 'more machines to get',
        savingsInfo2: 'discount.',
        or: 'or',
        activeMachines: 'Active Machines',
        twoFactorEnabled: 'Two-Factor Authentication Enabled'
      },
      operations: {
        title: 'Operational Assignments',
        quickAssign: 'Quick Assign',
        workArea: 'Work Area',
        noAssignment: 'No Assignment',
        assignedOperator: 'Assigned Operator',
        assignedChecklist: 'Assigned Checklist'
      },
      stats: {
        engineHours: 'Engine Hours',
        lastMaintenance: 'Last Maintenance',
        hours: 'hours',
        daysAgo: 'days ago'
      },
      filters: {
        all: 'All',
        active: 'Active',
        maintenance: 'Maintenance',
        idle: 'Idle'
      },
      actions: {
        noList: 'No List',
        editAll: 'Edit All',
        edit: 'Edit',
        viewDetails: 'View Details'
      },
      cart: { title: 'Cart Total', confirm: 'Confirm Cart', total: 'Total Amount', empty: 'Cart is empty.' },
      modal: { title: 'Add New Machine', smartFill: 'Smart Fill', cancel: 'Cancel', add: 'Add to List & Cart', selectType: 'Select Machine Type', technicalDetails: 'Technical Details', searchBrandModel: 'Search Brand & Model', machineName: 'Machine Name', brand: 'Brand', model: 'Model', serialNumber: 'Serial Number', licensePlate: 'License Plate', year: 'Manufacturing Year', engineHours: 'Engine Hours', fuelType: 'Fuel Type', fuelCapacity: 'Fuel Capacity', operator: 'Operator', checklist: 'Checklist', selectOperator: 'Select Operator', selectChecklist: 'Select Checklist', editMachine: 'Edit Machine', status: 'Status', delete: 'Delete', save: 'Save', close: 'Close', noOperator: 'No Operator Assigned', noChecklist: 'No Checklist Assigned', operationalAssignments: 'Operational Assignments', operatorSelection: 'Operator Selection', checklistSelection: 'Checklist Selection', notAssigned: 'Not Assigned (Later)', imageUrl: 'Image URL', changeImage: 'Change Image', findDifferentImage: 'Find Different Image', generateRandom: 'Generate Random', fetchingData: 'Fetching Data...', resultsFound: 'Results Found', modelBrandCategory: 'Brand/Category', searchPlaceholder: 'E.g.: Bobcat Forklift, CAT 320, Komatsu PC200...', searchHint: 'Type brand and model then click "Search", select from list.', search: 'Search', deleteConfirm: 'Delete Machine', confirmDelete: 'Are you sure you want to delete this machine?' },
      types: { excavator: 'Excavator', dozer: 'Dozer', crane: 'Crane', loader: 'Loader', truck: 'Truck', grader: 'Grader', roller: 'Roller', forklift: 'Forklift', backhoe: 'Backhoe Loader', skidSteer: 'Skid Steer', telehandler: 'Telehandler', compactor: 'Compactor', paver: 'Paver', trencher: 'Trencher', drill: 'Drill', generator: 'Generator', compressor: 'Compressor', concreteEquipment: 'Concrete Equipment', lift: 'Lift Platform', trailer: 'Trailer', scraper: 'Scraper', other: 'Other' }
    },
    operators: { title: 'Operator Management', subtitle: 'Manage field personnel, licenses and contact info.', addOperator: 'Add Operator', editOperator: 'Edit Operator', searchPlaceholder: 'Search by name or specialty...', deleteButton: 'Delete', noSpecialty: 'No Specialty', licenses: 'Licenses', multiSelect: '(Multi-Select)', deleteConfirmTitle: 'Are You Sure You Want to Delete This Operator?', deleteWarning: 'This action cannot be undone. The operator and all associated data will be permanently deleted.', confirmDelete: 'Yes, Delete', form: { name: 'Full Name', license: 'License / Certificate', specialty: 'Specialty', phone: 'Phone', email: 'Email', save: 'Save', cancel: 'Cancel' } },
    jobs: { title: 'Job & Site Management', subtitle: 'Track active projects and assign machines.', addJob: 'Add New Job', mapView: 'Map View', listView: 'Back to List', searchPlaceholder: 'Search job name, location or description...', filters: 'Filters', clearFilters: 'Clear Filters', noJobsFound: 'No jobs found matching your search criteria. Try clearing filters.', progressStatus: 'Progress Status', assignedMachines: 'Assigned Machines', assignedOperators: 'Assigned Operators', noOperatorsAssigned: 'No operators assigned yet.', startDate: 'Start', details: 'Details', detailsView: 'View Details', edit: 'Edit', delete: 'Delete', filterLabels: { status: 'Status', priority: 'Priority', all: 'All' }, status: { inProgress: 'In Progress', delayed: 'Delayed', completed: 'Completed', scheduled: 'Scheduled' }, priority: { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' }, modal: { addTitle: 'Add New Job', editTitle: 'Edit Job', jobName: 'Job Name', location: 'Location', description: 'Description', startDate: 'Start Date', endDate: 'End Date', status: 'Status', priority: 'Priority', progress: 'Progress', assignMachines: 'Assign Machines', assignOperators: 'Assign Operators', cancel: 'Cancel', save: 'Save', close: 'Close', coordinates: 'Coordinates', selectStatus: 'Select Status', selectPriority: 'Select Priority', required: 'Required Field' }, resultsFound: 'results found', searchFor: 'search for', jobAndMachineLocations: 'Job and Machine Locations', jobs: 'Jobs', idleMachines: 'Idle Machines', noResults: 'No Results Found', noOperator: 'No Operator', noMachinesAssigned: 'No machines assigned yet.', jobTitle: 'Job Title', jobTitlePlaceholder: 'e.g.: North Highway Viaduct Construction', descriptionPlaceholder: 'Enter job details...', locationLabel: 'Location / Site Name', locationPlaceholder: 'e.g.: Istanbul, Levent Site', noMachinesAdded: 'No machines added yet.', noOperatorsAdded: 'No operators added yet.', endLabel: 'End:', noLocationInfo: 'Location info not available', noCoordinates: 'No coordinates added for this job.', openGoogleMaps: 'Open in Google Maps', deleteConfirmTitle: 'Are You Sure You Want to Delete This Job?', deleteWarning: 'This action cannot be undone. The job and all associated data will be permanently deleted.', confirmDelete: 'Yes, Delete', descriptionLabel: 'Description', latitude: 'Latitude (Lat)', longitude: 'Longitude (Lng)', startDateLabel: 'Start Date', endDateLabel: 'End Date', statusLabel: 'Status', priorityLabel: 'Priority', progressLabel: 'Progress', assignMachineLabel: 'Assign Machine', assignOperatorLabel: 'Assign Operator', noLicenseInfo: 'No license info', noMachineAssigned: 'No machine assigned yet.', dates: 'Dates', coordinatesLabel: 'Coordinates', clickMapToSelect: 'Click on the map to select location', engineHour: 'Engine Hours', saving: 'Saving...', machineStatus: { active: 'Active', maintenance: 'Maintenance', idle: 'Idle' } },
    checklists: { title: 'Checklist Templates', subtitle: 'Manage daily inspection forms for machines.', addTemplate: 'Create New Template', itemsCount: 'Checklist Items', modal: { titleNew: 'New Checklist', titleEdit: 'Edit Template', nameLabel: 'Template Name', itemsLabel: 'Checklist Items', save: 'Save Template', cancel: 'Cancel', namePlaceholder: 'E.g.: Excavator Daily Check', itemPlaceholder: 'E.g.: Engine Oil Check' } },
    approvals: { title: 'Approval Queue', subtitle: 'Review daily inspection forms from operators.', empty: 'All Caught Up!', approve: 'Approve', reject: 'Reject', review: 'Review', queue: 'Pre-Check', reportedIssues: 'Reported Issues', allSystemsNormal: 'All systems reported normal.', checklistDetail: 'Checklist Detail', machine: 'Machine', checklistItems: 'Checklist Items', issueReported: 'Issue Reported.', operatorPhoto: 'Operator Photo:', noDetailData: 'No detailed data available.', operatorNote: 'Operator Note' },
    finance: { title: 'Finance & Billing', subtitle: 'Manage expenses and invoice history.', downloadStatement: 'Download Statement', currentMonth: 'Current Month Forecast', nextBilling: 'Next Billing Date', discountStatus: 'Discount Status', paymentMethod: 'Payment Method', invoiceHistory: 'Invoice History', activeMachine: 'Active Machine', autoDebit: 'Automatic debit will be processed.', discountActive: '10% Active', discountStandard: '0% Standard', volumeDiscount: 'Volume discount applied.', earnDiscount: 'more machines to earn 10% discount.', updateCard: 'Update Card', downloadPDF: 'Download PDF', table: { invoiceNo: 'Invoice No', date: 'Date', desc: 'Description', amount: 'Amount', status: 'Status' }, statuses: { paid: 'Paid', pending: 'Pending', overdue: 'Overdue' }, paymentMethods: { creditCard: 'Credit Card', autoMonthly: 'Automatic monthly debit', marketplace: 'Hepsiburada / Trendyol', marketplaceDesc: 'Payment via marketplace', linkedAccount: 'Linked to your account', bankTransfer: 'Bank Transfer', manualTransfer: 'Manual bank transfer' }, modal: { updateCard: 'Update Credit Card', cardNumber: 'Card Number', expiry: 'Expiry Date', cvv: 'CVV', cardName: 'Name on Card', cancel: 'Cancel', save: 'Save Card' }, bankInfo: { title: 'Bank Account Details', bank: 'Bank', accountName: 'Account Name', iban: 'IBAN', note: 'Please include your company name and invoice number in the description.' }, marketplaceInfo: { title: 'Marketplace Payment Info', description: 'You can make automatic payments through your Hepsiburada or Trendyol account.', note: 'Payment will be charged to the credit card linked to your marketplace account.' }, print: { accountStatement: 'Account Statement', company: 'Company', address: 'Address', phone: 'Phone', date: 'Date', monthlyAmount: 'Monthly Amount', total: 'Total', documentCreatedAt: 'This document was created on', sender: 'Sender', recipient: 'Recipient', description: 'Description', period: 'Period', electronicInvoice: 'This invoice was generated electronically.', cardUpdated: 'Card details updated successfully!', notSpecified: 'Not Specified' } },
    settings: { title: 'Settings', subtitle: 'Manage account, company, and app preferences.', tabs: { profile: 'Profile Settings', company: 'Company Info', notifications: 'Notifications', security: 'Security' }, save: 'Save Changes', saved: 'Saved!', labels: { fullName: 'Full Name', title: 'Job Title', email: 'Email Address', language: 'Language Selection', theme: 'Theme', firmName: 'Company Name', taxNo: 'Tax Number', taxOffice: 'Tax Office', phone: 'Phone', address: 'Address', profilePhoto: 'Profile Photo', profilePhotoHint: 'PNG, JPG format max 2MB.', appPreferences: 'App Preferences', darkMode: 'Dark Mode', lightMode: 'Light Mode', companyInfoImportant: 'Company Info is Important', companyInfoDesc: 'This information will appear on your invoices and operator screens.', currentPassword: 'Current Password', newPassword: 'New Password', confirmPassword: 'Confirm New Password', accountSecurity: 'Account Security', securityHint: 'It is recommended to change your password regularly.', twoFactor: 'Two-Factor Authentication (2FA)', twoFactorDesc: 'A code will be sent to your phone when signing in.', activate: 'Activate' }, notifications: { emailAlerts: 'Email Notifications', emailAlertsDesc: 'Receive important updates via email.', pushNotifications: 'Push Notifications', pushDesc: 'Instant alerts via browser.', maintenanceAlerts: 'Maintenance Alerts', maintenanceDesc: 'Alert when machine maintenance is due.', weeklyReport: 'Weekly Report', weeklyReportDesc: 'Send weekly summary report every Monday.', marketing: 'Campaigns & Announcements', marketingDesc: 'Stay informed about new features and discounts.' } }
  }
};

// Map API machine status to frontend MachineStatus
const mapMachineStatus = (status: APIMachine['status']): MachineStatus => {
  switch (status) {
    case 'active': return MachineStatus.Active;
    case 'maintenance': return MachineStatus.Maintenance;
    case 'idle': return MachineStatus.Idle;
    default: return MachineStatus.Idle;
  }
};

// Map API machine type to frontend Machine type
const mapMachineType = (machineType: APIMachine['machineType']): Machine['type'] => {
  switch (machineType) {
    case 'excavator': return 'Excavator';
    case 'dozer': return 'Dozer';
    case 'loader': return 'Loader';
    case 'crane': return 'Crane';
    case 'truck': return 'Truck';
    default: return 'Excavator';
  }
};

// Helper function to convert API machine to frontend Machine type
const convertAPIMachineToMachine = (apiMachine: APIMachine): Machine => ({
  id: apiMachine.id,
  name: apiMachine.name,
  brand: apiMachine.brand,
  model: apiMachine.model,
  year: apiMachine.year?.toString() || '',
  type: mapMachineType(apiMachine.machineType),
  serialNumber: apiMachine.serialNumber || '',
  status: mapMachineStatus(apiMachine.status),
  engineHours: Number(apiMachine.engineHours) || 0,
  lastService: apiMachine.createdAt?.split('T')[0] || '',
  imageUrl: 'https://images.unsplash.com/photo-1582239634898-3564c768832a?q=80&w=800&auto=format&fit=crop',
  assignedOperatorId: apiMachine.assignedOperatorId || undefined,
  assignedChecklistId: apiMachine.checklistTemplateId || undefined,
  location: apiMachine.locationLat && apiMachine.locationLng ? {
    lat: apiMachine.locationLat,
    lng: apiMachine.locationLng,
    address: apiMachine.locationAddress || 'Bilinmiyor',
  } : undefined,
  commonFaults: [],
  serviceHistory: [],
});

// Helper function to convert API user to frontend Operator type
// Specialty translation map (English to Turkish)
const SPECIALTY_TRANSLATIONS: Record<string, string> = {
  'crane': 'Vinç',
  'excavator': 'Ekskavatör',
  'loader': 'Yükleyici',
  'dozer': 'Dozer',
  'truck': 'Kamyon',
  'forklift': 'Forklift',
  'grader': 'Greyder',
};

const translateSpecialty = (specialty: string): string => {
  const lowerSpecialty = specialty.toLowerCase();
  return SPECIALTY_TRANSLATIONS[lowerSpecialty] || specialty;
};

const convertAPIUserToOperator = (apiUser: APIUser): Operator => ({
  id: apiUser.id,
  name: `${apiUser.firstName} ${apiUser.lastName}`,
  licenseType: apiUser.licenses || [],
  specialty: apiUser.specialties || [], // Keep English values, UI will translate for display
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(apiUser.firstName + '+' + apiUser.lastName)}&background=0F2C59&color=fff`,
  phone: apiUser.phone || '',
  email: apiUser.email,
});

// Map API job status to frontend Job status
const mapJobStatus = (status: APIJob['status']): Job['status'] => {
  switch (status) {
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Delayed';
    case 'scheduled': return 'Scheduled';
    default: return 'In Progress';
  }
};

// Map API job priority to frontend Job priority
const mapJobPriority = (priority: APIJob['priority']): Job['priority'] => {
  return priority || 'medium';
};

// Helper function to convert API job to frontend Job type
const convertAPIJobToJob = (apiJob: APIJob): Job => ({
  id: apiJob.id,
  title: apiJob.title,
  description: apiJob.description,
  location: apiJob.locationName || apiJob.locationAddress || '',
  status: mapJobStatus(apiJob.status),
  progress: apiJob.progress || 0,
  priority: mapJobPriority(apiJob.priority),
  startDate: apiJob.scheduledStart?.split('T')[0] || apiJob.createdAt?.split('T')[0] || '',
  endDate: apiJob.scheduledEnd?.split('T')[0],
  assignedMachineIds: apiJob.jobAssignments?.filter(a => a.machineId).map(a => a.machineId) || [],
  assignedOperatorIds: apiJob.jobAssignments?.filter(a => a.operatorId).map(a => a.operatorId) || [],
  coordinates: apiJob.locationLat && apiJob.locationLng ? {
    lat: apiJob.locationLat,
    lng: apiJob.locationLng,
  } : undefined,
});

// Helper function to convert API template to frontend ChecklistTemplate type
const convertAPITemplateToTemplate = (apiTemplate: APITemplate): ChecklistTemplate => ({
  id: apiTemplate.id,
  name: apiTemplate.name,
  itemsCount: apiTemplate.items?.length || 0,
  items: apiTemplate.items?.map(item => item.label) || [],
});

// Helper function to convert API submission to frontend ChecklistItem type
const convertAPISubmissionToChecklist = (submission: ChecklistSubmission): ChecklistItem => ({
  id: submission.id,
  machineId: submission.machineId || '',
  operatorName: submission.operator ? `${submission.operator.firstName} ${submission.operator.lastName}` : 'Bilinmiyor',
  date: submission.createdAt || '',
  status: submission.status === 'pending' ? ChecklistStatus.Pending : submission.status === 'approved' ? ChecklistStatus.Approved : ChecklistStatus.Rejected,
  issues: submission.entries?.filter(e => !e.isOk).map(e => e.value || e.label) || [],
  notes: submission.notes || '',
  entries: submission.entries?.map(e => ({
    label: e.label,
    isOk: e.isOk,
    value: e.value,
    photoUrl: e.photoUrl,
  })) || [],
});

const App: React.FC = () => {
  // Auth State from Context
  const { isAuthenticated, isLoading: authLoading, logout, user, organization, updateUser } = useAuth();

  // Toast notifications
  const toast = useToast();

  // API Data Queries (only run when authenticated)
  const { data: apiMachines, isLoading: machinesLoading } = useMachines(undefined, { enabled: isAuthenticated });
  const { data: apiOperators, isLoading: operatorsLoading } = useOperators({ enabled: isAuthenticated });
  const { data: apiJobs, isLoading: jobsLoading } = useJobs(undefined, { enabled: isAuthenticated });
  const { data: apiTemplates, isLoading: templatesLoading } = useChecklistTemplates({ enabled: isAuthenticated });
  const { data: apiSubmissions, isLoading: submissionsLoading } = usePendingSubmissions({ enabled: isAuthenticated });

  // Mutations
  const reviewSubmissionMutation = useReviewSubmission();
  // Job mutations
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();
  const assignJobMutation = useAssignJob();
  // Machine mutations
  const createMachineMutation = useCreateMachine();
  const updateMachineMutation = useUpdateMachine();
  const deleteMachineMutation = useDeleteMachine();
  // User/Operator mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  // Template mutations
  const createTemplateMutation = useCreateTemplate();
  const updateTemplateMutation = useUpdateTemplate();
  const deleteTemplateMutation = useDeleteTemplate();

  // Convert API data to frontend types, fallback to mock data if API not available
  // API returns paginated response: { data: [...], meta: {...} }
  const machines: Machine[] = useMemo(() => {
    const machineData = apiMachines?.data || apiMachines;
    if (machineData && Array.isArray(machineData) && machineData.length > 0) {
      return machineData.map(convertAPIMachineToMachine);
    }
    return MOCK_MACHINES;
  }, [apiMachines]);

  const operators: Operator[] = useMemo(() => {
    const operatorData = apiOperators?.data || apiOperators;
    if (operatorData && Array.isArray(operatorData) && operatorData.length > 0) {
      return operatorData.map(convertAPIUserToOperator);
    }
    return MOCK_OPERATORS;
  }, [apiOperators]);

  const jobs: Job[] = useMemo(() => {
    const jobData = apiJobs?.data || apiJobs;
    if (jobData && Array.isArray(jobData) && jobData.length > 0) {
      return jobData.map(convertAPIJobToJob);
    }
    return MOCK_JOBS;
  }, [apiJobs]);

  const checklistTemplates: ChecklistTemplate[] = useMemo(() => {
    const templateData = apiTemplates?.data || apiTemplates;
    if (templateData && Array.isArray(templateData) && templateData.length > 0) {
      return templateData.map(convertAPITemplateToTemplate);
    }
    return MOCK_TEMPLATES;
  }, [apiTemplates]);

  const checklists: ChecklistItem[] = useMemo(() => {
    const submissionData = apiSubmissions?.data || apiSubmissions;
    if (submissionData && Array.isArray(submissionData)) {
      return submissionData.map(convertAPISubmissionToChecklist);
    }
    return [];
  }, [apiSubmissions]);

  // Mobile Simulator State
  const [showMobileSim, setShowMobileSim] = useState(false);

  const [currentView, setCurrentView] = useState('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);

  // Combined loading state
  const isLoading = authLoading || (isAuthenticated && (machinesLoading || operatorsLoading || jobsLoading || templatesLoading || submissionsLoading));
  
  // Firm Info State - updated from organization when logged in
  const [firmDetails, setFirmDetails] = useState<FirmDetails>({
    name: "Kuzey İnşaat Ltd.",
    phone: "+90 212 555 10 20",
    email: "info@kuzeyinsaat.com.tr",
    address: "Büyükdere Cad. No:199 Şişli/İstanbul",
    taxNo: "1234567890",
    taxOffice: "Maslak V.D."
  });

  // Update firm details when organization data is available
  useEffect(() => {
    if (organization) {
      setFirmDetails(prev => ({
        ...prev,
        name: organization.name || prev.name,
        phone: (organization as any).phone || prev.phone,
        email: (organization as any).email || prev.email,
        address: (organization as any).address || prev.address,
      }));
    }
  }, [organization]);

  // Language State
  const [language, setLanguage] = useState<Language>('tr');

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const browserLang = navigator.language.startsWith('tr') ? 'tr' : 'en';
    setLanguage(browserLang);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const handleLogout = async () => {
      await logout();
      setCurrentView('dashboard');
  };

  // Helper: Map frontend status to API status
  const mapFrontendStatusToAPI = (status: Job['status']): 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' => {
    switch (status) {
      case 'In Progress': return 'in_progress';
      case 'Completed': return 'completed';
      case 'Delayed': return 'cancelled';
      case 'Scheduled': return 'scheduled';
      default: return 'scheduled';
    }
  };

  // Helper: Map frontend machine type to API type
  const mapMachineTypeToAPI = (type: Machine['type']): 'excavator' | 'dozer' | 'loader' | 'crane' | 'truck' => {
    switch (type) {
      case 'Excavator': return 'excavator';
      case 'Dozer': return 'dozer';
      case 'Loader': return 'loader';
      case 'Crane': return 'crane';
      case 'Truck': return 'truck';
      default: return 'excavator';
    }
  };

  // ============ MACHINE CRUD ============
  const addMachine = (machine: Machine) => {
    createMachineMutation.mutate({
      name: machine.name,
      brand: machine.brand,
      model: machine.model,
      year: parseInt(machine.year) || new Date().getFullYear(),
      machineType: mapMachineTypeToAPI(machine.type),
      serialNumber: machine.serialNumber,
      engineHours: machine.engineHours,
      locationLat: machine.location?.lat,
      locationLng: machine.location?.lng,
      locationAddress: machine.location?.address,
    }, {
      onSuccess: () => toast.success('Makine başarıyla eklendi'),
      onError: () => toast.error('Makine eklenirken hata oluştu'),
    });
  };

  const updateMachine = (updatedMachine: Machine) => {
    // Prepare update data - only include assignedOperatorId and checklistTemplateId if they have valid values or explicitly null
    const updateData: any = {
      name: updatedMachine.name,
      brand: updatedMachine.brand,
      model: updatedMachine.model,
      engineHours: updatedMachine.engineHours,
      status: updatedMachine.status, // Backend'e status değerini gönder
    };

    // Handle assignedOperatorId - send null to clear, valid UUID to set, or undefined to not change
    if (updatedMachine.assignedOperatorId === '' || updatedMachine.assignedOperatorId === undefined) {
      updateData.assignedOperatorId = null;
    } else {
      updateData.assignedOperatorId = updatedMachine.assignedOperatorId;
    }

    // Handle checklistTemplateId - send null to clear, valid UUID to set, or undefined to not change
    if (updatedMachine.assignedChecklistId === '' || updatedMachine.assignedChecklistId === undefined) {
      updateData.checklistTemplateId = null;
    } else {
      updateData.checklistTemplateId = updatedMachine.assignedChecklistId;
    }

    updateMachineMutation.mutate({
      id: updatedMachine.id,
      data: updateData
    }, {
      onSuccess: () => toast.success('Makine başarıyla güncellendi'),
      onError: () => toast.error('Makine güncellenirken hata oluştu'),
    });
  };

  const deleteMachine = (id: string) => {
    deleteMachineMutation.mutate(id, {
      onSuccess: () => toast.success('Makine başarıyla silindi'),
      onError: () => toast.error('Makine silinirken hata oluştu'),
    });
  };

  // ============ OPERATOR CRUD ============
  const addOperator = (operator: Operator) => {
    const nameParts = operator.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    createUserMutation.mutate({
      email: operator.email || `${firstName.toLowerCase()}@example.com`,
      password: 'TempPassword123!',
      firstName,
      lastName,
      role: 'operator',
      phone: operator.phone,
      licenses: operator.licenseType,
      specialties: operator.specialty,
    }, {
      onSuccess: () => toast.success('Operatör başarıyla eklendi'),
      onError: () => toast.error('Operatör eklenirken hata oluştu'),
    });
  };

  const updateOperator = (updatedOperator: Operator) => {
    const nameParts = updatedOperator.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    updateUserMutation.mutate({
      id: updatedOperator.id,
      data: {
        firstName,
        lastName,
        phone: updatedOperator.phone,
        licenses: updatedOperator.licenseType,
        specialties: updatedOperator.specialty,
      }
    }, {
      onSuccess: () => toast.success('Operatör başarıyla güncellendi'),
      onError: () => toast.error('Operatör güncellenirken hata oluştu'),
    });
  };

  const deleteOperator = (id: string) => {
    deleteUserMutation.mutate(id, {
      onSuccess: () => toast.success('Operatör başarıyla silindi'),
      onError: () => toast.error('Operatör silinirken hata oluştu'),
    });
  };

  // ============ JOB CRUD ============
  const addJob = (job: Job) => {
    createJobMutation.mutate({
      title: job.title,
      description: job.description,
      locationName: job.location,
      locationLat: job.coordinates?.lat,
      locationLng: job.coordinates?.lng,
      locationAddress: job.location,
      priority: job.priority,
      scheduledStart: job.startDate ? new Date(job.startDate).toISOString() : undefined,
      scheduledEnd: job.endDate ? new Date(job.endDate).toISOString() : undefined,
    }, {
      onSuccess: (createdJob) => {
        // If machines or operators were selected, assign them to the job
        const hasMachines = job.assignedMachineIds && job.assignedMachineIds.length > 0;
        const hasOperators = job.assignedOperatorIds && job.assignedOperatorIds.length > 0;

        if (hasMachines || hasOperators) {
          assignJobMutation.mutate({
            jobId: createdJob.id,
            machineIds: job.assignedMachineIds || [],
            operatorIds: job.assignedOperatorIds || [],
          }, {
            onSuccess: () => toast.success('İş başarıyla eklendi ve atamalar yapıldı'),
            onError: () => toast.error('İş eklendi fakat atama başarısız oldu'),
          });
        } else {
          toast.success('İş başarıyla eklendi');
        }
      },
      onError: () => toast.error('İş eklenirken hata oluştu'),
    });
  };

  const updateJob = (updatedJob: Job) => {
    updateJobMutation.mutate({
      id: updatedJob.id,
      data: {
        title: updatedJob.title,
        description: updatedJob.description,
        locationName: updatedJob.location,
        locationLat: updatedJob.coordinates?.lat,
        locationLng: updatedJob.coordinates?.lng,
        locationAddress: updatedJob.location,
        priority: updatedJob.priority,
        scheduledStart: updatedJob.startDate ? new Date(updatedJob.startDate).toISOString() : undefined,
        scheduledEnd: updatedJob.endDate ? new Date(updatedJob.endDate).toISOString() : undefined,
        progress: updatedJob.progress,
        status: mapFrontendStatusToAPI(updatedJob.status),
      }
    }, {
      onSuccess: () => {
        // Update machine and operator assignments if provided
        const hasMachines = updatedJob.assignedMachineIds !== undefined;
        const hasOperators = updatedJob.assignedOperatorIds !== undefined;

        if (hasMachines || hasOperators) {
          assignJobMutation.mutate({
            jobId: updatedJob.id,
            machineIds: updatedJob.assignedMachineIds || [],
            operatorIds: updatedJob.assignedOperatorIds || [],
          }, {
            onSuccess: () => toast.success('İş başarıyla güncellendi'),
            onError: () => toast.error('İş güncellendi fakat atama başarısız oldu'),
          });
        } else {
          toast.success('İş başarıyla güncellendi');
        }
      },
      onError: () => toast.error('İş güncellenirken hata oluştu'),
    });
  };

  const deleteJob = (id: string) => {
    deleteJobMutation.mutate(id, {
      onSuccess: () => toast.success('İş başarıyla silindi'),
      onError: () => toast.error('İş silinirken hata oluştu'),
    });
  };

  // ============ CHECKLIST TEMPLATE CRUD ============
  const addChecklistTemplate = (template: ChecklistTemplate) => {
    createTemplateMutation.mutate({
      name: template.name,
      machineTypes: [], // All machine types by default
      items: template.items.map((item, index) => ({
        label: item,
        type: 'boolean' as const,
        required: true,
      })),
    }, {
      onSuccess: () => toast.success('Şablon başarıyla eklendi'),
      onError: () => toast.error('Şablon eklenirken hata oluştu'),
    });
  };

  const updateChecklistTemplate = (updatedTemplate: ChecklistTemplate) => {
    updateTemplateMutation.mutate({
      id: updatedTemplate.id,
      data: {
        name: updatedTemplate.name,
        items: updatedTemplate.items.map((item, index) => ({
          label: item,
          type: 'boolean' as const,
          required: true,
        })),
      }
    }, {
      onSuccess: () => toast.success('Şablon başarıyla güncellendi'),
      onError: () => toast.error('Şablon güncellenirken hata oluştu'),
    });
  };

  const deleteChecklistTemplate = (id: string) => {
    deleteTemplateMutation.mutate(id, {
      onSuccess: () => toast.success('Şablon başarıyla silindi'),
      onError: () => toast.error('Şablon silinirken hata oluştu'),
    });
  };

  const handleApproval = (id: string, approved: boolean) => {
    // Use the mutation to call API
    reviewSubmissionMutation.mutate({
      id,
      data: { status: approved ? 'approved' : 'rejected' }
    }, {
      onSuccess: () => toast.success(approved ? 'Kontrol listesi onaylandı' : 'Kontrol listesi reddedildi'),
      onError: () => toast.error('İşlem sırasında hata oluştu'),
    });
  };

  const updateFirmDetails = (details: FirmDetails) => setFirmDetails(details);

  const t = DICTIONARY[language];

  // --- RENDER LOGIC ---

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-smart-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
      return <LandingPage t={t.landing} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard machines={machines} checklists={checklists} jobs={jobs} handleApproval={handleApproval} t={t.dashboard} />;
      case 'machines':
        return <MachineManagement machines={machines} addMachine={addMachine} updateMachine={updateMachine} deleteMachine={deleteMachine} operators={operators} checklistTemplates={checklistTemplates} t={t.machines} />;
      case 'operators':
        return <OperatorManagement operators={operators} addOperator={addOperator} updateOperator={updateOperator} deleteOperator={deleteOperator} t={t.operators} />;
      case 'jobs':
        return <JobManagement jobs={jobs} machines={machines} operators={operators} addJob={addJob} updateJob={updateJob} deleteJob={deleteJob} t={t.jobs} userRole={user?.role} currentUserId={user?.id} />;
      case 'checklists':
        return <ChecklistManagement templates={checklistTemplates} addTemplate={addChecklistTemplate} updateTemplate={updateChecklistTemplate} deleteTemplate={deleteChecklistTemplate} t={t.checklists} />;
      case 'approvals':
        return <ApprovalWorkflow checklists={checklists} machines={machines} handleApproval={handleApproval} t={t.approvals} />;
      case 'notifications':
        return <NotificationCenter isDarkMode={isDarkMode} language={language} />;
      case 'finance':
        return <FinanceModule invoices={invoices} machines={machines} firmDetails={firmDetails} t={t.finance} />;
      case 'settings':
        return <Settings firmDetails={firmDetails} updateFirmDetails={updateFirmDetails} isDarkMode={isDarkMode} toggleTheme={toggleTheme} language={language} setLanguage={setLanguage} t={t.settings} user={user} onUserUpdate={updateUser} />;
      default:
        return <div className="p-8 text-center text-gray-500"><h2 className="text-2xl font-bold">404</h2></div>;
    }
  };

  return (
    <div className="flex bg-gray-50 dark:bg-slate-900 min-h-screen font-sans transition-colors duration-300">
      <Sidebar
        currentView={currentView}
        setCurrentView={(view) => {
            if (view === 'logout') {
                handleLogout();
            } else if (view === 'mobile-sim') {
                setShowMobileSim(true);
            } else {
                setCurrentView(view);
            }
        }}
        firmName={firmDetails.name}
        firmPhone={firmDetails.phone}
        subscriptionPlan={t.machines.payAsYouGo}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        language={language}
        setLanguage={setLanguage}
        translations={t.sidebar}
        userName={user ? `${user.firstName} ${user.lastName}` : undefined}
        userRole={user?.role}
      />
      
      <main className="ml-64 flex-1">
        {renderContent()}
      </main>

      {showMobileSim && (
          <MobileAppSimulator 
            onClose={() => setShowMobileSim(false)} 
            machines={machines}
            templates={checklistTemplates}
            jobs={jobs}
            checklists={checklists}
            addMachine={addMachine}
            updateMachine={updateMachine}
            updateJob={updateJob}
            handleApproval={handleApproval}
          />
      )}
    </div>
  );
};

export default App;
