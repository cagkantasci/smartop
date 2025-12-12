
// Backend ile uyumlu değerler
export enum MachineStatus {
  Active = 'active',
  Idle = 'idle',
  Maintenance = 'maintenance',
  OutOfService = 'out_of_service'
}

// UI'da gösterim için Türkçe etiketler
export const MachineStatusLabels: Record<MachineStatus, string> = {
  [MachineStatus.Active]: 'Aktif',
  [MachineStatus.Idle]: 'Boşta',
  [MachineStatus.Maintenance]: 'Bakımda',
  [MachineStatus.OutOfService]: 'Servis Dışı'
};

export enum ChecklistStatus {
  Pending = 'Bekliyor',
  Approved = 'Onaylandı',
  Rejected = 'Reddedildi',
  Completed = 'Tamamlandı'
}

export enum SubscriptionTier {
  Starter = 'Başlangıç', // 1-5 Makin
  Pro = 'Profesyonel',   // 6-20 Makine
  Enterprise = 'Kurumsal' // 20+ Makine
}

export interface Operator {
  id: string;
  name: string;
  licenseType: string[]; // Changed to array
  avatar: string;
  phone?: string;
  email?: string;
  specialty: string[]; // Changed to array
}

export interface ChecklistTemplate {
  id: string;
  name: string; // e.g., "Günlük Ekskavatör Kontrolü"
  itemsCount: number;
  items: string[]; // List of checklist items
}

export interface Coordinates {
  lat: number;
  lng: number;
  address: string;
}

export interface ServiceRecord {
  id: string;
  date: string;
  type: 'Maintenance' | 'Repair' | 'Inspection';
  description: string;
  technician: string;
  cost: number;
}

export interface PartFault {
  partName: string; // e.g., "Hidrolik Pompa", "Palet"
  frequency: number;
}

export interface Machine {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: string;
  type: 'Excavator' | 'Dozer' | 'Crane' | 'Loader' | 'Truck' | 'Grader' | 'Roller' | 'Forklift' | 'Backhoe' | 'SkidSteer' | 'Telehandler' | 'Compactor' | 'Paver' | 'Trencher' | 'Drill' | 'Generator' | 'Compressor' | 'ConcreteEquipment' | 'Lift' | 'Trailer' | 'Scraper' | 'Other';
  serialNumber: string;
  status: MachineStatus;
  engineHours: number;
  lastService: string;
  imageUrl: string;
  assignedOperatorId?: string;
  assignedChecklistId?: string;
  location?: Coordinates;
  serviceHistory?: ServiceRecord[];
  commonFaults?: PartFault[];
}

export interface Job {
  id: string;
  title: string;
  location: string;
  description?: string;
  status: 'In Progress' | 'Completed' | 'Delayed' | 'Scheduled';
  progress: number; // 0-100
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedMachineIds: string[];
  assignedOperatorIds: string[];
  startDate: string;
  endDate?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ChecklistEntry {
  label: string;      // e.g. "Motor Yağı Seviyesi"
  isOk: boolean;      // true = OK, false = Sorun Var
  value?: string;     // e.g. "Normal", "Düşük", "120 PSI"
  photoUrl?: string;  // Sorun varsa fotoğraf
}

export interface ChecklistItem {
  id: string;
  machineId: string;
  operatorName: string;
  date: string;
  status: ChecklistStatus;
  issues: string[];
  notes: string;
  entries?: ChecklistEntry[]; // Detaylı kontrol listesi maddeleri
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  description: string;
  items: string[];
}

export interface MetricData {
  name: string;
  value: number;
}

export interface FirmDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  taxNo: string;
  taxOffice: string;
}

export type Language = 'tr' | 'en';

