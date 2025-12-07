/**
 * 🎨 Theme Helpers
 * Centralized color constants using theme.js values
 * Prevents hardcoded colors throughout the app
 */

import institutionalTheme from '../theme/theme';

// Re-export as theme for compatibility
export const theme = institutionalTheme;

// Export THEME_COLORS from theme palette
export const THEME_COLORS = {
  primary: institutionalTheme.palette.primary.main,
  secondary: institutionalTheme.palette.secondary.main,
  success: institutionalTheme.palette.success.main,
  error: institutionalTheme.palette.error.main,
  warning: institutionalTheme.palette.warning.main,
  info: institutionalTheme.palette.info.main,
  bgDefault: institutionalTheme.palette.background.default,
  bgPaper: institutionalTheme.palette.background.paper,
  textPrimary: institutionalTheme.palette.text.primary,
  textSecondary: institutionalTheme.palette.text.secondary,
  divider: institutionalTheme.palette.divider,
};

export const colors = {
  // Primary & Secondary
  primary: institutionalTheme.palette.primary.main,
  secondary: institutionalTheme.palette.secondary.main,

  // Neutrals
  background: institutionalTheme.palette.background.default,
  text: institutionalTheme.palette.text.primary,
  textSecondary: institutionalTheme.palette.text.secondary,
  textDisabled: institutionalTheme.palette.text.disabled,

  // Variants
  success: institutionalTheme.palette.success.main,
  warning: institutionalTheme.palette.warning.main,
  error: institutionalTheme.palette.error.main,
  info: institutionalTheme.palette.info.main,

  // Borders & Dividers
  border: institutionalTheme.palette.divider,
  border_light: '#f0f0f0',
  border_dark: '#999999',

  // Grays
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
};

/**
 * Common sx patterns using theme colors
 */
export const sxPatterns = {
  // Text styles
  textSecondary: {
    color: colors.textSecondary,
    fontSize: '13px',
  },
  textDisabled: {
    color: colors.textDisabled,
    fontSize: '13px',
  },

  // Borders
  borderBottom: {
    borderBottom: `1px solid ${colors.border}`,
  },
  borderTop: {
    borderTop: `1px solid ${colors.border}`,
  },

  // Backgrounds
  bgLight: {
    backgroundColor: colors.gray50,
  },
  bgWhite: {
    backgroundColor: '#FFFFFF',
  },

  // Cards
  cardHover: {
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
  },
};

export default institutionalTheme;