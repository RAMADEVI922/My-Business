import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#c27835',
      light: '#d97706',
      dark: '#a0621f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ea580c',
      light: '#f97316',
      dark: '#c2410c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f0f0f',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(194, 120, 53, 0.2)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(194, 120, 53, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.75rem 1.5rem',
          fontSize: '0.95rem',
          fontWeight: 600,
        },
        contained: {
          background: 'linear-gradient(135deg, #c27835, #d97706)',
          boxShadow: '0 4px 15px rgba(194, 120, 53, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #d97706, #ea580c)',
            boxShadow: '0 6px 20px rgba(194, 120, 53, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
            '& fieldset': {
              borderColor: 'rgba(194, 120, 53, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(194, 120, 53, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#c27835',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 15, 15, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(194, 120, 53, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(15, 15, 15, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(194, 120, 53, 0.2)',
        },
      },
    },
  },
});