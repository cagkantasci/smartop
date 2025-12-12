import api from './api';

export interface Machine {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  machineType: 'excavator' | 'dozer' | 'loader' | 'crane' | 'truck' | 'roller' | 'grader' | 'forklift' | 'backhoe' | 'skid_steer' | 'telehandler' | 'compactor' | 'paver' | 'trencher' | 'drill' | 'generator' | 'compressor' | 'concrete_equipment' | 'lift' | 'trailer' | 'scraper' | 'other';
  serialNumber?: string;
  licensePlate?: string;
  status: 'active' | 'idle' | 'maintenance' | 'out_of_service';
  engineHours: number;
  fuelType?: string;
  fuelCapacity?: number;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  assignedOperatorId?: string;
  assignedOperator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  checklistTemplateId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMachineDto {
  name: string;
  brand: string;
  model: string;
  year: number;
  machineType: Machine['machineType'];
  serialNumber?: string;
  licensePlate?: string;
  status?: Machine['status'];
  engineHours?: number;
  fuelType?: string;
  fuelCapacity?: number;
  checklistTemplateId?: string;
}

export interface UpdateMachineDto extends Partial<CreateMachineDto> {
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  assignedOperatorId?: string | null;
  checklistTemplateId?: string | null;
}

export interface MachineListParams {
  status?: Machine['status'];
  machineType?: Machine['machineType'];
  search?: string;
  page?: number;
  limit?: number;
}

export const machineService = {
  async getAll(params?: MachineListParams): Promise<Machine[]> {
    const response = await api.get<Machine[]>('/machines', { params });
    return response.data;
  },

  async getById(id: string): Promise<Machine> {
    const response = await api.get<Machine>(`/machines/${id}`);
    return response.data;
  },

  async create(data: CreateMachineDto): Promise<Machine> {
    const response = await api.post<Machine>('/machines', data);
    return response.data;
  },

  async update(id: string, data: UpdateMachineDto): Promise<Machine> {
    const response = await api.patch<Machine>(`/machines/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/machines/${id}`);
  },

  async updateLocation(id: string, lat: number, lng: number, address?: string): Promise<Machine> {
    const response = await api.patch<Machine>(`/machines/${id}/location`, {
      lat,
      lng,
      address,
    });
    return response.data;
  },

  async assignOperator(id: string, operatorId: string): Promise<Machine> {
    const response = await api.post<Machine>(`/machines/${id}/assign`, { operatorId });
    return response.data;
  },

  async getHistory(id: string): Promise<any[]> {
    const response = await api.get(`/machines/${id}/history`);
    return response.data;
  },

  async getChecklists(id: string): Promise<any[]> {
    const response = await api.get(`/machines/${id}/checklists`);
    return response.data;
  },
};

export default machineService;
