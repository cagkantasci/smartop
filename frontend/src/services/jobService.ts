import api from './api';

export interface Job {
  id: string;
  title: string;
  description?: string;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdById: string;
  organizationId: string;
  jobAssignments?: JobAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface JobAssignment {
  id: string;
  jobId: string;
  machineId: string;
  machine?: {
    id: string;
    name: string;
  };
  operatorId: string;
  operator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface CreateJobDto {
  title: string;
  description?: string;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  priority?: Job['priority'];
  scheduledStart?: string;
  scheduledEnd?: string;
  estimatedHours?: number;
}

export interface UpdateJobDto extends Partial<CreateJobDto> {
  status?: Job['status'];
  progress?: number;
}

export interface AssignJobDto {
  machineIds: string[];
  operatorIds: string[];
}

export interface JobListParams {
  status?: Job['status'];
  priority?: Job['priority'];
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const jobService = {
  async getAll(params?: JobListParams): Promise<Job[]> {
    const response = await api.get<Job[]>('/jobs', { params });
    return response.data;
  },

  async getById(id: string): Promise<Job> {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  async create(data: CreateJobDto): Promise<Job> {
    const response = await api.post<Job>('/jobs', data);
    return response.data;
  },

  async update(id: string, data: UpdateJobDto): Promise<Job> {
    const response = await api.patch<Job>(`/jobs/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  },

  async start(id: string): Promise<Job> {
    const response = await api.patch<Job>(`/jobs/${id}/start`);
    return response.data;
  },

  async complete(id: string): Promise<Job> {
    const response = await api.patch<Job>(`/jobs/${id}/complete`);
    return response.data;
  },

  async assign(id: string, machineIds: string[], operatorIds: string[] = []): Promise<Job> {
    const response = await api.post<Job>(`/jobs/${id}/assign`, { machineIds, operatorIds });
    return response.data;
  },

  // Get active jobs
  async getActiveJobs(): Promise<Job[]> {
    return this.getAll({ status: 'in_progress' });
  },

  // Get scheduled jobs
  async getScheduledJobs(): Promise<Job[]> {
    return this.getAll({ status: 'scheduled' });
  },
};

export default jobService;
