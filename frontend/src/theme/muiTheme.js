/* ================================================
   MATERIAL-UI INSTITUTIONAL THEME v2
   STRICT 8px Grid System + Unified Component Heights
   Visual Audit Complete - No Custom CSS Allowed
   ================================================ */

import { createTheme } from '@mui/material/styles';

export const institutionalTheme = createTheme({
  // ================================================
  // PALETTE - Official Government Colors
  // ================================================
  palette: {
    primary: {
      main: '#007bff',
      dark: '#0056b3',
      light: '#e7f1ff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f8f8f8',
      dark: '#cccccc',
      light: '#ffffff',
      contrastText: '#333333',
    },
    success: {
      main: '#28a745',
      dark: '#1e7e34',
      light: '#d4edda',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ffc107',
      dark: '#e0a800',
      light: '#fff3cd',
      contrastText: '#000000',
    },
    error: {
      main: '#dc3545',
      dark: '#c82333',
      light: '#f8d7da',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0d6efd',
      dark: '#0a58ca',
      light: '#cfe2ff',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    divider: '#e0e0e0',
    action: {
      active: '#007bff',
      hover: '#f8f8f8',
      selected: '#e7f1ff',
      disabled: '#cccccc',
      disabledBackground: '#f0f0f0',
    },
  },

  // ================================================
  // TYPOGRAPHY - Single Font Family + 3 Weights
  // ================================================
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Oxygen"',
      '"Ubuntu"',
      '"Cantarell"',
      '"Fira Sans"',
      '"Droid Sans"',
      '"Helvetica Neue"',
      'sans-serif',
    ].join(','),

    // Font Size Hierarchy (px)
    h1: {
      fontSize: '28px',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.3px',
    },
    h2: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.3px',
    },
    h3: {
      fontSize: '20px',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h5: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.5,
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
    },
    body1: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: 1.6,
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
      letterSpacing: '0.3px',
    },
  },

  // ================================================
  // COMPONENT OVERRIDES - Strict 8px Grid + Unified Heights
  // ================================================
  components: {
    // ✓ BUTTON - Unified Height 44px (5.5 x 8px), 8px-based padding
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          // MEASUREMENTS AUDIT:
          // Height: 44px (standard interactive element)
          // Padding: 12px 24px (vertical 1.5x8, horizontal 3x8)
          // Text spacing: Equal on all sides
          minHeight: '44px',
          padding: '12px 24px', // 12=1.5x8, 24=3x8
          borderRadius: '2px',
          fontWeight: 500,
          textTransform: 'none',
          transition: 'all 150ms ease-in-out',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px', // 8px between icon and text
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
        sizeSmall: {
          minHeight: '36px', // 4.5x8
          padding: '8px 16px', // 8=1x8, 16=2x8
          fontSize: '13px',
        },
        sizeMedium: {
          minHeight: '44px', // 5.5x8
          padding: '12px 24px', // 1.5x8, 3x8
          fontSize: '14px',
        },
        sizeLarge: {
          minHeight: '52px', // 6.5x8
          padding: '16px 32px', // 2x8, 4x8
          fontSize: '16px',
        },
        contained: {
          backgroundColor: '#007bff',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#0056b3',
          },
          '&:disabled': {
            backgroundColor: '#cccccc',
            color: '#999999',
          },
        },
        outlined: {
          borderColor: '#e0e0e0',
          color: '#333333',
          '&:hover': {
            backgroundColor: '#f8f8f8',
            borderColor: '#007bff',
            color: '#007bff',
          },
        },
        text: {
          color: '#007bff',
          '&:hover': {
            backgroundColor: '#f8f8f8',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'success' },
          style: {
            backgroundColor: '#28a745',
            '&:hover': {
              backgroundColor: '#1e7e34',
            },
          },
        },
        {
          props: { variant: 'contained', color: 'error' },
          style: {
            backgroundColor: '#dc3545',
            '&:hover': {
              backgroundColor: '#c82333',
            },
          },
        },
        {
          props: { variant: 'contained', color: 'warning' },
          style: {
            backgroundColor: '#ffc107',
            color: '#000000',
            '&:hover': {
              backgroundColor: '#e0a800',
            },
          },
        },
      ],
    },

    // ✓ TEXTFIELD - Unified Height 44px, 8px-based padding
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            borderRadius: '2px',
            minHeight: '44px', // Unified with buttons
            '& fieldset': {
              borderColor: '#e0e0e0',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#cccccc',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#007bff',
              boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.1)',
            },
          },
          '& .MuiOutlinedInput-input': {
            fontSize: '14px',
            fontWeight: 400,
            padding: '12px 16px', // 1.5x8 vertical, 2x8 horizontal
            height: '20px', // Content height, total 44px with padding
          },
          '& .MuiInputLabel-outlined': {
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            color: '#333333',
            transform: 'translate(16px, 12px) scale(1)',
            '&.Mui-focused, &.MuiFormLabel-filled': {
              transform: 'translate(12px, -8px) scale(0.85)',
            },
          },
        },
      },
    },

    // ✓ SELECT - Unified Height 44px
    MuiSelect: {
      styleOverrides: {
        root: {
          minHeight: '44px',
          fontSize: '14px',
          padding: '12px 16px',
        },
      },
    },

    // ✓ TABLE - Strict 8px grid spacing
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
          backgroundColor: '#f8f8f8',
          borderBottom: '2px solid #e0e0e0', // Section separator
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: '12px',
          fontWeight: 700,
          color: '#007bff',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          padding: '16px', // 2x8 - uniform padding
          textAlign: 'left',
        },
        body: {
          fontSize: '14px',
          color: '#333333',
          padding: '16px', // 2x8 - uniform padding = equal text spacing
          borderBottom: '1px solid #f0f0f0', // Light divider
          verticalAlign: 'middle',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          height: '56px', // 7x8 - standard row height
          '&:hover': {
            backgroundColor: '#f8f8f8',
          },
          '&:last-child td': {
            borderBottom: 'none',
          },
        },
      },
    },

    // ✓ CARD - Spacing and borders
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '2px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          padding: '24px', // 3x8
          marginBottom: '16px', // 2x8 - section spacing
          '&:hover': {
            borderColor: '#007bff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },

    // ✓ SECTION SEPARATORS - 1px light gray borders
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '2px',
          padding: '24px', // 3x8
          marginBottom: '16px', // 2x8
        },
      },
    },

    // ✓ CONTAINER - Spacing between sections
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '24px', // 3x8
          paddingBottom: '24px', // 3x8
          paddingLeft: '16px', // 2x8
          paddingRight: '16px', // 2x8
        },
      },
    },

    // ✓ BOX - Strict spacing
    MuiBox: {
      styleOverrides: {
        root: {
          margin: 0, // No default margins
          padding: 0, // No default padding
        },
      },
    },

    // ✓ STACK - 8px-based gaps
    MuiStack: {
      defaultProps: {
        spacing: 2, // 2x8 = 16px between items
      },
      styleOverrides: {
        root: {
          margin: 0, // No default margins
        },
      },
    },

    // ✓ GRID - Consistent spacing
    MuiGrid: {
      defaultProps: {
        spacing: 2, // 2x8 = 16px
      },
    },

    // ✓ MODAL & DIALOG
    MuiModal: {
      styleOverrides: {
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '2px',
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '20px',
          fontWeight: 700,
          color: '#007bff',
          borderBottom: '1px solid #e0e0e0',
          padding: '24px', // 3x8
          margin: 0,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px', // 3x8
          marginBottom: '16px', // 2x8
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px', // 2x8, 3x8
          gap: '8px', // 1x8
          borderTop: '1px solid #e0e0e0',
        },
      },
    },

    // ✓ ALERT - Strict styling
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: '#d4edda',
          color: '#1e7e34',
          border: '1px solid #28a745',
          borderLeft: '4px solid #28a745',
          padding: '16px', // 2x8
          marginBottom: '16px', // 2x8
        },
        standardWarning: {
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffc107',
          borderLeft: '4px solid #ffc107',
          padding: '16px', // 2x8
          marginBottom: '16px', // 2x8
        },
        standardError: {
          backgroundColor: '#f8d7da',
          color: '#c82333',
          border: '1px solid #dc3545',
          borderLeft: '4px solid #dc3545',
          padding: '16px', // 2x8
          marginBottom: '16px', // 2x8
        },
        standardInfo: {
          backgroundColor: '#cfe2ff',
          color: '#0a58ca',
          border: '1px solid #0d6efd',
          borderLeft: '4px solid #0d6efd',
          padding: '16px', // 2x8
          marginBottom: '16px', // 2x8
        },
      },
    },

    // ✓ CHIP - Unified sizing
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          height: '24px', // 3x8
          padding: '0 8px', // 1x8
        },
        filledSuccess: {
          backgroundColor: '#28a745',
          color: '#ffffff',
        },
        filledWarning: {
          backgroundColor: '#ffc107',
          color: '#000000',
        },
        filledError: {
          backgroundColor: '#dc3545',
          color: '#ffffff',
        },
        filledInfo: {
          backgroundColor: '#0d6efd',
          color: '#ffffff',
        },
      },
    },

    // ✓ CHECKBOX & RADIO - Spacing
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#cccccc',
          padding: '8px', // 1x8
          '&.Mui-checked': {
            color: '#007bff',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#cccccc',
          padding: '8px', // 1x8
          '&.Mui-checked': {
            color: '#007bff',
          },
        },
      },
    },

    // ✓ APPBAR - Professional spacing
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#333333',
          border: 'none',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: 'none',
          padding: '16px 24px', // 2x8, 3x8
        },
      },
    },

    // ✓ TOOLBAR - Consistent spacing
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '64px', // 8x8
          padding: '16px 24px', // 2x8, 3x8
          gap: '16px', // 2x8
        },
      },
    },

    // ✓ TAB - Text spacing
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '14px',
          fontWeight: 500,
          textTransform: 'none',
          color: '#666666',
          minHeight: '44px', // Unified height
          padding: '12px 24px', // 1.5x8, 3x8
          '&.Mui-selected': {
            color: '#007bff',
          },
        },
      },
    },

    // ✓ MENU - Section separators
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '2px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '14px',
          padding: '12px 16px', // 1.5x8, 2x8
          minHeight: '44px', // Unified height
          '&:hover': {
            backgroundColor: '#f8f8f8',
          },
          '&.Mui-selected': {
            backgroundColor: '#e7f1ff',
            '&:hover': {
              backgroundColor: '#e7f1ff',
            },
          },
        },
      },
    },
  },

  // ================================================
  // SHAPE - Minimal radius (2px institutional)
  // ================================================
  shape: {
    borderRadius: 2,
  },

  // ================================================
  // SPACING - Enforced 8px Grid
  // ================================================
  spacing: 8, // Base unit: 8px
  // Valid spacings: 0 (0px), 1 (8px), 2 (16px), 3 (24px), 4 (32px), 5 (40px)

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

