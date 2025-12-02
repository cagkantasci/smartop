
export enum MachineStatus {
  Active = 'Aktif',
  Maintenance = 'Bakımda',
  Idle = 'Boşta'
}

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
  type: 'Excavator' | 'Dozer' | 'Crane' | 'Loader' | 'Truck';
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
    table: {
      machine: string;
      serial: string;
      status: string;
      hours: string;
      location: string;
    }
  };
  machines: {
    title: string;
    subtitle: string;
    payAsYouGo: string;
    addMachine: string;
    searchPlaceholder: string;
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
    }
  };
  operators: {
    title: string;
    subtitle: string;
    addOperator: string;
    editOperator: string;
    form: {
      name: string;
      license: string;
      specialty: string;
      phone: string;
      email: string;
      save: string;
      cancel: string;
    }
  };
  jobs: {
    title: string;
    subtitle: string;
    addJob: string;
    status: {
      inProgress: string;
      delayed: string;
      completed: string;
    }
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
    }
  };
  approvals: {
    title: string;
    subtitle: string;
    empty: string;
    approve: string;
    reject: string;
    review: string;
    queue: string;
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
    table: {
      invoiceNo: string;
      date: string;
      desc: string;
      amount: string;
      status: string;
    }
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
    }
  };
}
