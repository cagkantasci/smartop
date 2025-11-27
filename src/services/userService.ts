import api from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'operator';
  phone?: string;
  avatarUrl?: string;
  jobTitle?: string;
  licenses: string[];
  specialties: string[];
  isActive: boolean;
  lastLoginAt?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: User['role'];
  phone?: string;
  jobTitle?: string;
  licenses?: string[];
  specialties?: string[];
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  isActive?: boolean;
}

export interface UserListParams {
  role?: User['role'];
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const userService = {
  async getAll(params?: UserListParams): Promise<User[]> {
    const response = await api.get<User[]>('/users', { params });
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserDto): Promise<User> {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // Get operators only
  async getOperators(): Promise<User[]> {
    return this.getAll({ role: 'operator', isActive: true });
  },

  // Get managers only
  async getManagers(): Promise<User[]> {
    return this.getAll({ role: 'manager', isActive: true });
  },
};

export default userService;
