import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, tokenStorage } from '../services/api';
import { pushNotificationService } from '../services/pushNotifications';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize push notifications on mount
  useEffect(() => {
    initializePushNotifications();
  }, []);

  // Check for existing session on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Register device when user logs in
  useEffect(() => {
    if (user) {
      registerDeviceForPushNotifications();
    }
  }, [user]);

  const initializePushNotifications = async () => {
    try {
      await pushNotificationService.init();
      console.log('Push notifications initialized');
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  };

  const registerDeviceForPushNotifications = async () => {
    try {
      // Check if device is already registered
      const isRegistered = await pushNotificationService.isDeviceRegistered();
      if (!isRegistered && pushNotificationService.hasToken()) {
        const success = await pushNotificationService.registerDeviceWithServer();
        if (success) {
          console.log('Device registered for push notifications');
        }
      }
    } catch (error) {
      console.error('Failed to register device for push:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        const userData = await authApi.getMe();
        setUser(userData.user);
      }
    } catch (error) {
      console.log('No valid session found');
      await tokenStorage.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      await tokenStorage.setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);

      // Register device for push notifications after successful login
      setTimeout(async () => {
        if (pushNotificationService.hasToken()) {
          await pushNotificationService.registerDeviceWithServer();
        }
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Unregister device from push notifications before logout
      await pushNotificationService.unregisterDeviceFromServer();

      await authApi.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      await tokenStorage.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData.user);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData } as User);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
