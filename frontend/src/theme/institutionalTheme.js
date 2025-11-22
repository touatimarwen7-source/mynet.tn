/* ================================================
   B2B PROFESSIONAL THEME - UNIFIED & STANDARDIZED
   Single Source of Truth for All Styling
   Material-UI Only - No Custom CSS Required
   ================================================ */

import { createTheme } from '@mui/material/styles';

export const institutionalTheme = createTheme({
  // ================================================
  // PALETTE - B2B Professional Color System
  // ================================================
  palette: {
    primary: {
      main: '#0056B3',
      dark: '#003d7a',
      light: '#e3f2fd',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#616161',
      dark: '#424242',
      light: '#9e9e9e',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      dark: '#1b5e20',
      light: '#e8f5e9',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f57c00',
      dark: '#e65100',
      light: '#fff3e0',
      contrastText: '#ffffff',
    },
    error: {
      main: '#c62828',
      dark: '#ad1457',
      light: '#ffebee',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0056B3',
      dark: '#003d7a',
      light: '#e3f2fd',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F9F9F9',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
      disabled: '#bdbdbd',
    },
    divider: '#e0e0e0',
    action: {
      active: '#0056B3',
      hover: '#f5f5f5',
      selected: '#e3f2fd',
      disabled: '#bdbdbd',
      disabledBackground: '#f5f5f5',
    },
  },

  // ================================================
  // TYPOGRAPHY - Professional Hierarchy
  // ================================================
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'sans-serif',
    ].join(','),

    htmlFontSize: 16,

    body1: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0px',
    },
    body2: {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0px',
    },

    h1: {
      fontSize: '32px',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '-0.5px',
      margin: 0,
    },
    h2: {
      fontSize: '28px',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '-0.3px',
      margin: 0,
    },
    h3: {
      fontSize: '24px',
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: '0px',
      margin: 0,
    },
    h4: {
      fontSize: '20px',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0px',
      margin: 0,
    },
    h5: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0px',
      margin: 0,
    },
    h6: {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.2px',
      margin: 0,
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
      letterSpacing: '0px',
    },
    overline: {
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0px',
    },
    subtitle2: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.1px',
    },
  },

  // ================================================
  // SPACING - 8px Grid System
  // ================================================
  spacing: 8,

  // ================================================
  // SHAPE - Border Radius (Flat Design)
  // ================================================
  shape: {
    borderRadius: 4,
  },

  // ================================================
  // SHADOWS - EMPTY (NO SHADOWS - FLAT DESIGN)
  // ================================================
  shadows: [
    'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none',
  ],

  // ================================================
  // COMPONENTS - Institutional Styling
  // ================================================
  components: {
    // ===== CssBaseline =====
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          width: '100%',
          height: '100%',
          scrollBehavior: 'smooth',
          WebkitTextSizeAdjust: '100%',
        },
        body: {
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
          fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: 1.5,
          color: '#212121',
          backgroundColor: '#F9F9F9',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          direction: 'ltr',
          overflowX: 'hidden',
        },
        '#root': {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        },
        a: {
          color: '#0056B3',
          textDecoration: 'none',
          transition: 'color 200ms ease-in-out',
          '&:hover': {
            color: '#003d7a',
            textDecoration: 'none',
          },
          '&:focus': {
            outline: '2px solid #0056B3',
            outlineOffset: '2px',
            borderRadius: '2px',
          },
        },
        button: {
          fontFamily: 'Roboto, inherit',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          border: 'none',
          background: 'none',
          padding: 0,
          '&:disabled': {
            opacity: 0.6,
            cursor: 'not-allowed',
          },
        },
        input: {
          fontFamily: 'Roboto, inherit',
          fontSize: '14px',
          fontWeight: 400,
          color: '#212121',
          '&::placeholder': {
            color: '#9e9e9e',
            opacity: 1,
          },
        },
        textarea: {
          fontFamily: 'Roboto, inherit',
          fontSize: '14px',
          fontWeight: 400,
          color: '#212121',
          '&::placeholder': {
            color: '#9e9e9e',
            opacity: 1,
          },
        },
        select: {
          fontFamily: 'Roboto, inherit',
          fontSize: '14px',
          fontWeight: 400,
          color: '#212121',
        },
        h1: { fontWeight: 500, color: '#212121', margin: 0 },
        h2: { fontWeight: 500, color: '#212121', margin: 0 },
        h3: { fontWeight: 500, color: '#212121', margin: 0 },
        h4: { fontWeight: 500, color: '#212121', margin: 0 },
        h5: { fontWeight: 500, color: '#212121', margin: 0 },
        h6: { fontWeight: 600, color: '#212121', margin: 0 },
        p: {
          fontSize: '14px',
          fontWeight: 400,
          color: '#212121',
          margin: 0,
          lineHeight: 1.6,
        },
        label: {
          fontSize: '14px',
          fontWeight: 500,
          color: '#212121',
        },
        table: {
          width: '100%',
          borderCollapse: 'collapse',
          borderSpacing: 0,
        },
        thead: {
          backgroundColor: '#f5f5f5',
        },
        th: {
          padding: '16px',
          textAlign: 'left',
          fontWeight: 600,
          color: '#0056B3',
          borderBottom: '2px solid #e0e0e0',
          fontSize: '13px',
        },
        td: {
          padding: '16px',
          borderBottom: '1px solid #e0e0e0',
          fontSize: '14px',
        },
        'tbody tr:hover': {
          backgroundColor: '#fafafa',
        },
        '::selection': {
          backgroundColor: '#e3f2fd',
          color: '#0056B3',
        },
        '::-moz-selection': {
          backgroundColor: '#e3f2fd',
          color: '#0056B3',
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: '#F9F9F9',
        },
        '::-webkit-scrollbar-thumb': {
          background: '#bdbdbd',
          borderRadius: '4px',
          '&:hover': {
            background: '#9e9e9e',
          },
        },
        '::-webkit-scrollbar-corner': {
          background: '#F9F9F9',
        },
      },
    },

    // ===== Button =====
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: '40px',
          padding: '10px 20px',
          borderRadius: '4px',
          fontWeight: 500,
          textTransform: 'none',
          letterSpacing: '0px',
          boxShadow: 'none',
          transition: 'all 200ms ease-in-out',
          border: '1px solid transparent',
          '&:hover': {
            boxShadow: 'none',
            transform: 'none',
          },
          '&:active': {
            transform: 'none',
          },
          '&:disabled': {
            backgroundColor: '#e0e0e0',
            color: '#9e9e9e',
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
        containedPrimary: {
          backgroundColor: '#0056B3',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#003d7a',
          },
        },
        containedSecondary: {
          backgroundColor: '#616161',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#424242',
          },
        },
        outlined: {
          borderColor: '#e0e0e0',
          color: '#212121',
          border: '1.5px solid #e0e0e0',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            borderColor: '#0056B3',
            color: '#0056B3',
          },
        },
        text: {
          color: '#0056B3',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },

    // ===== TextField =====
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
            fontSize: '14px',
            fontWeight: 400,
            '& fieldset': {
              borderColor: '#e0e0e0',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#bdbdbd',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0056B3',
              borderWidth: '2px',
            },
          },
          '& .MuiOutlinedInput-input': {
            fontSize: '14px',
            padding: '12px 16px',
            fontWeight: 400,
            color: '#212121',
            '&::placeholder': {
              color: '#9e9e9e',
              opacity: 1,
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e0e0e0',
          },
          '& .MuiInputLabel-outlined': {
            fontSize: '14px',
            fontWeight: 400,
            color: '#616161',
            transform: 'translate(14px, 18px) scale(1)',
          },
          '& .MuiInputLabel-outlined.Mui-focused': {
            color: '#0056B3',
          },
          '& .MuiInputBase-input': {
            height: 'auto',
            minHeight: '40px',
          },
        },
      },
    },

    // ===== Card =====
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          boxShadow: 'none',
          padding: '24px',
          marginBottom: '16px',
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            borderColor: '#0056B3',
            boxShadow: 'none',
          },
        },
      },
    },

    // ===== Paper =====
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          boxShadow: 'none',
          padding: '24px',
          marginBottom: '16px',
        },
      },
    },

    // ===== Table =====
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderCollapse: 'collapse',
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
          color: '#0056B3',
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

    // ===== Alert =====
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
          color: '#003d7a',
          border: '1px solid #0056B3',
          borderLeft: '4px solid #0056B3',
          padding: '12px 16px',
        },
      },
    },

    // ===== Dialog =====
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '4px',
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '20px',
          fontWeight: 500,
          color: '#0056B3',
          borderBottom: '1px solid #e0e0e0',
          padding: '24px',
        },
      },
    },

    // ===== Chip =====
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '4px',
          height: '28px',
          padding: '0 12px',
        },
      },
    },

    // ===== AppBar =====
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#212121',
          border: 'none',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: 'none',
          padding: '12px 24px',
        },
      },
    },

    // ===== Toolbar =====
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '64px',
          padding: '12px 24px',
          gap: '16px',
        },
      },
    },

    // ===== Tab =====
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
            color: '#0056B3',
          },
        },
      },
    },

    // ===== Checkbox =====
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#bdbdbd',
          '&.Mui-checked': {
            color: '#0056B3',
          },
        },
      },
    },

    // ===== Radio =====
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#bdbdbd',
          '&.Mui-checked': {
            color: '#0056B3',
          },
        },
      },
    },

    // ===== Switch =====
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#0056B3',
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#0056B3',
          },
        },
      },
    },

    // ===== Select =====
    MuiSelect: {
      styleOverrides: {
        root: {
          fontSize: '14px',
          fontWeight: 400,
          color: '#212121',
        },
      },
    },

    // ===== Container =====
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

    // ===== Grid =====
    MuiGrid: {
      styleOverrides: {
        root: {
          width: '100%',
        },
      },
    },

    // ===== Stack =====
    MuiStack: {
      defaultProps: {
        useFlexGap: true,
      },
    },

    // ===== Typography =====
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'div',
          h4: 'div',
          h5: 'div',
          h6: 'div',
          subtitle1: 'div',
          subtitle2: 'div',
          body1: 'p',
          body2: 'p',
        },
      },
      styleOverrides: {
        root: {
          fontSize: 'inherit',
          fontWeight: 'inherit',
          lineHeight: 'inherit',
        },
      },
    },

    // ===== Link =====
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#0056B3',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'color 200ms ease-in-out',
          '&:hover': {
            color: '#003d7a',
            textDecoration: 'none',
          },
        },
      },
    },

    // ===== CircularProgress =====
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#0056B3',
        },
      },
    },

    // ===== LinearProgress =====
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: '4px',
          backgroundColor: '#e0e0e0',
        },
        bar: {
          backgroundColor: '#0056B3',
        },
      },
    },
  },

  // ================================================
  // BREAKPOINTS - Responsive Design
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
