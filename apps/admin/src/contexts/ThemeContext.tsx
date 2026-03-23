import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ mode: 'light', toggleTheme: () => {} });

export const useThemeMode = () => useContext(ThemeContext);

const makeTheme = (mode: ThemeMode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#1F4A7A', contrastText: '#ffffff' },
      secondary: { main: '#64b5f6' },
      ...(mode === 'light' && {
        background: { default: '#f5f5f5', paper: '#ffffff' },
      }),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: { root: { borderRadius: 8, padding: '10px 20px' } },
      },
      MuiTextField: {
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
        },
      },
    },
  });

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('themeMode') as ThemeMode) ?? 'light';
  });

  const theme = useMemo(() => makeTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
