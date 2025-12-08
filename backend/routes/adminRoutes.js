const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin/AdminController');
const { adminAuth, isSuperAdmin } = require('../middleware/adminMiddleware');
const { asyncHandler } = require('../middleware/errorHandlingMiddleware');
const { validateObjectId } = require('../middleware/validateIdMiddleware');
const { adminPermissions } = require('../middleware/adminPermissionsMiddleware');

// Create AdminController instance
const adminController = new AdminController();

// ============================================================================
// ADMIN ROUTES - Enhanced with Advanced Features
// ============================================================================

// Dashboard & Analytics
router.get('/dashboard', adminAuth, asyncHandler(adminController.getDashboard.bind(adminController)));
router.get('/dashboard/stats', adminAuth, asyncHandler(adminController.getHealthDashboard.bind(adminController)));
router.get('/analytics', adminAuth, asyncHandler(adminController.getAnalytics.bind(adminController)));
router.get('/metrics', adminAuth, asyncHandler(adminController.getAdminPerformance.bind(adminController)));
router.get('/monitoring', adminAuth, asyncHandler(adminController.getHealthDashboard.bind(adminController)));

// ===== Gestion des utilisateurs =====
router.get(
  '/users',
  adminAuth,
  asyncHandler(adminController.getAllUsers.bind(adminController))
);

router.put(
  '/users/:id/status',
  adminAuth,
  validateObjectId('id'),
  asyncHandler(adminController.toggleUserStatus.bind(adminController))
);

// Content management routes removed - not implemented in AdminController

// ===== Configuration du système =====
router.get('/config', adminAuth, asyncHandler(adminController.getPlatformConfig.bind(adminController)));
router.put('/config', adminAuth, asyncHandler(adminController.updatePlatformConfig.bind(adminController)));

// ===== Analyses et surveillance =====
router.get('/analytics/activities', adminAuth, asyncHandler((req, res) => adminController.getRecentActivities(req, res)));
router.get('/analytics/users', adminAuth, asyncHandler((req, res) => adminController.getUserStatistics(req, res)));
router.get('/analytics/performance', adminAuth, asyncHandler((req, res) => adminController.getAdminPerformance(req, res)));
router.get('/analytics/assistants', adminAuth, asyncHandler((req, res) => adminController.getAdminAssistantsStats(req, res)));

// ===== Gestion des abonnements =====
// Assuming SubscriptionAdminController and AdvertisementController are injected or managed appropriately
// For now, keeping direct instantiation/requiring, but ideally injected via DI.
const SubscriptionAdminController = require('../controllers/admin/SubscriptionAdminController');
const AdvertisementController = require('../controllers/admin/AdvertisementController');

router.get('/subscriptions/plans', adminAuth, asyncHandler(SubscriptionAdminController.getAllPlans));
router.post('/subscriptions/plans', adminAuth, asyncHandler(SubscriptionAdminController.createPlan));
router.put('/subscriptions/plans/:id', adminAuth, validateObjectId('id'), asyncHandler(SubscriptionAdminController.updatePlan));
router.delete('/subscriptions/plans/:id', adminAuth, validateObjectId('id'), asyncHandler(SubscriptionAdminController.deletePlan));
router.get('/subscriptions/analytics', adminAuth, asyncHandler(SubscriptionAdminController.getSubscriptionAnalytics));

// ===== Gestion des publicités =====
router.get('/advertisements', adminAuth, asyncHandler(AdvertisementController.getAllAds));
router.post('/advertisements', adminAuth, asyncHandler(AdvertisementController.createAd));
router.put('/advertisements/:id', adminAuth, validateObjectId('id'), asyncHandler(AdvertisementController.updateAd));
router.delete('/advertisements/:id', adminAuth, validateObjectId('id'), asyncHandler(AdvertisementController.deleteAd));
router.get('/advertisements/:id/analytics', adminAuth, validateObjectId('id'), asyncHandler(AdvertisementController.getAdAnalytics));

// ===== Audit logs export =====
router.get('/audit/export', adminAuth, asyncHandler(adminController.exportAuditLogs.bind(adminController)));

module.exports = router;