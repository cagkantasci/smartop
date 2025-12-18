import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Ensure API URL always ends with /api/v1
const getApiUrl = () => {
  let baseUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!baseUrl) {
    // Web runs in browser on same machine, can use localhost
    // Native runs on device/emulator, needs IP address
    baseUrl = Platform.OS === 'web'
      ? 'http://localhost:3000'
      : 'http://192.168.0.13:3000';
  }

  // If URL doesn't end with /api/v1, append it
  if (!baseUrl.endsWith('/api/v1')) {
    return baseUrl.replace(/\/$/, '') + '/api/v1';
  }
  return baseUrl;
};

const API_URL = getApiUrl();

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Token management
export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await this.setAccessToken(accessToken);
    await this.setRefreshToken(refreshToken);
  },
};

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await tokenStorage.setTokens(accessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await tokenStorage.clearTokens();
        // Navigate to login - will be handled by auth context
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    await api.post('/auth/logout', { refreshToken });
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Machines API
export const machinesApi = {
  getAll: async (params?: { status?: string; type?: string; limit?: number }) => {
    const response = await api.get('/machines', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/machines/${id}`);
    return response.data;
  },

  update: async (id: string, data: {
    name?: string;
    status?: string;
    assignedOperatorId?: string | null;
    checklistTemplateId?: string | null;
  }) => {
    const response = await api.patch(`/machines/${id}`, data);
    return response.data;
  },

  assignOperator: async (id: string, operatorId: string | null) => {
    const response = await api.post(`/machines/${id}/assign`, { operatorId });
    return response.data;
  },

  updateLocation: async (id: string, lat: number, lng: number) => {
    const response = await api.patch(`/machines/${id}/location`, { lat, lng });
    return response.data;
  },

  getChecklists: async (id: string) => {
    const response = await api.get(`/machines/${id}/checklists`);
    return response.data;
  },
};

// Checklists API
export const checklistsApi = {
  getTemplates: async () => {
    const response = await api.get('/checklists/templates');
    return response.data;
  },

  createTemplate: async (data: {
    name: string;
    description?: string;
    machineTypes?: string[];
    items: Array<{ id: string; label: string; type: 'boolean' | 'text' | 'number' | 'photo'; required: boolean }>;
  }) => {
    const response = await api.post('/checklists/templates', data);
    return response.data;
  },

  updateTemplate: async (id: string, data: {
    name?: string;
    description?: string;
    machineTypes?: string[];
    items?: Array<{ id: string; label: string; type: 'boolean' | 'text' | 'number' | 'photo'; required: boolean }>;
  }) => {
    const response = await api.patch(`/checklists/templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: string) => {
    const response = await api.delete(`/checklists/templates/${id}`);
    return response.data;
  },

  getTemplateById: async (id: string) => {
    const response = await api.get(`/checklists/templates/${id}`);
    return response.data;
  },

  getSubmissions: async (params?: { status?: string; machineId?: string }) => {
    const response = await api.get('/checklists/submissions', { params });
    return response.data;
  },

  getSubmissionById: async (id: string) => {
    const response = await api.get(`/checklists/submissions/${id}`);
    return response.data;
  },

  submitChecklist: async (data: {
    machineId: string;
    templateId: string;
    entries: Array<{ itemId: string; label: string; isOk: boolean; value?: string; photoUrl?: string }>;
    notes?: string;
    locationLat?: number;
    locationLng?: number;
    startHours?: number;
    endHours?: number;
  }) => {
    const response = await api.post('/checklists/submissions', data);
    return response.data;
  },

  reviewSubmission: async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    const response = await api.patch(`/checklists/submissions/${id}/review`, {
      status,
      notes,
    });
    return response.data;
  },
};

// Jobs API
export const jobsApi = {
  getAll: async (params?: { status?: string; priority?: string; limit?: number }) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    locationName?: string;
    locationLat?: number | null;
    locationLng?: number | null;
    priority: string;
    status?: string;
    machineIds?: string[];
    operatorIds?: string[];
  }) => {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  assignResources: async (id: string, machineIds: string[], operatorIds: string[]) => {
    const response = await api.post(`/jobs/${id}/assign`, { machineIds, operatorIds });
    return response.data;
  },

  start: async (id: string) => {
    const response = await api.patch(`/jobs/${id}/start`);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await api.patch(`/jobs/${id}/complete`);
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAll: async (params?: { role?: string }) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    jobTitle?: string;
    licenses?: string[];
    specialties?: string[];
  }) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    jobTitle?: string;
    licenses?: string[];
    specialties?: string[];
    isActive?: boolean;
  }) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  updateProfile: async (data: { firstName?: string; lastName?: string; phone?: string }) => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  updateNotificationSettings: async (settings: {
    push?: boolean;
    email?: boolean;
    sms?: boolean;
    checklistReminder?: boolean;
    jobUpdates?: boolean;
    maintenanceAlerts?: boolean;
  }) => {
    const response = await api.patch('/users/notification-settings', settings);
    return response.data;
  },

  // Update user location (for live tracking)
  updateLocation: async (latitude: number, longitude: number, address?: string) => {
    const response = await api.post('/users/location', { latitude, longitude, address });
    return response.data;
  },

  // Toggle biometric authentication
  toggleBiometric: async (enabled: boolean) => {
    const response = await api.post('/users/biometric', { enabled });
    return response.data;
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async (params?: { limit?: number; offset?: number }) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  registerDevice: async (token: string, platform: 'ios' | 'android' | 'web') => {
    const response = await api.post('/notifications/device', { token, platform });
    return response.data;
  },
};

// Uploads API
export const uploadsApi = {
  uploadBase64: async (folder: string, base64: string, mimeType: string) => {
    const response = await api.post('/uploads/base64', { folder, base64, mimeType });
    return response.data;
  },

  getPresignedUrl: async (folder: string, filename: string, mimeType: string) => {
    const response = await api.post('/uploads/presigned-url', { folder, filename, mimeType });
    return response.data;
  },
};

export default api;
