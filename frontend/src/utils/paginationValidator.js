/**
 * Pagination Validator
 * Validates and sanitizes pagination parameters
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MIN_PAGE = 1;
const MAX_LIMIT = 100;
const MIN_LIMIT = 1;

/**
 * Validate and normalize page number
 * @param {number|string} page - Page number (1-indexed)
 * @param {number} totalPages - Total pages available
 * @returns {number} Valid page number
 */
export function validatePage(page, totalPages = Infinity) {
  let validPage = parseInt(page, 10);
  
  if (isNaN(validPage) || validPage < MIN_PAGE) {
    return DEFAULT_PAGE;
  }
  
  if (validPage > totalPages && totalPages !== Infinity) {
    return Math.max(DEFAULT_PAGE, totalPages);
  }
  
  return validPage;
}

/**
 * Validate and normalize items per page (limit)
 * @param {number|string} limit - Items per page
 * @returns {number} Valid limit
 */
export function validateLimit(limit) {
  let validLimit = parseInt(limit, 10);
  
  if (isNaN(validLimit) || validLimit < MIN_LIMIT) {
    return DEFAULT_LIMIT;
  }
  
  if (validLimit > MAX_LIMIT) {
    return MAX_LIMIT;
  }
  
  return validLimit;
}

/**
 * Validate pagination state
 * @param {object} state - Pagination state { page, limit, totalItems, totalPages }
 * @returns {object} Valid pagination state
 */
export function validatePaginationState(state) {
  const {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    totalItems = 0,
    totalPages = Math.ceil(totalItems / limit) || 1
  } = state;
  
  const validLimit = validateLimit(limit);
  const calculatedPages = Math.ceil(totalItems / validLimit) || 1;
  const validTotalPages = totalPages || calculatedPages;
  const validPage = validatePage(page, validTotalPages);
  
  return {
    page: validPage,
    limit: validLimit,
    totalItems: Math.max(0, parseInt(totalItems, 10) || 0),
    totalPages: Math.max(1, parseInt(validTotalPages, 10) || 1)
  };
}

/**
 * Validate API pagination parameters before request
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} Valid { page, limit }
 */
export function validateApiParams(page, limit) {
  return {
    page: validatePage(page),
    limit: validateLimit(limit)
  };
}

/**
 * Calculate pagination info
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalItems - Total items
 * @returns {object} Pagination info { startItem, endItem, totalPages }
 */
export function calculatePaginationInfo(page, limit, totalItems) {
  const validPage = validatePage(page);
  const validLimit = validateLimit(limit);
  const totalPages = Math.ceil(totalItems / validLimit) || 1;
  
  const startItem = (validPage - 1) * validLimit + 1;
  const endItem = Math.min(validPage * validLimit, totalItems);
  
  return {
    startItem: Math.max(1, startItem),
    endItem: Math.max(0, endItem),
    totalPages,
    isValid: validPage <= totalPages
  };
}

export default {
  validatePage,
  validateLimit,
  validatePaginationState,
  validateApiParams,
  calculatePaginationInfo,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MIN_PAGE,
  MIN_LIMIT,
  MAX_LIMIT
};