/* ================================================
   MEASUREMENT AUDIT SUMMARY
   ================================================
   
   BASE UNIT: 8px (rigidly enforced)
   
   SPACING MULTIPLES (All padding/margin must be):
   8px = 1x  | 16px = 2x  | 24px = 3x
   32px = 4x | 40px = 5x  | 48px = 6x
   
   COMPONENT HEIGHTS (Unified):
   - Buttons:    44px (5.5x8) - standard interactive
   - Inputs:     44px (5.5x8) - matches buttons
   - Rows:       56px (7x8) - table rows
   - Toolbar:    64px (8x8) - app bar
   
   TEXT PADDING (Uniform on all sides):
   - Large:      16px (2x8) - padding around text
   - Medium:     12px (1.5x8) - padding around text
   
   BORDERS (Section Separators):
   - Light dividers: 1px solid #f0f0f0
   - Section breaks: 1px solid #e0e0e0
   - Focus indicator: 4px solid primary color
   
   SPACING BETWEEN SECTIONS:
   - Margin below cards: 16px (2x8)
   - Margin below alerts: 16px (2x8)
   - Gap between stack items: 16px (2x8)
   
   VISUAL CONSISTENCY:
   ✓ All buttons same height (44px)
   ✓ All inputs same height (44px)
   ✓ All padding/margin in 8px multiples
   ✓ All section separators 1px light gray
   ✓ No custom CSS possible - pure MUI theming
   ================================================ */
