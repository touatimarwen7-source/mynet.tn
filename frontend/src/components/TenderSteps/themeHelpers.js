/**
 * @deprecated Use themeHelpers from '../../utils/themeHelpers.js' instead
 */
export * from '../../utils/themeHelpers.js';

// Explicitly re-export THEME_COLORS for backward compatibility
import { THEME_COLORS } from '../../utils/themeHelpers.js';
export { THEME_COLORS };

export const THEME_STYLES = {
  light: {
    backgroundColor: '#ffffff',
    color: '#1a202c',
    borderColor: '#cbd5e0',
  },
  dark: {
    backgroundColor: '#2d3748',
    color: '#e2e8f0',
    borderColor: '#4a5568',
  },
};

export const getFieldStyles = (isDarkMode) => ({
  backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
  color: isDarkMode ? '#e2e8f0' : '#1a202c',
  borderColor: isDarkMode ? '#4a5568' : '#cbd5e0',
});