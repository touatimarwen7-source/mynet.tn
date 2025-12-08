
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandlingMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const SearchService = require('../services/SearchService');
const { search: searchRateLimiter } = require('../middleware/enhancedRateLimiting');

// Apply rate limiting to all search routes
router.use(searchRateLimiter);

/**
 * @route GET /api/search/tenders
 * @desc Search tenders with filters
 * @access Public
 */
router.get('/tenders', asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    status,
    minBudget,
    maxBudget,
    closingDateFrom,
    closingDateTo,
    page = 1,
    limit = 20
  } = req.query;

  const filters = {
    keyword,
    category,
    status,
    minBudget: minBudget ? parseFloat(minBudget) : undefined,
    maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
    closingDateFrom,
    closingDateTo
  };

  const results = await SearchService.searchTenders(filters, {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100)
  });

  res.status(200).json({
    success: true,
    ...results
  });
}));

/**
 * @route GET /api/search/suppliers
 * @desc Search suppliers
 * @access Public
 */
router.get('/suppliers', asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    verified,
    rating,
    page = 1,
    limit = 20
  } = req.query;

  const filters = {
    keyword,
    category,
    verified: verified === 'true',
    minRating: rating ? parseFloat(rating) : undefined
  };

  const results = await SearchService.searchSuppliers(filters, {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100)
  });

  res.status(200).json({
    success: true,
    ...results
  });
}));

/**
 * @route GET /api/search/products
 * @desc Search products/services
 * @access Public
 */
router.get('/products', asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    page = 1,
    limit = 20
  } = req.query;

  const filters = {
    keyword,
    category,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
  };

  const results = await SearchService.searchProducts(filters, {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100)
  });

  res.status(200).json({
    success: true,
    ...results
  });
}));

module.exports = router;
