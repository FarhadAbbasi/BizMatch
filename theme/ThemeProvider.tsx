import React, { createContext, useContext, useState, useCallback } from 'react';
import { theme as defaultTheme, Theme } from './index';

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme?: Theme;
};

export function ThemeProvider({ children, initialTheme = defaultTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
    // We'll implement dark theme later
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
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

// Utility hooks for specific theme properties
export function useColors() {
  const { theme } = useTheme();
  return theme.colors;
}

export function useTypography() {
  const { theme } = useTheme();
  return theme.typography;
}

export function useSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

export function useLayout() {
  const { theme } = useTheme();
  return theme.layout;
}

export function useAnimations() {
  const { theme } = useTheme();
  return theme.animations;
} 