
/**
 * 📄 Unified Pagination Middleware
 * Standardizes pagination across all API endpoints
 */

const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
};

/**
 * Unified pagination middleware
 */
const unifiedPaginationMiddleware = (req, res, next) => {
  // Only apply to GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Parse and validate page
  let page = parseInt(req.query.page, 10);
  if (isNaN(page) || page < 1) {
    page = PAGINATION_DEFAULTS.PAGE;
  }

  // Parse and validate limit
  let limit = parseInt(req.query.limit, 10);
  if (isNaN(limit) || limit < PAGINATION_DEFAULTS.MIN_LIMIT) {
    limit = PAGINATION_DEFAULTS.LIMIT;
  }
  if (limit > PAGINATION_DEFAULTS.MAX_LIMIT) {
    limit = PAGINATION_DEFAULTS.MAX_LIMIT;
  }

  // Calculate offset
  const offset = (page - 1) * limit;

  // Attach to request
  req.pagination = {
    page,
    limit,
    offset,
    maxLimit: PAGINATION_DEFAULTS.MAX_LIMIT,
  };

  // Helper function for response
  req.paginationResponse = (data, total) => {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  };

  next();
};

module.exports = unifiedPaginationMiddleware;