export interface TranslationDictionary {
  sidebar: {
    dashboard: string;
    machines: string;
    operators: string;
    jobs: string;
    checklists: string;
    approvals: string;
    notifications?: string;
    finance: string;
    settings: string;
    firmInfo: string;
    managerPortal: string;
    logout: string;
    darkMode: string;
    lightMode: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    totalEngineHours: string;
    pendingApprovals: string;
    activeMachines: string;
    avgUsage: string;
    weeklyHours: string;
    fleetStatus: string;
    activeJobs: string;
    viewAll: string;
    assignedMachines: string;
    allFleetAverage: string;
    table: {
      machine: string;
      serial: string;
      status: string;
      hours: string;
      location: string;
      projectName: string;
      progress: string;
      assignedMachine: string;
    };
    stats: {
      active: string;
      maintenance: string;
      idle: string;
      hours: string;
    };
    days: {
      mon: string;
      tue: string;
      wed: string;
      thu: string;
      fri: string;
      sat: string;
      sun: string;
    };
    unknown: string;
    backToList: string;
    lastMaintenance: string;
    operator: string;
    commonFaults: string;
    serviceRecords: string;
    liveMap: string;
    machines: string;
    operators: string;
    jobPoints: string;
    noServiceHistory: string;
    machinesAssigned: string;
    inProgress: string;
    delayed: string;
    completed: string;
  };
  landing: {
    nav: {
      features: string;
      calculator: string;
      pricing: string;
      portalLogin: string;
    };
    hero: {
      badge: string;
      title: string;
      titleHighlight: string;
      subtitle: string;
      startFree: string;
      requestDemo: string;
    };
    roi: {
      title: string;
      subtitle: string;
      machineCount: string;
      estimatedSavings: string;
      benefits: {
        speed: { title: string; desc: string };
        security: { title: string; desc: string };
        analysis: { title: string; desc: string };
        mobile: { title: string; desc: string };
      };
    };
    features: {
      title: string;
      subtitle: string;
      remoteTracking: { title: string; desc: string };
      digitalApproval: { title: string; desc: string };
      advancedReporting: { title: string; desc: string };
    };
    cta: {
      title: string;
      subtitle: string;
      button: string;
    };
    footer: {
      privacy: string;
      terms: string;
      support: string;
      copyright: string;
    };
    auth: {
      login: string;
      register: string;
      forgotPassword: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      rememberMe: string;
      forgotPasswordLink: string;
      loginButton: string;
      loggingIn: string;
      or: string;
      googleLogin: string;
      noAccount: string;
      registerLink: string;
      companyName: string;
      companyPlaceholder: string;
      firstName: string;
      firstNamePlaceholder: string;
      lastName: string;
      lastNamePlaceholder: string;
      passwordMinLength: string;
      confirmPassword: string;
      confirmPasswordPlaceholder: string;
      registering: string;
      registerButton: string;
      hasAccount: string;
      loginLink: string;
      forgotPasswordDesc: string;
      sending: string;
      sendResetLink: string;
      backToLogin: string;
      errors: {
        loginFailed: string;
        passwordMismatch: string;
        passwordTooShort: string;
        registerFailed: string;
        emailRequired: string;
        googleSoon: string;
      };
      success: {
        registerSuccess: string;
        resetLinkSent: string;
      };
    };
  };
  machines: {
    title: string;
    subtitle: string;
    payAsYouGo: string;
    addMachine: string;
    searchPlaceholder: string;
    subscription: {
      title: string;
      payAsYouGo: string;
      basePrice: string;
      perMachine: string;
      machinesInCart: string;
      totalMachines: string;
      discount: string;
      discountEarned: string;
      monthlyTotal: string;
      savingsInfo: string;
      savingsInfo2: string;
      or: string;
      activeMachines: string;
      twoFactorEnabled: string;
    };
    operations: {
      title: string;
      quickAssign: string;
      workArea: string;
      noAssignment: string;
      assignedOperator: string;
      assignedChecklist: string;
    };
    stats: {
      engineHours: string;
      lastMaintenance: string;
      hours: string;
      daysAgo: string;
    };
    filters: {
      all: string;
      active: string;
      maintenance: string;
      idle: string;
    };
    actions: {
      noList: string;
      editAll: string;
      edit: string;
      viewDetails: string;
    };
    cart: {
      title: string;
      confirm: string;
      total: string;
      empty: string;
    };
    modal: {
      title: string;
      smartFill: string;
      cancel: string;
      add: string;
      selectType: string;
      technicalDetails: string;
      searchBrandModel: string;
      machineName: string;
      brand: string;
      model: string;
      serialNumber: string;
      licensePlate: string;
      year: string;
      engineHours: string;
      fuelType: string;
      fuelCapacity: string;
      operator: string;
      checklist: string;
      selectOperator: string;
      selectChecklist: string;
      editMachine: string;
      status: string;
      delete: string;
      save: string;
      close: string;
      noOperator: string;
      noChecklist: string;
      operationalAssignments: string;
      operatorSelection: string;
      checklistSelection: string;
      notAssigned: string;
      imageUrl: string;
      changeImage: string;
      findDifferentImage: string;
      generateRandom: string;
      fetchingData: string;
      resultsFound: string;
      modelBrandCategory: string;
      searchPlaceholder: string;
      searchHint: string;
      search: string;
      deleteConfirm: string;
      confirmDelete: string;
    };
    types: {
      excavator: string;
      dozer: string;
      crane: string;
      loader: string;
      truck: string;
      grader: string;
      roller: string;
      forklift: string;
      backhoe: string;
      skidSteer: string;
      telehandler: string;
      compactor: string;
      paver: string;
      trencher: string;
      drill: string;
      generator: string;
      compressor: string;
      concreteEquipment: string;
      lift: string;
      trailer: string;
      scraper: string;
      other: string;
    };
  };
  operators: {
    title: string;
    subtitle: string;
    addOperator: string;
    editOperator: string;
    searchPlaceholder: string;
    deleteButton: string;
    noSpecialty: string;
    licenses: string;
    multiSelect: string;
    deleteConfirmTitle: string;
    deleteWarning: string;
    confirmDelete: string;
    form: {
      name: string;
      license: string;
      specialty: string;
      phone: string;
      email: string;
      save: string;
      cancel: string;
    };
  };
  jobs: {
    title: string;
    subtitle: string;
    addJob: string;
    mapView: string;
    listView: string;
    searchPlaceholder: string;
    filters: string;
    clearFilters: string;
    noJobsFound: string;
    progressStatus: string;
    assignedMachines: string;
    assignedOperators: string;
    noOperatorsAssigned: string;
    startDate: string;
    details: string;
    detailsView: string;
    edit: string;
    delete: string;
    filterLabels: {
      status: string;
      priority: string;
      all: string;
    };
    status: {
      inProgress: string;
      delayed: string;
      completed: string;
      scheduled: string;
    };
    priority: {
      low: string;
      medium: string;
      high: string;
      urgent: string;
    };
    modal: {
      addTitle: string;
      editTitle: string;
      jobName: string;
      location: string;
      description: string;
      startDate: string;
      endDate: string;
      status: string;
      priority: string;
      progress: string;
      assignMachines: string;
      assignOperators: string;
      cancel: string;
      save: string;
      close: string;
      coordinates: string;
      selectStatus: string;
      selectPriority: string;
      required: string;
    };
    resultsFound: string;
    searchFor: string;
    jobAndMachineLocations: string;
    jobs: string;
    idleMachines: string;
    noResults: string;
    noOperator: string;
    noMachinesAssigned: string;
    jobTitle: string;
    jobTitlePlaceholder: string;
    descriptionPlaceholder: string;
    locationLabel: string;
    locationPlaceholder: string;
    noMachinesAdded: string;
    noOperatorsAdded: string;
    endLabel: string;
    noLocationInfo: string;
    noCoordinates: string;
    openGoogleMaps: string;
    deleteConfirmTitle: string;
    deleteWarning: string;
    confirmDelete: string;
    descriptionLabel: string;
    latitude: string;
    longitude: string;
    startDateLabel: string;
    endDateLabel: string;
    statusLabel: string;
    priorityLabel: string;
    progressLabel: string;
    assignMachineLabel: string;
    assignOperatorLabel: string;
    noLicenseInfo: string;
    noMachineAssigned: string;
    dates: string;
    coordinatesLabel: string;
    clickMapToSelect: string;
    engineHour: string;
    saving: string;
    machineStatus: {
      active: string;
      maintenance: string;
      idle: string;
    };
  };
  checklists: {
    title: string;
    subtitle: string;
    addTemplate: string;
    itemsCount: string;
    modal: {
      titleNew: string;
      titleEdit: string;
      nameLabel: string;
      itemsLabel: string;
      save: string;
      cancel: string;
      namePlaceholder: string;
      itemPlaceholder: string;
    };
  };
  approvals: {
    title: string;
    subtitle: string;
    empty: string;
    approve: string;
    reject: string;
    review: string;
    queue: string;
    reportedIssues: string;
    allSystemsNormal: string;
    checklistDetail: string;
    machine: string;
    checklistItems: string;
    issueReported: string;
    operatorPhoto: string;
    noDetailData: string;
    operatorNote: string;
  };
  finance: {
    title: string;
    subtitle: string;
    downloadStatement: string;
    currentMonth: string;
    nextBilling: string;
    discountStatus: string;
    paymentMethod: string;
    invoiceHistory: string;
    activeMachine: string;
    autoDebit: string;
    discountActive: string;
    discountStandard: string;
    volumeDiscount: string;
    earnDiscount: string;
    updateCard: string;
    downloadPDF: string;
    table: {
      invoiceNo: string;
      date: string;
      desc: string;
      amount: string;
      status: string;
    };
    statuses: {
      paid: string;
      pending: string;
      overdue: string;
    };
    paymentMethods: {
      creditCard: string;
      autoMonthly: string;
      marketplace: string;
      marketplaceDesc: string;
      linkedAccount: string;
      bankTransfer: string;
      manualTransfer: string;
    };
    modal: {
      updateCard: string;
      cardNumber: string;
      expiry: string;
      cvv: string;
      cardName: string;
      cancel: string;
      save: string;
    };
    bankInfo: {
      title: string;
      bank: string;
      accountName: string;
      iban: string;
      note: string;
    };
    marketplaceInfo: {
      title: string;
      description: string;
      note: string;
    };
    print: {
      accountStatement: string;
      company: string;
      address: string;
      phone: string;
      date: string;
      monthlyAmount: string;
      total: string;
      documentCreatedAt: string;
      sender: string;
      recipient: string;
      description: string;
      period: string;
      electronicInvoice: string;
      cardUpdated: string;
      notSpecified: string;
    };
  };
  settings: {
    title: string;
    subtitle: string;
    tabs: {
      profile: string;
      company: string;
      notifications: string;
      security: string;
    };
    save: string;
    saved: string;
    labels: {
      fullName: string;
      title: string;
      email: string;
      language: string;
      theme: string;
      firmName: string;
      taxNo: string;
      taxOffice: string;
      phone: string;
      address: string;
      profilePhoto: string;
      profilePhotoHint: string;
      appPreferences: string;
      darkMode: string;
      lightMode: string;
      companyInfoImportant: string;
      companyInfoDesc: string;
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
      accountSecurity: string;
      securityHint: string;
      twoFactor: string;
      twoFactorDesc: string;
      activate: string;
    };
    notifications: {
      emailAlerts: string;
      emailAlertsDesc: string;
      pushNotifications: string;
      pushDesc: string;
      maintenanceAlerts: string;
      maintenanceDesc: string;
      weeklyReport: string;
      weeklyReportDesc: string;
      marketing: string;
      marketingDesc: string;
    };
  };
}
