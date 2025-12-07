import { createTheme } from '@mui/material/styles';

/**
 * ============================================================
 * THEME PROFESSIONNEL B2B - THÈME UNIFIÉ ET STANDARDISÉ
 * ============================================================
 *
 * Système de Conception Institutionnel:
 * - Couleurs: Bleu professionnel #0056B3, Fond épuré #F9F9F9
 * - Typographie: Roboto 14px standard, poids 500-600 pour titres
 * - Espacement: Grille 8px (16px standard pour composants)
 * - Design: Plat (0 ombre), Border-radius 4px, Zéro dégradés
 *
 * Règles Obligatoires:
 * ✓ Aucune ombre (box-shadow: none)
 * ✓ Couleurs d'entreprise seulement
 * ✓ Espacement unifié (multiples de 8px)
 * ✓ Typographie cohérente (Roboto)
 * ✓ Contraste WCAG AA minimum
 */

const institutionalTheme = createTheme({
  // ==========================================
  // PALETTE - Couleurs Institutionnelles
  // ==========================================
  palette: {
    // Bleu Professionnel - Couleur Primaire
    primary: {
      main: '#0056B3',
      light: '#1976d2',
      dark: '#003d7a',
      contrastText: '#FFFFFF',
    },
    // Gris Secondaire - Accentuation
    secondary: {
      main: '#546e7a',
      light: '#78909c',
      dark: '#37474f',
      contrastText: '#FFFFFF',
    },
    // Succès - Vert Professionnel
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#FFFFFF',
    },
    // Alerte - Orange Professionnel
    warning: {
      main: '#f57c00',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#FFFFFF',
    },
    // Erreur - Rouge Professionnel
    error: {
      main: '#c62828',
      light: '#ef5350',
      dark: '#b71c1c',
      contrastText: '#FFFFFF',
    },
    // Info - Bleu Clair
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#FFFFFF',
    },
    // Fond et Texte
    background: {
      default: '#F9F9F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
      disabled: '#9e9e9e',
    },
    divider: '#E0E0E0',
  },

  // ==========================================
  // TYPOGRAPHIE - Roboto Unifié
  // ==========================================
  typography: {
    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,

    h1: {
      fontSize: '32px',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#212121',
      letterSpacing: '0px',
    },
    h2: {
      fontSize: '28px',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#212121',
      letterSpacing: '0px',
    },
    h3: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#212121',
      letterSpacing: '0px',
    },
    h4: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#212121',
      letterSpacing: '0px',
    },
    h5: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#212121',
      letterSpacing: '0px',
    },
    h6: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#212121',
      letterSpacing: '0px',
    },
    body1: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#212121',
      letterSpacing: '0px',
    },
    body2: {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#616161',
      letterSpacing: '0px',
    },
    button: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.5,
      textTransform: 'none',
      letterSpacing: '0px',
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.4,
      color: '#9e9e9e',
      letterSpacing: '0px',
    },
  },

  // ==========================================
  // ESPACEMENT - Grille 8px
  // ==========================================
  spacing: (factor) => `${8 * factor}px`,

  // ==========================================
  // FORME - Border Radius 4px
  // ==========================================
  shape: {
    borderRadius: 4,
  },

  // ==========================================
  // POINTS D'ARRÊT - Responsive Design
  // ==========================================
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },

  // ==========================================
  // COMPOSANTS MUI - Surcharges Institutionnelles
  // ==========================================
  components: {
    // ===== MuiCssBaseline =====
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
        },
        button: {
          fontFamily: 'Roboto, inherit',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          border: 'none',
          background: 'none',
          padding: 0,
        },
        input: {
          fontFamily: 'Roboto, inherit',
          fontSize: '14px',
          color: '#212121',
          '&::placeholder': {
            color: '#9e9e9e',
            opacity: 1,
          },
        },
        textarea: {
          fontFamily: 'Roboto, inherit',
          fontSize: '14px',
          color: '#212121',
          '&::placeholder': {
            color: '#9e9e9e',
            opacity: 1,
          },
        },
        select: {
          fontFamily: 'Roboto, inherit',
          fontSize: '14px',
          color: '#212121',
        },
        h1: { fontWeight: 600, color: '#212121', margin: 0 },
        h2: { fontWeight: 600, color: '#212121', margin: 0 },
        h3: { fontWeight: 600, color: '#212121', margin: 0 },
        h4: { fontWeight: 600, color: '#212121', margin: 0 },
        h5: { fontWeight: 500, color: '#212121', margin: 0 },
        h6: { fontWeight: 500, color: '#212121', margin: 0 },
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
          borderBottom: '2px solid #E0E0E0',
          fontSize: '13px',
        },
        td: {
          padding: '16px',
          borderBottom: '1px solid #E0E0E0',
          fontSize: '14px',
        },
        'tbody tr:hover': {
          backgroundColor: '#fafafa',
        },
        '::selection': {
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
        /* ===== HeroSearch Container ===== */
        '.hero-search-container': {
          width: '100%',
          padding: '24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E0E0E0',
          borderRadius: '0px',
          boxShadow: 'none',
        },
        /* Search Tabs Wrapper */
        '.search-tabs-wrapper': {
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        },
        /* Search Tab Button */
        '.search-tab-button': {
          padding: '12px 20px !important',
          fontSize: '14px !important',
          fontWeight: '500 !important',
          textTransform: 'none !important',
          whiteSpace: 'nowrap',
          border: '1px solid #E0E0E0 !important',
          borderRadius: '4px !important',
          transition: 'all 200ms ease-in-out',
          '&.MuiButton-outlined': {
            backgroundColor: '#F9F9F9',
            color: '#212121',
            borderColor: '#E0E0E0',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              borderColor: '#0056B3',
              color: '#0056B3',
            },
          },
          '&.MuiButton-contained': {
            backgroundColor: '#0056B3 !important',
            color: '#FFFFFF !important',
            borderColor: '#0056B3 !important',
            '&:hover': {
              backgroundColor: '#003d7a !important',
            },
          },
        },
        /* Search Form Stack */
        '.search-form-stack': {
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        },
        /* Category Filter */
        '.search-category-filter': {
          width: '100%',
          '& .MuiFormLabel-root': {
            fontSize: '14px',
            fontWeight: '600 !important',
            color: '#212121',
            marginBottom: '8px',
            display: 'block',
          },
          '& .MuiRadio-root': {
            color: '#0056B3',
            '&.Mui-checked': {
              color: '#0056B3',
            },
          },
        },
        /* Keywords Field */
        '.search-keywords-field': {
          flex: 1,
          minWidth: '250px',
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '4px',
          },
          '& .MuiOutlinedInput-input::placeholder': {
            color: '#9e9e9e',
            opacity: 1,
          },
        },
        /* Region Select */
        '.search-region-select': {
          flex: 1,
          minWidth: '250px',
          backgroundColor: '#FFFFFF !important',
          borderRadius: '4px !important',
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
          },
        },
        /* Submit Button */
        '.search-submit-button': {
          backgroundColor: '#0056B3 !important',
          color: '#FFFFFF !important',
          padding: '12px 24px !important',
          fontSize: '14px !important',
          fontWeight: '500 !important',
          minHeight: '40px',
          textTransform: 'none !important',
          textAlign: 'center',
          display: 'flex !important',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          borderRadius: '4px !important',
          '&:hover': {
            backgroundColor: '#003d7a !important',
          },
        },
        /* ===== DynamicAdvertisement ===== */
        '.dynamic-advertisement-container': {
          width: '100%',
          padding: '24px',
          backgroundColor: '#F9F9F9',
          borderRadius: '0px',
        },
        '.dynamic-ad-card': {
          boxShadow: 'none',
          border: '1px solid #E0E0E0',
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          padding: 0,
          '&.dynamic-ad-success': {
            borderLeftColor: '#2e7d32',
            borderLeftWidth: '4px',
          },
          '&.dynamic-ad-webinar': {
            borderLeftColor: '#0288d1',
            borderLeftWidth: '4px',
          },
          '&.dynamic-ad-promo': {
            borderLeftColor: '#f57c00',
            borderLeftWidth: '4px',
          },
        },
        '.dynamic-ad-content': {
          padding: '24px',
          '& .dynamic-ad-title': {
            fontSize: '16px !important',
            fontWeight: '600 !important',
            color: '#212121',
            marginBottom: '12px',
          },
          '& .dynamic-ad-message': {
            fontSize: '14px !important',
            color: '#616161',
            marginBottom: '16px',
            lineHeight: 1.6,
          },
        },
        '.dynamic-ad-cta': {
          backgroundColor: '#0056B3 !important',
          color: '#FFFFFF !important',
          padding: '10px 20px !important',
          fontSize: '14px !important',
          fontWeight: '500 !important',
          textTransform: 'none !important',
          borderRadius: '4px !important',
          minHeight: '40px',
          '&:hover': {
            backgroundColor: '#003d7a !important',
          },
        },
        '.dynamic-ad-controls': {
          padding: '16px 24px',
          borderTop: '1px solid #E0E0E0',
          backgroundColor: '#F9F9F9',
          borderBottomLeftRadius: '3px',
          borderBottomRightRadius: '3px',
        },
        '.dynamic-ad-dot': {
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#E0E0E0',
          border: 'none',
          cursor: 'pointer',
          padding: '0px',
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            backgroundColor: '#bdbdbd',
          },
          '&.active': {
            backgroundColor: '#0056B3',
            width: '10px',
            height: '10px',
          },
        },
        '.dynamic-ad-next-btn': {
          color: '#0056B3',
          padding: '4px !important',
          minWidth: '24px !important',
          height: '24px',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
        /* ===== AboutPage ===== */
        '.about-page-wrapper': {
          width: '100%',
          backgroundColor: '#F9F9F9',
        },
        '.about-hero-section': {
          backgroundColor: '#0056B3',
          color: '#FFFFFF',
          padding: '60px 20px',
          textAlign: 'center',
          boxShadow: 'none',
        },
        '.about-hero-title': {
          fontSize: '44px !important',
          fontWeight: '600 !important',
          marginBottom: '16px !important',
          color: '#FFFFFF',
        },
        '.about-hero-subtitle': {
          fontSize: '18px',
          color: '#e3f2fd',
          fontWeight: 400,
        },
        '.about-main-container': {
          paddingY: '60px',
        },
        '.about-story-section': {
          marginBottom: '60px',
        },
        '.about-section-title': {
          fontSize: '32px !important',
          fontWeight: '600 !important',
          color: '#212121',
          marginBottom: '40px !important',
          textAlign: 'center',
        },
        '.about-story-grid': {
          marginBottom: '40px',
        },
        '.about-story-card': {
          height: '100%',
          border: '1px solid #E0E0E0',
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          boxShadow: 'none',
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            borderColor: '#0056B3',
            backgroundColor: '#f9f9f9',
          },
        },
        '.about-card-content': {
          padding: '32px',
          textAlign: 'center',
        },
        '.about-card-emoji': {
          fontSize: '48px !important',
          marginBottom: '16px !important',
          display: 'block',
        },
        '.about-card-title': {
          fontSize: '18px !important',
          fontWeight: '600 !important',
          color: '#212121',
          marginBottom: '12px !important',
        },
        '.about-card-text': {
          color: '#616161',
          lineHeight: 1.8,
          fontSize: '14px',
        },
        '.about-values-section': {
          marginBottom: '60px',
        },
        '.about-value-card': {
          height: '100%',
          border: '1px solid #E0E0E0',
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          boxShadow: 'none',
          textAlign: 'center',
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            borderColor: '#0056B3',
            backgroundColor: '#f9f9f9',
          },
        },
        '.about-value-content': {
          padding: '24px',
        },
        '.about-value-emoji': {
          fontSize: '44px !important',
          marginBottom: '12px !important',
          display: 'block',
        },
        '.about-value-title': {
          fontSize: '16px !important',
          fontWeight: '600 !important',
          color: '#212121',
          marginBottom: '8px !important',
        },
        '.about-value-text': {
          color: '#616161',
          fontSize: '14px',
        },
        '.about-team-section': {
          marginBottom: '60px',
        },
        '.about-team-card': {
          border: '1px solid #E0E0E0',
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          boxShadow: 'none',
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            borderColor: '#0056B3',
            backgroundColor: '#f9f9f9',
          },
        },
        '.about-team-content': {
          padding: '24px',
          display: 'flex',
          gap: '20px',
        },
        '.about-team-avatar': {
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#0056B3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: '32px',
          flexShrink: 0,
        },
        '.about-team-info': {
          flex: 1,
        },
        '.about-team-name': {
          fontSize: '16px !important',
          fontWeight: '600 !important',
          color: '#212121',
        },
        '.about-team-role': {
          fontSize: '12px',
          color: '#0056B3',
          fontWeight: '600',
          marginBottom: '8px',
        },
        '.about-team-bio': {
          fontSize: '14px',
          color: '#616161',
          lineHeight: 1.6,
        },
      },
    },

    // ===== MuiButton =====
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
        containedPrimary: {
          backgroundColor: '#0056B3',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#003d7a',
          },
        },
        outlinedPrimary: {
          borderColor: '#0056B3',
          color: '#0056B3',
          '&:hover': {
            backgroundColor: '#f0f7ff',
            borderColor: '#003d7a',
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
      },
    },

    // ===== MuiCard =====
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #E0E0E0',
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
        },
      },
    },

    // ===== MuiPaper =====
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
        },
        elevation0: {
          boxShadow: 'none',
        },
        elevation1: {
          boxShadow: 'none',
          border: '1px solid #E0E0E0',
        },
      },
    },

    // ===== MuiTextField =====
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0056B3',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0056B3',
            },
          },
        },
      },
    },

    // ===== MuiOutlinedInput =====
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E0E0E0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0056B3',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0056B3',
            borderWidth: '2px',
          },
        },
        input: {
          padding: '12px 14px',
          fontSize: '14px',
          fontWeight: 400,
          color: '#212121',
        },
        multiline: {
          padding: '12px 14px',
        },
      },
    },

    // ===== MuiTable =====
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },

    // ===== MuiTableHead =====
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#0056B3',
            backgroundColor: '#f5f5f5',
            borderBottom: '2px solid #E0E0E0',
          },
        },
      },
    },

    // ===== MuiTableCell =====
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
          fontSize: '14px',
          borderBottom: '1px solid #E0E0E0',
          color: '#212121',
        },
        head: {
          fontWeight: 600,
          color: '#0056B3',
        },
        body: {
          color: '#212121',
        },
      },
    },

    // ===== MuiAlert =====
    MuiAlert: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid',
          borderRadius: '4px',
          fontSize: '14px',
        },
        standardSuccess: {
          backgroundColor: '#f1f8e9',
          borderColor: '#2e7d32',
          color: '#2e7d32',
        },
        standardError: {
          backgroundColor: '#ffebee',
          borderColor: '#c62828',
          color: '#c62828',
        },
        standardWarning: {
          backgroundColor: '#fff3e0',
          borderColor: '#f57c00',
          color: '#f57c00',
        },
        standardInfo: {
          backgroundColor: '#e3f2fd',
          borderColor: '#0288d1',
          color: '#0288d1',
        },
      },
    },

    // ===== MuiChip =====
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontWeight: 500,
          fontSize: '13px',
        },
        outlined: {
          borderColor: '#E0E0E0',
          backgroundColor: '#FFFFFF',
        },
        filledPrimary: {
          backgroundColor: '#0056B3',
          color: '#FFFFFF',
        },
      },
    },

    // ===== MuiCheckbox =====
    MuiCheckbox: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          padding: '8px',
          '&.Mui-checked': {
            color: '#0056B3',
          },
        },
      },
    },

    // ===== MuiRadio =====
    MuiRadio: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          padding: '8px',
          '&.Mui-checked': {
            color: '#0056B3',
          },
        },
      },
    },

    // ===== MuiSwitch =====
    MuiSwitch: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#0056B3',
          },
        },
      },
    },

    // ===== MuiSelect =====
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },

    // ===== MuiDialog =====
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: 'none',
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          border: '1px solid #E0E0E0',
        },
      },
    },

    // ===== MuiDialogTitle =====
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '20px',
          fontWeight: 600,
          color: '#212121',
          borderBottom: '1px solid #E0E0E0',
          padding: '20px',
        },
      },
    },

    // ===== MuiAppBar =====
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E0E0E0',
          color: '#212121',
        },
      },
    },

    // ===== MuiToolbar =====
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '64px',
          padding: '0 24px',
          backgroundColor: '#FFFFFF',
        },
      },
    },

    // ===== MuiCircularProgress =====
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#0056B3',
        },
      },
    },

    // ===== MuiLinearProgress =====
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: '#e0e0e0',
          height: '4px',
        },
        bar: {
          backgroundColor: '#0056B3',
        },
      },
    },

    // ===== MuiTabPanel =====
    MuiTabPanel: {
      styleOverrides: {
        root: {
          padding: '24px 0',
        },
      },
    },

    // ===== MuiTab =====
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '14px',
          color: '#616161',
          '&.Mui-selected': {
            color: '#0056B3',
          },
        },
      },
    },

    // ===== MuiDivider =====
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E0E0E0',
        },
      },
    },

    // ===== MuiList =====
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },

    // ===== MuiListItem =====
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
          '&.Mui-selected': {
            backgroundColor: '#e3f2fd',
            '&:hover': {
              backgroundColor: '#e3f2fd',
            },
          },
        },
      },
    },

    // ===== MuiContainer =====
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },

    // ===== MuiGrid =====
    MuiGrid: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },

    // ===== MuiStack =====
    MuiStack: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },

    // ===== MuiBox =====
    MuiBox: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },

    // ===== MuiTypography =====
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'h3',
          h4: 'h4',
          h5: 'h5',
          h6: 'h6',
          subtitle1: 'h2',
          subtitle2: 'h3',
          body1: 'p',
          body2: 'p',
        },
      },
      styleOverrides: {
        root: {
          color: '#212121',
        },
      },
    },

    // ===== MuiLink =====
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
      styleOverrides: {
        root: {
          color: '#0056B3',
          textDecoration: 'none',
          '&:hover': {
            color: '#003d7a',
            textDecoration: 'underline',
          },
        },
      },
    },

    // ===== MuiIconButton =====
    MuiIconButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          color: '#0056B3',
          '&:hover': {
            backgroundColor: 'rgba(0, 86, 179, 0.08)',
          },
        },
      },
    },

    // ===== MuiBadge =====
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: '#c62828',
          color: '#FFFFFF',
        },
      },
    },

    // ===== MuiAvatar =====
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0056B3',
          color: '#FFFFFF',
        },
      },
    },

    // ===== MuiSkeletonLoading =====
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: '#e0e0e0',
        },
      },
    },
  },
});

export default institutionalTheme;
export { institutionalTheme };