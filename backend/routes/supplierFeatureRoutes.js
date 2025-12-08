const express = require('express');
const SupplierFeatureController = require('../controllers/admin/SupplierFeatureController');
const { verifyToken, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Admin only - manage supplier features
router.put(
  '/enable',
  verifyToken,
  checkPermission('manage_features'),
  (req, res) => SupplierFeatureController.enableFeature(req, res)
);

router.put(
  '/disable',
  verifyToken,
  checkPermission('manage_features'),
  (req, res) => SupplierFeatureController.disableFeature(req, res)
);

// Get all available features
router.get(
  '/available',
  verifyToken,
  checkPermission('view_features'),
  (req, res) => SupplierFeatureController.getAllAvailableFeatures(req, res)
);

// Get features by category
router.get(
  '/category/:category',
  validateIdMiddleware('category'),
  verifyToken,
  checkPermission('view_features'),
  (req, res) => SupplierFeatureController.getFeaturesByCategory(req, res)
);

// Get supplier's features
router.get(
  '/supplier/:supplier_id',
  validateIdMiddleware('supplier_id'),
  verifyToken,
  checkPermission('view_features'),
  (req, res) => SupplierFeatureController.getSupplierFeatures(req, res)
);

// Get supplier's active features
router.get(
  '/supplier/:supplier_id/active',
  validateIdMiddleware('supplier_id'),
  verifyToken,
  checkPermission('view_features'),
  (req, res) => SupplierFeatureController.getActiveFeatures(req, res)
);

// Check specific feature for supplier
router.get(
  '/supplier/:supplier_id/check/:feature_key',
  validateIdMiddleware(['supplier_id', 'feature_key']),
  verifyToken,
  (req, res) => SupplierFeatureController.checkSupplierFeature(req, res)
);

module.exports = router;
