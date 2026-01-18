import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * Material Design 3 inspired theme configuration for MUI
 * Maps to the existing color palette and themes (Classic, Modern, Minimal)
 */

const baseThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#6750A4',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFBFE',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1B1F',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 400,
    },
    h3: {
      fontSize: '1.2rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
};

/**
 * Default MUI theme based on Material Design 3
 */
export const theme = createTheme(baseThemeOptions);
