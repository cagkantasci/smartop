import api from './api';

export interface ChecklistItem {
  id: string;
  label: string;
  type: 'boolean' | 'number' | 'text' | 'photo';
  required: boolean;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  machineTypes: string[];
  items: ChecklistItem[];
  isActive: boolean;
  organizationId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
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
  machine?: {
    id: string;
    name: string;
  };
  templateId: string;
  template?: ChecklistTemplate;
  operatorId: string;
  operator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  entries: ChecklistEntry[];
  issuesCount: number;
  notes?: string;
  locationLat?: number;
  locationLng?: number;
  reviewedById?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  machineTypes: string[];
  items: Omit<ChecklistItem, 'id'>[];
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {
  isActive?: boolean;
}

export interface CreateSubmissionDto {
  machineId: string;
  templateId: string;
  entries: Omit<ChecklistEntry, 'label'>[];
  notes?: string;
  locationLat?: number;
  locationLng?: number;
}

export interface ReviewSubmissionDto {
  status: 'approved' | 'rejected';
  reviewNotes?: string;
}

export interface SubmissionListParams {
  machineId?: string;
  operatorId?: string;
  status?: ChecklistSubmission['status'];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const checklistService = {
  // Templates
  async getTemplates(): Promise<ChecklistTemplate[]> {
    const response = await api.get<ChecklistTemplate[]>('/checklists/templates');
    return response.data;
  },

  async getTemplateById(id: string): Promise<ChecklistTemplate> {
    const response = await api.get<ChecklistTemplate>(`/checklists/templates/${id}`);
    return response.data;
  },

  async createTemplate(data: CreateTemplateDto): Promise<ChecklistTemplate> {
    const response = await api.post<ChecklistTemplate>('/checklists/templates', data);
    return response.data;
  },

  async updateTemplate(id: string, data: UpdateTemplateDto): Promise<ChecklistTemplate> {
    const response = await api.patch<ChecklistTemplate>(`/checklists/templates/${id}`, data);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/checklists/templates/${id}`);
  },

  // Submissions
  async getSubmissions(params?: SubmissionListParams): Promise<ChecklistSubmission[]> {
    const response = await api.get<ChecklistSubmission[]>('/checklists/submissions', { params });
    return response.data;
  },

  async getSubmissionById(id: string): Promise<ChecklistSubmission> {
    const response = await api.get<ChecklistSubmission>(`/checklists/submissions/${id}`);
    return response.data;
  },

  async createSubmission(data: CreateSubmissionDto): Promise<ChecklistSubmission> {
    const response = await api.post<ChecklistSubmission>('/checklists/submissions', data);
    return response.data;
  },

  async reviewSubmission(id: string, data: ReviewSubmissionDto): Promise<ChecklistSubmission> {
    const response = await api.patch<ChecklistSubmission>(`/checklists/submissions/${id}/review`, data);
    return response.data;
  },

  // Get pending submissions for approval
  async getPendingSubmissions(): Promise<ChecklistSubmission[]> {
    return this.getSubmissions({ status: 'pending' });
  },
};

export default checklistService;
