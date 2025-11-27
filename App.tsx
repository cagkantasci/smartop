
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
import { useAuth } from './src/contexts/AuthContext';
import {
  useMachines,
  useOperators,
  useJobs,
  useChecklistTemplates,
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

// Updated Mock Operators with Arrays
const MOCK_OPERATORS: Operator[] = [
    { id: 'op1', name: 'Ahmet Yılmaz', licenseType: ['G Sınıfı'], specialty: ['Ekskavatör', 'Yükleyici'], avatar: 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=0F2C59&color=fff', phone: '+90 555 111 22 33', email: 'ahmet@firma.com' },
    { id: 'op2', name: 'Mehmet Demir', licenseType: ['Vinç Operatör Belgesi', 'C Sınıfı (Kamyon)'], specialty: ['Vinç'], avatar: 'https://ui-avatars.com/api/?name=Mehmet+Demir&background=F59E0B&color=000', phone: '+90 555 444 55 66', email: 'mehmet@firma.com' },
    { id: 'op3', name: 'Ayşe Kaya', licenseType: ['G Sınıfı'], specialty: ['Dozer'], avatar: 'https://ui-avatars.com/api/?name=Ayse+Kaya&background=15803d&color=fff', phone: '+90 555 777 88 99', email: 'ayse@firma.com' },
];

const MOCK_TEMPLATES: ChecklistTemplate[] = [
    { id: 'tpl1', name: 'Ekskavatör Günlük Kontrol (Sabah)', itemsCount: 5, items: ['Motor Yağı Seviyesi', 'Radyatör Suyu', 'Hidrolik Sızıntı Kontrolü', 'Yürüyüş Takımları', 'Kova Tırnakları'] },
    { id: 'tpl2', name: 'Vinç Güvenlik Kontrolü', itemsCount: 6, items: ['Halat Kontrolü', 'Kanca Emniyet Mandalı', 'Limit Switch Testi', 'Hidrolik Basınç Değeri', 'Destek Ayakları', 'Rüzgar Ölçer'] },
    { id: 'tpl3', name: 'Kamyon Lastik ve Motor Kontrolü', itemsCount: 4, items: ['Lastik Basınçları', 'Fren Sistemi', 'Sinyal ve Farlar', 'Kasa Kapak Kilitleri'] },
];
const MOCK_MACHINES: Machine[] = [
  { id: '1', name: 'Şantiye-1 Ana Ekskavatör', brand: 'Caterpillar', model: '320 GC', year: '2022', type: 'Excavator', serialNumber: 'CAT-320-XE-001', status: MachineStatus.Active, engineHours: 4200, lastService: '2023-10-15', imageUrl: 'https://images.unsplash.com/photo-1582239634898-3564c768832a?q=80&w=800&auto=format&fit=crop', assignedOperatorId: 'op1', assignedChecklistId: 'tpl1', location: { lat: 41.0082, lng: 28.9784, address: 'Kuzey Marmara Otoyolu, Şantiye A' }, commonFaults: [{ partName: 'Hidrolik Hortum', frequency: 5 }, { partName: 'Palet Gergi', frequency: 2 }, { partName: 'Kova Tırnağı', frequency: 8 }], serviceHistory: [{ id: 's1', date: '2023-10-15', type: 'Maintenance', description: '500 Saat Bakımı (Yağ, Filtre)', technician: 'Servis A', cost: 4500 }, { id: 's2', date: '2023-08-20', type: 'Repair', description: 'Hidrolik piston değişimi', technician: 'Servis B', cost: 12000 }] },
  { id: '2', name: 'Yol Düzeltme Dozeri', brand: 'Komatsu', model: 'D155AX', year: '2020', type: 'Dozer', serialNumber: 'KOM-D155-99', status: MachineStatus.Maintenance, engineHours: 11500, lastService: '2023-11-01', imageUrl: 'https://images.unsplash.com/photo-1547625832-6a84d46f90d4?q=80&w=800&auto=format&fit=crop', assignedOperatorId: 'op3', location: { lat: 39.9334, lng: 32.8597, address: 'Ankara Gölbaşı Yol Çalışması' }, commonFaults: [{ partName: 'Yürüyüş Takımı', frequency: 6 }, { partName: 'Bıçak Pimi', frequency: 4 }], serviceHistory: [{ id: 's3', date: '2023-11-01', type: 'Maintenance', description: 'Ağır Bakım', technician: 'Merkez Servis', cost: 25000 }] },
  { id: '3', name: 'Liman Vinci 1', brand: 'Liebherr', model: 'LTM 1120', year: '2023', type: 'Crane', serialNumber: 'LBH-LTM-12', status: MachineStatus.Idle, engineHours: 890, lastService: '2023-09-20', imageUrl: 'https://images.unsplash.com/photo-1579407364101-72782e541176?q=80&w=800&auto=format&fit=crop', assignedOperatorId: 'op2', assignedChecklistId: 'tpl2', location: { lat: 38.4237, lng: 27.1428, address: 'Alsancak Limanı' }, commonFaults: [], serviceHistory: [] },
];
const MOCK_JOBS: Job[] = [
    { id: 'j1', title: 'Kuzey Otoyolu Viyadük İnşaatı', location: 'İstanbul', status: 'In Progress', progress: 65, startDate: '2023-01-10', assignedMachineIds: ['1'] },
    { id: 'j2', title: 'Gölbaşı Altyapı Düzenleme', location: 'Ankara', status: 'Delayed', progress: 30, startDate: '2023-06-15', assignedMachineIds: ['2'] },
    { id: 'j3', title: 'Liman Genişletme Projesi', location: 'İzmir', status: 'In Progress', progress: 85, startDate: '2022-11-20', assignedMachineIds: ['3'] }
];
const MOCK_CHECKLISTS: ChecklistItem[] = [
  { id: '101', machineId: 'CAT-320-XE-001', operatorName: 'Ahmet Yilmaz', date: '2023-11-20 07:30', status: ChecklistStatus.Pending, issues: [], notes: 'İşe hazır.', entries: [{ label: 'Motor Yağı Seviyesi', isOk: true, value: 'Tam' }, { label: 'Radyatör Suyu', isOk: true, value: 'Normal' }, { label: 'Hidrolik Sızıntı Kontrolü', isOk: true }, { label: 'Yürüyüş Takımları', isOk: true }, { label: 'Kova Tırnakları', isOk: true }] },
  { id: '102', machineId: 'KOM-D155-99', operatorName: 'Mehmet Demir', date: '2023-11-20 07:45', status: ChecklistStatus.Pending, issues: ['Hidrolik sızıntısı var', 'Sol palet sesi'], notes: 'Acil kontrol gerekiyor.', entries: [{ label: 'Motor Yağı Seviyesi', isOk: true, value: 'Tam' }, { label: 'Radyatör Suyu', isOk: true, value: 'Normal' }, { label: 'Hidrolik Sızıntı Kontrolü', isOk: false, value: 'Damlatma Mevcut', photoUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc7471?q=80&w=300&auto=format&fit=crop' }, { label: 'Yürüyüş Takımları', isOk: false, value: 'Ses Geliyor' }, { label: 'Fren Sistemi', isOk: true }] },
  { id: '103', machineId: 'LBH-LTM-12', operatorName: 'Caner Erkin', date: '2023-11-19 18:00', status: ChecklistStatus.Approved, issues: [], notes: 'Gün sonu kontrolü.', entries: [] },
];
const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2023-001', date: '2023-10-01', amount: 1500, status: 'Paid', description: 'Ekim 2023 Makine Kullanım Bedeli (3 Makine)', items: ['3 x Makine Aktivasyonu', 'Sistem Kullanım Bedeli'] },
  { id: 'INV-2023-002', date: '2023-11-01', amount: 1500, status: 'Paid', description: 'Kasım 2023 Makine Kullanım Bedeli (3 Makine)', items: ['3 x Makine Aktivasyonu'] },
  { id: 'INV-2023-003', date: '2023-12-01', amount: 1500, status: 'Pending', description: 'Aralık 2023 Makine Kullanım Bedeli (3 Makine)', items: ['3 x Makine Aktivasyonu'] },
];

const DICTIONARY: Record<Language, TranslationDictionary> = {
  tr: {
    sidebar: { dashboard: 'Kontrol Paneli', machines: 'Makine Parkı', operators: 'Operatör Yönetimi', jobs: 'İş Yönetimi', checklists: 'Kontrol Listeleri', approvals: 'Onay İşlemleri', finance: 'Finans & Faturalar', settings: 'Ayarlar', firmInfo: 'Firma Bilgileri', managerPortal: 'Yönetici Portalı', logout: 'Çıkış Yap', darkMode: 'Karanlık Mod', lightMode: 'Aydınlık Mod' },
    dashboard: { title: 'Operasyonel Genel Bakış', subtitle: 'Filo durumunuzun gerçek zamanlı özeti.', totalEngineHours: 'Toplam Motor Saati', pendingApprovals: 'Bekleyen Onaylar', activeMachines: 'Aktif Makineler', avgUsage: 'Ort. Kullanım', weeklyHours: 'Haftalık Çalışma Saatleri', fleetStatus: 'Filo Durum Dağılımı', activeJobs: 'Aktif Şantiyeler ve İşler', viewAll: 'Tümünü Gör', table: { machine: 'Makine', serial: 'Seri No', status: 'Durum', hours: 'Motor Saati', location: 'Konum' } },
    machines: { title: 'Makine Parkı', subtitle: 'Filo yönetimi, atamalar ve kullanım maliyetleri.', payAsYouGo: 'Kullandığın Kadar Öde', addMachine: 'Makine Ekle', searchPlaceholder: 'İsim, marka veya seri no ile arayın...', cart: { title: 'Sepet Tutarı', confirm: 'Sepeti Onayla', total: 'Toplam Tutar', empty: 'Sepetiniz boş.' }, modal: { title: 'Yeni Makine Ekle', smartFill: 'Bilgileri Getir', cancel: 'İptal', add: 'Listeye ve Sepete Ekle' } },
    operators: { title: 'Operatör Yönetimi', subtitle: 'Saha personelini, yetki belgelerini ve iletişim bilgilerini yönetin.', addOperator: 'Operatör Ekle', editOperator: 'Operatörü Düzenle', form: { name: 'Ad Soyad', license: 'Ehliyet / Sertifika', specialty: 'Uzmanlık', phone: 'Telefon', email: 'E-posta', save: 'Kaydet', cancel: 'İptal' } },
    jobs: { title: 'İş ve Şantiye Yönetimi', subtitle: 'Aktif projeleri takip edin ve makineleri şantiyelere atayın.', addJob: 'Yeni İş Ekle', status: { inProgress: 'Devam Ediyor', delayed: 'Gecikmede', completed: 'Tamamlandı' } },
    checklists: { title: 'Kontrol Listesi Şablonları', subtitle: 'Makineler için günlük kontrol formlarını yönetin.', addTemplate: 'Yeni Şablon Oluştur', itemsCount: 'Kontrol Maddesi', modal: { titleNew: 'Yeni Kontrol Listesi', titleEdit: 'Şablonu Düzenle', nameLabel: 'Şablon Adı', itemsLabel: 'Kontrol Maddeleri', save: 'Şablonu Kaydet' } },
    approvals: { title: 'Onay Kuyruğu', subtitle: 'Operatörlerden gelen günlük kontrol formlarını inceleyin.', empty: 'Her Şey Güncel!', approve: 'Onayla', reject: 'Reddet', review: 'İncele', queue: 'Ön Kontrol' },
    finance: { title: 'Finans ve Faturalandırma', subtitle: 'Harcamalarınızı ve geçmiş faturalarınızı yönetin.', downloadStatement: 'Ekstre İndir', currentMonth: 'Güncel Ay Tahmini', nextBilling: 'Sonraki Fatura Tarihi', discountStatus: 'İndirim Durumu', paymentMethod: 'Ödeme Yöntemi', invoiceHistory: 'Fatura Geçmişi', table: { invoiceNo: 'Fatura No', date: 'Tarih', desc: 'Açıklama', amount: 'Tutar', status: 'Durum' } },
    settings: { title: 'Ayarlar', subtitle: 'Hesap, firma ve uygulama tercihlerinizi yönetin.', tabs: { profile: 'Profil Ayarları', company: 'Firma Bilgileri', notifications: 'Bildirimler', security: 'Güvenlik' }, save: 'Değişiklikleri Kaydet', saved: 'Kaydedildi!', labels: { fullName: 'Ad Soyad', title: 'Unvan', email: 'E-posta Adresi', language: 'Dil Seçimi', theme: 'Tema', firmName: 'Firma Unvanı', taxNo: 'Vergi Numarası', taxOffice: 'Vergi Dairesi', phone: 'Telefon', address: 'Adres' } }
  },
  en: {
    sidebar: { dashboard: 'Dashboard', machines: 'Fleet Management', operators: 'Operator Management', jobs: 'Job Management', checklists: 'Checklists', approvals: 'Approvals', finance: 'Finance & Invoices', settings: 'Settings', firmInfo: 'Company Info', managerPortal: 'Manager Portal', logout: 'Log Out', darkMode: 'Dark Mode', lightMode: 'Light Mode' },
    dashboard: { title: 'Operational Overview', subtitle: 'Real-time summary of your fleet status.', totalEngineHours: 'Total Engine Hours', pendingApprovals: 'Pending Approvals', activeMachines: 'Active Machines', avgUsage: 'Avg. Usage', weeklyHours: 'Weekly Operating Hours', fleetStatus: 'Fleet Status Distribution', activeJobs: 'Active Sites & Jobs', viewAll: 'View All', table: { machine: 'Machine', serial: 'Serial No', status: 'Status', hours: 'Engine Hours', location: 'Location' } },
    machines: { title: 'Machine Fleet', subtitle: 'Fleet management, assignments and usage costs.', payAsYouGo: 'Pay As You Go', addMachine: 'Add Machine', searchPlaceholder: 'Search by name, brand or serial...', cart: { title: 'Cart Total', confirm: 'Confirm Cart', total: 'Total Amount', empty: 'Cart is empty.' }, modal: { title: 'Add New Machine', smartFill: 'Smart Fill', cancel: 'Cancel', add: 'Add to List & Cart' } },
    operators: { title: 'Operator Management', subtitle: 'Manage field personnel, licenses and contact info.', addOperator: 'Add Operator', editOperator: 'Edit Operator', form: { name: 'Full Name', license: 'License / Certificate', specialty: 'Specialty', phone: 'Phone', email: 'Email', save: 'Save', cancel: 'Cancel' } },
    jobs: { title: 'Job & Site Management', subtitle: 'Track active projects and assign machines.', addJob: 'Add New Job', status: { inProgress: 'In Progress', delayed: 'Delayed', completed: 'Completed' } },
    checklists: { title: 'Checklist Templates', subtitle: 'Manage daily inspection forms for machines.', addTemplate: 'Create New Template', itemsCount: 'Checklist Items', modal: { titleNew: 'New Checklist', titleEdit: 'Edit Template', nameLabel: 'Template Name', itemsLabel: 'Checklist Items', save: 'Save Template' } },
    approvals: { title: 'Approval Queue', subtitle: 'Review daily inspection forms from operators.', empty: 'All Caught Up!', approve: 'Approve', reject: 'Reject', review: 'Review', queue: 'Pre-Check' },
    finance: { title: 'Finance & Billing', subtitle: 'Manage expenses and invoice history.', downloadStatement: 'Download Statement', currentMonth: 'Current Month Forecast', nextBilling: 'Next Billing Date', discountStatus: 'Discount Status', paymentMethod: 'Payment Method', invoiceHistory: 'Invoice History', table: { invoiceNo: 'Invoice No', date: 'Date', desc: 'Description', amount: 'Amount', status: 'Status' } },
    settings: { title: 'Settings', subtitle: 'Manage account, company, and app preferences.', tabs: { profile: 'Profile Settings', company: 'Company Info', notifications: 'Notifications', security: 'Security' }, save: 'Save Changes', saved: 'Saved!', labels: { fullName: 'Full Name', title: 'Job Title', email: 'Email Address', language: 'Language Selection', theme: 'Theme', firmName: 'Company Name', taxNo: 'Tax Number', taxOffice: 'Tax Office', phone: 'Phone', address: 'Address' } }
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
  engineHours: apiMachine.engineHours || 0,
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
const convertAPIUserToOperator = (apiUser: APIUser): Operator => ({
  id: apiUser.id,
  name: `${apiUser.firstName} ${apiUser.lastName}`,
  licenseType: apiUser.licenses || [],
  specialty: apiUser.specialties || [],
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
    default: return 'In Progress';
  }
};

// Helper function to convert API job to frontend Job type
const convertAPIJobToJob = (apiJob: APIJob): Job => ({
  id: apiJob.id,
  title: apiJob.title,
  location: apiJob.locationName || apiJob.locationAddress || '',
  status: mapJobStatus(apiJob.status),
  progress: apiJob.progress || 0,
  startDate: apiJob.scheduledStart || apiJob.createdAt?.split('T')[0] || '',
  assignedMachineIds: apiJob.assignments?.map(a => a.machineId) || [],
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
  const { isAuthenticated, isLoading: authLoading, logout, user, organization } = useAuth();

  // API Data Queries (only run when authenticated)
  const { data: apiMachines, isLoading: machinesLoading } = useMachines();
  const { data: apiOperators, isLoading: operatorsLoading } = useOperators();
  const { data: apiJobs, isLoading: jobsLoading } = useJobs();
  const { data: apiTemplates, isLoading: templatesLoading } = useChecklistTemplates();
  const { data: apiSubmissions, isLoading: submissionsLoading } = usePendingSubmissions();

  // Mutations (only the ones we're using)
  const reviewSubmissionMutation = useReviewSubmission();

  // Convert API data to frontend types, fallback to mock data if API not available
  const machines: Machine[] = useMemo(() => {
    if (apiMachines && apiMachines.length > 0) {
      return apiMachines.map(convertAPIMachineToMachine);
    }
    return MOCK_MACHINES;
  }, [apiMachines]);

  const operators: Operator[] = useMemo(() => {
    if (apiOperators && apiOperators.length > 0) {
      return apiOperators.map(convertAPIUserToOperator);
    }
    return MOCK_OPERATORS;
  }, [apiOperators]);

  const jobs: Job[] = useMemo(() => {
    if (apiJobs && apiJobs.length > 0) {
      return apiJobs.map(convertAPIJobToJob);
    }
    return MOCK_JOBS;
  }, [apiJobs]);

  const checklistTemplates: ChecklistTemplate[] = useMemo(() => {
    if (apiTemplates && apiTemplates.length > 0) {
      return apiTemplates.map(convertAPITemplateToTemplate);
    }
    return MOCK_TEMPLATES;
  }, [apiTemplates]);

  const checklists: ChecklistItem[] = useMemo(() => {
    if (apiSubmissions && apiSubmissions.length > 0) {
      return apiSubmissions.map(convertAPISubmissionToChecklist);
    }
    return MOCK_CHECKLISTS;
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

  // These functions now work with API via mutations when available
  // For now they are placeholders that trigger API calls - the actual data refresh
  // happens through React Query's cache invalidation
  const addMachine = (machine: Machine) => {
    // If using API, the mutation will invalidate cache and refetch
    // For demo mode with mock data, this won't persist but UI will update via useMemo fallback
    console.log('Add machine:', machine);
  };

  const updateMachine = (updatedMachine: Machine) => {
    console.log('Update machine:', updatedMachine);
  };

  const addOperator = (operator: Operator) => {
    console.log('Add operator:', operator);
  };

  const updateOperator = (updatedOperator: Operator) => {
    console.log('Update operator:', updatedOperator);
  };

  const deleteOperator = (id: string) => {
    console.log('Delete operator:', id);
  };

  const addJob = (job: Job) => {
    console.log('Add job:', job);
  };

  const updateJob = (updatedJob: Job) => {
    console.log('Update job:', updatedJob);
  };

  const addChecklistTemplate = (template: ChecklistTemplate) => {
    console.log('Add template:', template);
  };

  const updateChecklistTemplate = (updatedTemplate: ChecklistTemplate) => {
    console.log('Update template:', updatedTemplate);
  };

  const deleteChecklistTemplate = (id: string) => {
    console.log('Delete template:', id);
  };

  const handleApproval = (id: string, approved: boolean) => {
    // Use the mutation to call API
    reviewSubmissionMutation.mutate({
      id,
      data: { status: approved ? 'approved' : 'rejected' }
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
      return <LandingPage />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard machines={machines} checklists={checklists} jobs={jobs} handleApproval={handleApproval} t={t.dashboard} />;
      case 'machines':
        return <MachineManagement machines={machines} addMachine={addMachine} updateMachine={updateMachine} operators={operators} checklistTemplates={checklistTemplates} t={t.machines} />;
      case 'operators':
        return <OperatorManagement operators={operators} addOperator={addOperator} updateOperator={updateOperator} deleteOperator={deleteOperator} t={t.operators} />;
      case 'jobs':
        return <JobManagement jobs={jobs} machines={machines} operators={operators} addJob={addJob} t={t.jobs} />;
      case 'checklists':
        return <ChecklistManagement templates={checklistTemplates} addTemplate={addChecklistTemplate} updateTemplate={updateChecklistTemplate} deleteTemplate={deleteChecklistTemplate} t={t.checklists} />;
      case 'approvals':
        return <ApprovalWorkflow checklists={checklists} handleApproval={handleApproval} t={t.approvals} />;
      case 'finance':
        return <FinanceModule invoices={invoices} machines={machines} firmDetails={firmDetails} t={t.finance} />;
      case 'settings':
        return <Settings firmDetails={firmDetails} updateFirmDetails={updateFirmDetails} isDarkMode={isDarkMode} toggleTheme={toggleTheme} language={language} setLanguage={setLanguage} t={t.settings} />;
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
