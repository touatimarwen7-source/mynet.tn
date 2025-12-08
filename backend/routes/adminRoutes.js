const express = require('express');
const router = express.Router();
const { adminAuth, isSuperAdmin } = require('../middleware/adminMiddleware');
const { asyncHandler } = require('../middleware/errorHandlingMiddleware');
const { validateObjectId } = require('../middleware/validateIdMiddleware');

// Import controllers once
const AdminController = require('../controllers/admin/AdminController');
const SubscriptionAdminController = require('../controllers/admin/SubscriptionAdminController');
const AdvertisementController = require('../controllers/admin/AdvertisementController');

// Initialize controllers
const adminController = new AdminController();

// Validate asyncHandler is a function
if (typeof asyncHandler !== 'function') {
  throw new Error('asyncHandler must be a function');
}

// ============================================================================
// ADMIN ROUTES - Enhanced with Advanced Features
// ============================================================================

// Dashboard & Analytics
router.get('/dashboard', adminAuth, asyncHandler(adminController.getDashboard.bind(adminController)));

router.get('/dashboard/stats', adminAuth, asyncHandler(adminController.getDashboard.bind(adminController)));

router.get('/analytics', adminAuth, asyncHandler(adminController.getAnalytics.bind(adminController)));

router.get('/metrics', adminAuth, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  });
}));

router.get('/monitoring', adminAuth, asyncHandler(adminController.getHealthDashboard.bind(adminController)));

// ===== Gestion des utilisateurs =====
router.get('/users', adminAuth, asyncHandler(adminController.getAllUsers.bind(adminController)));

router.put('/users/:id/status', adminAuth, validateObjectId('id'), asyncHandler(adminController.toggleUserStatus.bind(adminController)));

// ===== Configuration du système =====
router.get('/config', adminAuth, asyncHandler(adminController.getPlatformConfig.bind(adminController)));
router.put('/config', adminAuth, asyncHandler(adminController.updatePlatformConfig.bind(adminController)));

// ===== Analyses et surveillance =====
router.get('/analytics/activities', adminAuth, asyncHandler(adminController.getRecentActivities.bind(adminController)));
router.get('/analytics/users', adminAuth, asyncHandler(adminController.getUserStatistics.bind(adminController)));
router.get('/analytics/performance', adminAuth, asyncHandler(adminController.getAdminPerformance.bind(adminController)));
router.get('/analytics/assistants', adminAuth, asyncHandler(adminController.getAdminAssistantsStats.bind(adminController)));

// ===== Gestion des abonnements =====
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

// ===== User Management Actions =====
router.get('/users/:userId', adminAuth, validateObjectId('userId'), asyncHandler(adminController.getUserDetails.bind(adminController)));
router.put('/users/:userId/role', adminAuth, validateObjectId('userId'), asyncHandler(adminController.updateUserRole.bind(adminController)));
router.post('/users/:userId/block', adminAuth, validateObjectId('userId'), asyncHandler(adminController.blockUser.bind(adminController)));
router.post('/users/:userId/unblock', adminAuth, validateObjectId('userId'), asyncHandler(adminController.unblockUser.bind(adminController)));
router.delete('/users/:userId', adminAuth, validateObjectId('userId'), asyncHandler(adminController.deleteUser.bind(adminController)));
router.post('/users/:userId/reset-password', adminAuth, validateObjectId('userId'), asyncHandler(adminController.resetUserPassword.bind(adminController)));

module.exports = router;