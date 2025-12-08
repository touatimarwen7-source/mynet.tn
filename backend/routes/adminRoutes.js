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

// ============================================================================
// ADMIN ROUTES - Enhanced with Advanced Features
// ============================================================================

// Dashboard & Analytics
router.get('/dashboard', adminAuth, asyncHandler((req, res) => 
  adminController.getDashboard(req, res)
));

router.get('/dashboard/stats', adminAuth, asyncHandler((req, res) => 
  adminController.getHealthDashboard(req, res)
));

router.get('/analytics', adminAuth, asyncHandler((req, res) => 
  adminController.getAnalytics(req, res)
));

router.get('/metrics', adminAuth, asyncHandler((req, res) => 
  adminController.getAdminPerformance(req, res)
));

router.get('/monitoring', adminAuth, asyncHandler((req, res) => 
  adminController.getHealthDashboard(req, res)
));

// ===== Gestion des utilisateurs =====
router.get('/users', adminAuth, asyncHandler((req, res) => 
  adminController.getAllUsers(req, res)
));

router.put('/users/:id/status', adminAuth, validateObjectId('id'), asyncHandler((req, res) => 
  adminController.toggleUserStatus(req, res)
));

// ===== Configuration du système =====
router.get('/config', adminAuth, asyncHandler((req, res) => 
  adminController.getPlatformConfig(req, res)
));

router.put('/config', adminAuth, asyncHandler((req, res) => 
  adminController.updatePlatformConfig(req, res)
));

// ===== Analyses et surveillance =====
router.get('/analytics/activities', adminAuth, asyncHandler((req, res) => 
  adminController.getRecentActivities(req, res)
));

router.get('/analytics/users', adminAuth, asyncHandler((req, res) => 
  adminController.getUserStatistics(req, res)
));

router.get('/analytics/performance', adminAuth, asyncHandler((req, res) => 
  adminController.getAdminPerformance(req, res)
));

router.get('/analytics/assistants', adminAuth, asyncHandler((req, res) => 
  adminController.getAdminAssistantsStats(req, res)
));

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
router.get('/audit/export', adminAuth, asyncHandler((req, res) => 
  adminController.exportAuditLogs(req, res)
));

// ===== User Management Actions =====
router.get('/users/:userId', adminAuth, validateObjectId('userId'), asyncHandler((req, res) => 
  adminController.getUserDetails(req, res)
));

router.put('/users/:userId/role', adminAuth, validateObjectId('userId'), asyncHandler((req, res) => 
  adminController.updateUserRole(req, res)
));

router.post('/users/:userId/block', adminAuth, validateObjectId('userId'), asyncHandler((req, res) => 
  adminController.blockUser(req, res)
));

router.post('/users/:userId/unblock', adminAuth, validateObjectId('userId'), asyncHandler((req, res) => 
  adminController.unblockUser(req, res)
));

router.delete('/users/:userId', adminAuth, validateObjectId('userId'), asyncHandler((req, res) => 
  adminController.deleteUser(req, res)
));

router.post('/users/:userId/reset-password', adminAuth, validateObjectId('userId'), asyncHandler((req, res) => 
  adminController.resetUserPassword(req, res)
));

module.exports = router;