import api, { setAccessToken } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  organizationName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'manager' | 'operator';
    organizationId: string;
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    subscriptionTier: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'operator';
  phone?: string;
  avatarUrl?: string;
  jobTitle?: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { accessToken, refreshToken } = response.data;

    setAccessToken(accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    const { accessToken, refreshToken } = response.data;

    setAccessToken(accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return response.data;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } finally {
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    const { accessToken: newToken, refreshToken: newRefreshToken } = response.data;

    setAccessToken(newToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    return response.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};

export default authService;
