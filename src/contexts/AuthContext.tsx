import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService, AuthResponse, User } from '../services/authService';
import { getAccessToken, setAccessToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  organization: AuthResponse['organization'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    organizationName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<AuthResponse['organization'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setOrganization(currentUser.organization as any);
        } catch (error) {
          // Token invalid or expired
          setAccessToken(null);
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.user as User);
      setOrganization(response.organization);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: {
      organizationName: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      setIsLoading(true);
      try {
        const response = await authService.register(data);
        setUser(response.user as User);
        setOrganization(response.organization);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setOrganization(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setOrganization(currentUser.organization as any);
    } catch (error) {
      // Session expired
      setUser(null);
      setOrganization(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    organization,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
