// User Types
export type UserRole = 'admin' | 'manager' | 'operator';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  phone?: string;
  avatarUrl?: string;
  jobTitle?: string;
  licenses?: string[];
  specialties?: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

// Machine Types
export type MachineStatus = 'active' | 'idle' | 'maintenance' | 'out_of_service';
export type MachineType = 'excavator' | 'dozer' | 'crane' | 'loader' | 'truck' | 'grader' | 'roller' | 'other';

export interface Machine {
  id: string;
  name: string;
  brand: string;
  model: string;
  machineType: MachineType;
  status: MachineStatus;
  serialNumber?: string;
  licensePlate?: string;
  plateNumber: string;
  year?: number;
  engineHours: number;
  operatorHours?: number;
  imageUrl?: string;
  locationLat?: number;
  locationLng?: number;
  assignedOperatorId?: string;
  checklistTemplateId?: string;
  checklistTemplate?: {
    id: string;
    name: string;
  };
}

// Checklist Types
export type ChecklistStatus = 'pending' | 'approved' | 'rejected';

export interface ChecklistItem {
  id: string;
  label: string;
  type: 'boolean' | 'text' | 'number' | 'photo';
  required: boolean;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  machineTypes: MachineType[];
  items: ChecklistItem[];
  isActive: boolean;
}

export interface ChecklistEntry {
  itemId: string;
  label: string;
  isOk: boolean;
  value?: string;
  photoUrl?: string;
}

export interface ChecklistSubmission {
  id: string;
  machineId: string;
  machineName: string;
  templateId: string;
  templateName: string;
  operatorId: string;
  operatorName: string;
  status: ChecklistStatus;
  entries: ChecklistEntry[];
  issuesCount: number;
  notes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

// Job Types
export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface JobAssignment {
  id: string;
  jobId: string;
  machineId?: string;
  operatorId?: string;
  machine?: {
    id: string;
    name: string;
    machineType?: MachineType;
  };
  operator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  status: JobStatus;
  priority: JobPriority;
  progress: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  machines?: Machine[];
  operators?: User[];
  jobAssignments?: JobAssignment[];
}

// Alert Types
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'machine_fault' | 'checklist_issue' | 'job_delay' | 'system';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  resourceId?: string;
  resourceType?: 'machine' | 'job' | 'checklist';
  timestamp: string;
  isRead: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  activeMachines: number;
  totalMachines?: number;
  pendingChecklists: number;
  completedToday?: number;
  activeJobs: number;
  totalJobs?: number;
  alertsCount?: number;
  alerts?: number;
}

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Notification Types
export type NotificationType =
  | 'checklist_submitted'
  | 'checklist_approved'
  | 'checklist_rejected'
  | 'job_assigned'
  | 'job_started'
  | 'job_completed'
  | 'maintenance_due'
  | 'machine_issue'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// Offline Queue Types
export interface OfflineAction {
  id: string;
  type: 'checklist_submit' | 'location_update' | 'job_update';
  payload: Record<string, any>;
  timestamp: number;
  retryCount: number;
}
