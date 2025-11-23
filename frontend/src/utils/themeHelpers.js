/**
 * 🎨 Theme Helpers
 * Centralized color constants using theme.js values
 * Prevents hardcoded colors throughout the app
 */

import { theme } from '../theme/theme';

export const colors = {
  // Primary & Secondary
  primary: theme.palette.primary.main,      // #0056B3
  secondary: theme.palette.secondary.main,
  
  // Neutrals
  background: theme.palette.background.default,  // #F9F9F9
  text: theme.palette.text.primary,              // #212121
  textSecondary: theme.palette.text.secondary,   // #666666
  textDisabled: theme.palette.text.disabled,
  
  // Variants
  success: theme.palette.success.main,
  warning: theme.palette.warning.main,
  error: theme.palette.error.main,
  info: theme.palette.info.main,
  
  // Borders & Dividers
  border: theme.palette.divider,      // #E0E0E0
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
  
  // Status
  success_light: '#C8E6C9',
  error_light: '#FFCDD2',
  warning_light: '#FFE0B2',
  info_light: '#BBDEFB',
};

/**
 * Common sx patterns using theme colors
 */
export const sxPatterns = {
  // Text styles
  textSecondary: {
    color: colors.textSecondary,
    fontSize: '13px'
  },
  textDisabled: {
    color: colors.textDisabled,
    fontSize: '13px'
  },
  
  // Borders
  borderBottom: {
    borderBottom: `1px solid ${colors.border}`
  },
  borderTop: {
    borderTop: `1px solid ${colors.border}`
  },
  
  // Backgrounds
  bgLight: {
    backgroundColor: colors.gray50
  },
  bgWhite: {
    backgroundColor: '#FFFFFF'
  },
  
  // Cards
  cardHover: {
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  }
};

export default colors;
