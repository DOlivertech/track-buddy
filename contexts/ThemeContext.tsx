import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService } from '@/services/storageService';

export type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryText: string;
  border: string;
  shadow: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

const lightTheme: ThemeColors = {
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  text: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#9CA3AF',
  primary: '#3B82F6',
  primaryText: '#FFFFFF',
  border: '#E5E7EB',
  shadow: '#000000',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#2563EB',
};

const darkTheme: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  primary: '#60A5FA',
  primaryText: '#1E293B',
  border: '#475569',
  shadow: '#000000',
  success: '#22C55E',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#3B82F6',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await storageService.getTheme();
      setThemeState(savedTheme);
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await storageService.saveTheme(newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
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