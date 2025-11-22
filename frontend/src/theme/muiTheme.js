/* ================================================
   MODERN PROFESSIONAL FORMAL THEME v2.0
   Complete Visual Redesign - Clean, Modern, Institutional
   ================================================ */

import { createTheme } from '@mui/material/styles';

export const institutionalTheme = createTheme({
  // ================================================
  // COLOR PALETTE - Modern Professional
  // ================================================
  palette: {
    primary: {
      main: '#1565c0',           // Modern blue (more vibrant than institutional)
      dark: '#0d47a1',           // Dark blue
      light: '#e3f2fd',          // Light blue background
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f5f5f5',           // Light gray
      dark: '#9e9e9e',           // Medium gray
      light: '#ffffff',          // White
      contrastText: '#212121',   // Dark gray text
    },
    success: {
      main: '#2e7d32',           // Professional green
      dark: '#1b5e20',           // Dark green
      light: '#e8f5e9',          // Light green
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f57c00',           // Modern orange
      dark: '#e65100',           // Dark orange
      light: '#fff3e0',          // Light orange
      contrastText: '#ffffff',
    },
    error: {
      main: '#c62828',           // Modern red
      dark: '#ad1457',           // Dark red
      light: '#ffebee',          // Light red
      contrastText: '#ffffff',
    },
    info: {
      main: '#1976d2',           // Modern info blue
      dark: '#1565c0',           // Dark info
      light: '#e3f2fd',          // Light info
      contrastText: '#ffffff',
    },
    background: {
      default: '#F9F9F9',        // Corporate flat background
      paper: '#ffffff',          // White cards
    },
    text: {
      primary: '#212121',        // Dark text
      secondary: '#616161',      // Medium gray text
      disabled: '#bdbdbd',       // Light gray disabled
    },
    divider: '#e0e0e0',          // Light divider
    action: {
      active: '#1565c0',
      hover: '#f5f5f5',
      selected: '#e3f2fd',
      disabled: '#bdbdbd',
      disabledBackground: '#f5f5f5',
    },
  },

  // ================================================
  // TYPOGRAPHY - Modern Professional
  // ================================================
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'sans-serif',
    ].join(','),

    h1: {
      fontSize: '32px',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '-0.5px',
      textAlign: 'left',
      margin: 0,
    },
    h2: {
      fontSize: '28px',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '-0.3px',
      textAlign: 'left',
      margin: 0,
    },
    h3: {
      fontSize: '24px',
      fontWeight: 500,
      lineHeight: 1.3,
      textAlign: 'left',
      margin: 0,
    },
    h4: {
      fontSize: '20px',
      fontWeight: 500,
      lineHeight: 1.4,
      textAlign: 'left',
      margin: 0,
    },
    h5: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.5,
      textAlign: 'left',
      margin: 0,
    },
    h6: {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'none',
      letterSpacing: '0.2px',
      textAlign: 'left',
      margin: 0,
    },
    body1: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.6,
      textAlign: 'left',
    },
    body2: {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: 1.6,
      textAlign: 'left',
    },
    button: {
      fontSize: '14px',
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0px',
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    overline: {
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  },

  // ================================================
  // COMPONENT OVERRIDES
  // ================================================
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: false,
      },
      styleOverrides: {
        root: {
          minHeight: '40px',
          padding: '10px 20px',
          borderRadius: '4px',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        sizeSmall: {
          minHeight: '36px',
          padding: '8px 16px',
          fontSize: '13px',
        },
        sizeMedium: {
          minHeight: '40px',
          padding: '10px 20px',
          fontSize: '14px',
        },
        sizeLarge: {
          minHeight: '48px',
          padding: '14px 28px',
          fontSize: '16px',
        },
        contained: {
          backgroundColor: '#1565c0',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1153a3',
          },
          '&:disabled': {
            backgroundColor: '#e0e0e0',
            color: '#9e9e9e',
          },
        },
        outlined: {
          borderColor: '#e0e0e0',
          color: '#212121',
          border: '1.5px solid #e0e0e0',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            borderColor: '#1565c0',
            color: '#1565c0',
          },
        },
        text: {
          color: '#1565c0',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            '& fieldset': {
              borderColor: '#e0e0e0',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#bdbdbd',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1565c0',
              borderWidth: '2px',
            },
          },
          '& .MuiOutlinedInput-input': {
            fontSize: '14px',
            padding: '12px 16px',
            fontWeight: 400,
          },
          '& .MuiInputLabel-outlined': {
            fontSize: '14px',
            fontWeight: 400,
            color: '#616161',
          },
        },
      },
    },

    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
          borderBottom: '2px solid #e0e0e0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: '13px',
          fontWeight: 600,
          color: '#1565c0',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          padding: '16px',
          backgroundColor: '#f5f5f5',
        },
        body: {
          fontSize: '14px',
          color: '#212121',
          padding: '16px',
          borderBottom: '1px solid #e0e0e0',
          verticalAlign: 'middle',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          height: '56px',
          '&:hover': {
            backgroundColor: '#fafafa',
          },
          '&:last-child td': {
            borderBottom: 'none',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          padding: '24px',
          marginBottom: '16px',
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            borderColor: '#1565c0',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          padding: '24px',
          marginBottom: '16px',
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: '#e8f5e9',
          color: '#1b5e20',
          border: '1px solid #2e7d32',
          borderLeft: '4px solid #2e7d32',
          padding: '12px 16px',
        },
        standardWarning: {
          backgroundColor: '#fff3e0',
          color: '#e65100',
          border: '1px solid #f57c00',
          borderLeft: '4px solid #f57c00',
          padding: '12px 16px',
        },
        standardError: {
          backgroundColor: '#ffebee',
          color: '#ad1457',
          border: '1px solid #c62828',
          borderLeft: '4px solid #c62828',
          padding: '12px 16px',
        },
        standardInfo: {
          backgroundColor: '#e3f2fd',
          color: '#0d47a1',
          border: '1px solid #1976d2',
          borderLeft: '4px solid #1976d2',
          padding: '12px 16px',
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '20px',
          fontWeight: 500,
          color: '#1565c0',
          borderBottom: '1px solid #e0e0e0',
          padding: '24px',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '16px',
          height: '28px',
          padding: '0 12px',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#212121',
          border: 'none',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          padding: '12px 24px',
        },
      },
    },

    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '64px',
          padding: '12px 24px',
          gap: '16px',
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '14px',
          fontWeight: 500,
          textTransform: 'none',
          color: '#616161',
          minHeight: '48px',
          padding: '12px 24px',
          '&.Mui-selected': {
            color: '#1565c0',
          },
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#bdbdbd',
          '&.Mui-checked': {
            color: '#1565c0',
          },
        },
      },
    },

    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '24px',
          paddingBottom: '24px',
          paddingLeft: '16px',
          paddingRight: '16px',
        },
      },
    },
  },

  // ================================================
  // SHAPE
  // ================================================
  shape: {
    borderRadius: 4,
  },

  // ================================================
  // SPACING - 8px Grid
  // ================================================
  spacing: 8,

  // ================================================
  // BREAKPOINTS
  // ================================================
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default institutionalTheme;
