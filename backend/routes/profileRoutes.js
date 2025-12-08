const express = require('express');
const ProfileController = require('../controllers/user/ProfileController');
const { verifyToken } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandlingMiddleware');
const { sendOk, sendValidationError } = require('../utils/responseHelper');

const router = express.Router();

// ============================================================================
// SUPPLIER PREFERENCES ROUTES
// ============================================================================

/**
 * @route   PUT /api/profile/supplier/preferences
 * @desc    Update supplier preferences (categories, locations, budget)
 * @access  Private (Supplier only)
 */
router.put(
  '/supplier/preferences',
  verifyToken,
  asyncHandler(async (req, res) => {
    const controller = new ProfileController();
    return controller.updateSupplierPreferences(req, res);
  })
);

/**
 * @route   GET /api/profile/supplier/preferences
 * @desc    Get supplier preferences
 * @access  Private (Supplier only)
 */
router.get(
  '/supplier/preferences',
  verifyToken,
  asyncHandler(async (req, res) => {
    const controller = new ProfileController();
    return controller.getSupplierPreferences(req, res);
  })
);

// ============================================================================
// PROFILE MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   GET /api/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get(
  '/',
  verifyToken,
  asyncHandler(async (req, res) => {
    const controller = new ProfileController();

    if (typeof controller.getProfile === 'function') {
      return controller.getProfile(req, res);
    }

    // Fallback: return basic user info
    return sendOk(res, {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      company_name: req.user.company_name
    }, 'Profile retrieved successfully');
  })
);

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/',
  verifyToken,
  asyncHandler(async (req, res) => {
    const controller = new ProfileController();

    if (typeof controller.updateProfile === 'function') {
      return controller.updateProfile(req, res);
    }

    // Fallback error
    return sendValidationError(res, [], 'Profile update not implemented');
  })
);

module.exports = router;