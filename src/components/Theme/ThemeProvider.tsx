import React, { createContext, useContext, useEffect } from 'react';

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
  // Always force dark theme
  const colorScheme: ColorSchemeType = 'dark';
  const theme: ThemeType = 'dark';
  const isDark = true;

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme-preference', 'dark');
  }, []);

  const setColorScheme = () => {
    // Locked to dark mode
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
