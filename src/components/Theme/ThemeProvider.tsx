import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/useStore';

export type ColorSchemeType = 'dark' | 'light' | 'system';
export type ThemeType = 'dark' | 'light';

interface ThemeContextType {
  colorScheme: ColorSchemeType;
  theme: ThemeType;
  isDark: boolean;
  setColorScheme: (scheme: ColorSchemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSettings } = useStore();
  const colorScheme = settings.colorScheme || 'system';

  // System dark preference state
  const [systemIsDark, setSystemIsDark] = useState(() => 
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true
  );

  // Sync with system preference changes
  useEffect(() => {
    if (colorScheme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [colorScheme]);

  // Determine the active resolved theme
  const theme: ThemeType = colorScheme === 'system' 
    ? (systemIsDark ? 'dark' : 'light') 
    : colorScheme;

  const isDark = theme === 'dark';

  const prevThemeRef = useRef<ThemeType | null>(null);

  // Apply theme class and transition animation
  useEffect(() => {
    const prevTheme = prevThemeRef.current;
    const shouldTransition = prevTheme !== null && prevTheme !== theme;

    if (shouldTransition) {
      document.documentElement.classList.add('theme-transitioning');
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Cache to localStorage for anti-flicker script in index.html
    localStorage.setItem('theme-preference', colorScheme);

    prevThemeRef.current = theme;

    if (shouldTransition) {
      const timer = setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [theme, colorScheme]);

  const setColorScheme = (scheme: ColorSchemeType) => {
    updateSettings({ colorScheme: scheme });
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, theme, isDark, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
