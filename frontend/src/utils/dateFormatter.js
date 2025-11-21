/**
 * Safely format a date string to French locale
 * Returns formatted date or N/A if invalid
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Format date and time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Safely parse date for comparisons
 */
export const parseDate = (dateString) => {
  if (!dateString) return new Date(0);
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date(0) : date;
  } catch (error) {
    return new Date(0);
  }
};
