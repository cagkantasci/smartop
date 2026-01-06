import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authService from '../services/authService';
import * as api from '../services/api';

// Mock the services
vi.mock('../services/authService');
vi.mock('../services/api');

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(api.getAccessToken).mockReturnValue(null);
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });
  });

  describe('Initial state', () => {
    it('should start with no user and isLoading true', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.user).toBeNull();
      expect(result.current.organization).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should load user from existing session', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        organization: {
          id: 'org-1',
          name: 'Test Org',
        },
      };

      vi.mocked(api.getAccessToken).mockReturnValue('mock-token');
      vi.mocked(authService.authService.getCurrentUser).mockResolvedValue(mockUser as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear invalid session', async () => {
      vi.mocked(api.getAccessToken).mockReturnValue('invalid-token');
      vi.mocked(authService.authService.getCurrentUser).mockRejectedValue(
        new Error('Unauthorized'),
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(api.setAccessToken).toHaveBeenCalledWith(null);
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'admin',
        },
        organization: {
          id: 'org-1',
          name: 'Test Org',
        },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
      };

      vi.mocked(authService.authService.login).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.login('test@example.com', 'password');

      await waitFor(() => {
        expect(result.current.user).toEqual(mockResponse.user);
        expect(result.current.organization).toEqual(mockResponse.organization);
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it('should handle login error', async () => {
      vi.mocked(authService.authService.login).mockRejectedValue(
        new Error('Invalid credentials'),
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.login('test@example.com', 'wrong-password'),
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should successfully register user', async () => {
      const mockResponse = {
        user: {
          id: '1',
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
          role: 'admin',
        },
        organization: {
          id: 'org-1',
          name: 'New Org',
        },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
      };

      vi.mocked(authService.authService.register).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.register({
        organizationName: 'New Org',
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockResponse.user);
        expect(result.current.organization).toEqual(mockResponse.organization);
        expect(result.current.isAuthenticated).toBe(true);
      });
    });
  });

  describe('logout', () => {
    it('should clear user state on logout', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        organization: {
          id: 'org-1',
          name: 'Test Org',
        },
      };

      // Setup initial logged-in state
      vi.mocked(api.getAccessToken).mockReturnValue('mock-token');
      vi.mocked(authService.authService.getCurrentUser).mockResolvedValue(mockUser as any);
      vi.mocked(authService.authService.logout).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await result.current.logout();

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.organization).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe('refreshUser', () => {
    it('should refresh user data', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'User',
        role: 'admin',
        organization: {
          id: 'org-1',
          name: 'Test Org',
        },
      };

      vi.mocked(authService.authService.getCurrentUser).mockResolvedValue(mockUser as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.refreshUser();

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
    });

    it('should clear user on refresh error', async () => {
      // Setup initial state with user
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        organization: { id: 'org-1', name: 'Test Org' },
      };

      vi.mocked(api.getAccessToken).mockReturnValue('mock-token');
      vi.mocked(authService.authService.getCurrentUser)
        .mockResolvedValueOnce(mockUser as any)
        .mockRejectedValueOnce(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await result.current.refreshUser();

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.organization).toBeNull();
      });
    });
  });

  describe('updateUser', () => {
    it('should update user data locally', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        organization: {
          id: 'org-1',
          name: 'Test Org',
        },
      };

      vi.mocked(api.getAccessToken).mockReturnValue('mock-token');
      vi.mocked(authService.authService.getCurrentUser).mockResolvedValue(mockUser as any);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      result.current.updateUser({ firstName: 'Updated' });

      await waitFor(() => {
        expect(result.current.user?.firstName).toBe('Updated');
        expect(result.current.user?.lastName).toBe('User');
      });
    });
  });
});
