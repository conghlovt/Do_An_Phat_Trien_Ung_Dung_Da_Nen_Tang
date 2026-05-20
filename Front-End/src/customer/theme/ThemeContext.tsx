import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme, { ThemeColors } from './theme';

type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  currentTheme: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDarkMode: false,
  setIsDarkMode: () => {},
  currentTheme: theme.light,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);
  const isDarkMode = themePreference === 'system'
    ? systemColorScheme === 'dark'
    : themePreference === 'dark';

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme-mode');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setThemePreference(savedTheme);
        } else {
          setThemePreference('system');
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const handleSetIsDarkMode = async (value: boolean) => {
    const nextTheme = value ? 'dark' : 'light';
    setThemePreference(nextTheme);
    try {
      await AsyncStorage.setItem('theme-mode', nextTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        setIsDarkMode: handleSetIsDarkMode,
        currentTheme: isDarkMode ? theme.dark : theme.light,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemeContext = () => useContext(ThemeContext);
