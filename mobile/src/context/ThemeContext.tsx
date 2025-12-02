import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Frontend'deki renklere uygun tema tanımları
export const lightTheme = {
  mode: 'light' as const,
  colors: {
    // Primary colors
    primary: '#F59E0B', // smart-yellow
    primaryDark: '#D97706',
    primaryLight: '#FBBF24',

    // Background colors
    background: '#F8FAFC', // slate-50
    backgroundSecondary: '#F1F5F9', // slate-100
    card: '#FFFFFF',
    cardBorder: 'rgba(0, 0, 0, 0.1)',

    // Text colors
    text: '#0F172A', // slate-900
    textSecondary: '#64748B', // slate-500
    textMuted: '#94A3B8', // slate-400

    // Status colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Tab bar
    tabBar: '#FFFFFF',
    tabBarBorder: 'rgba(0, 0, 0, 0.1)',
    tabBarActive: '#F59E0B',
    tabBarInactive: '#64748B',
    activeBackground: 'rgba(245, 158, 11, 0.15)',

    // Input
    inputBg: '#F1F5F9',
    inputBorder: '#E2E8F0',
    placeholder: '#94A3B8',

    // Other
    border: '#E2E8F0',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

export const darkTheme = {
  mode: 'dark' as const,
  colors: {
    // Primary colors
    primary: '#F59E0B', // smart-yellow
    primaryDark: '#D97706',
    primaryLight: '#FBBF24',

    // Background colors
    background: '#111827', // slate-900
    backgroundSecondary: '#1E293B', // slate-800
    card: '#1E293B',
    cardBorder: 'rgba(255, 255, 255, 0.1)',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#9CA3AF', // gray-400
    textMuted: '#6B7280', // gray-500

    // Status colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Tab bar
    tabBar: '#111827',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
    tabBarActive: '#F59E0B',
    tabBarInactive: '#9CA3AF',
    activeBackground: 'rgba(245, 158, 11, 0.15)',

    // Input
    inputBg: '#0F172A',
    inputBorder: 'rgba(255, 255, 255, 0.1)',
    placeholder: '#6B7280',

    // Other
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export type Theme = typeof darkTheme;
export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@smartop_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['dark', 'light', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Determine actual theme based on mode
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark');

  const theme = isDark ? darkTheme : lightTheme;

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
