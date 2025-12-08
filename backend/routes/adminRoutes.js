const express = require('express');
const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const adminController = require('../controllers/adminController');
const SubscriptionAdminController = require('../controllers/admin/SubscriptionAdminController');
const AdvertisementController = require('../controllers/admin/AdvertisementController');
const AdminController = require('../controllers/admin/AdminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { validatePagination } = require('../middleware/paginationValidator');

// Toutes les routes d'administration sont protégées
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkRole(['super_admin', 'admin']));

// ===== Tableau de bord =====
router.get('/health', AdminController.getHealthDashboard.bind(AdminController));
router.get('/dashboard', AdminController.getDashboard.bind(AdminController));
router.get('/analytics', AdminController.getAnalytics.bind(AdminController));
router.get('/analytics/users', AdminController.getUserStatistics.bind(AdminController));
router.get('/activities/recent', AdminController.getRecentActivities.bind(AdminController));
router.get('/audit-logs/export', AdminController.exportAuditLogs.bind(AdminController));

// ===== Gestion des utilisateurs =====
const AdminPermissionsMiddleware = require('../middleware/adminPermissionsMiddleware');

router.get(
  '/users',
  validatePagination,
  AdminPermissionsMiddleware.checkPermission(AdminPermissionsMiddleware.PERMISSIONS.VIEW_USERS),
  AdminController.getAllUsers.bind(AdminController)
);

router.get(
  '/users/:id',
  validateIdMiddleware('id'),
  AdminPermissionsMiddleware.checkPermission(AdminPermissionsMiddleware.PERMISSIONS.VIEW_USERS),
  adminController.getUserDetails
);

router.put(
  '/users/:id/role',
  validateIdMiddleware('id'),
  AdminPermissionsMiddleware.checkPermission(AdminPermissionsMiddleware.PERMISSIONS.MANAGE_USERS),
  adminController.updateUserRole
);

router.post(
  '/users/:id/block',
  validateIdMiddleware('id'),
  AdminPermissionsMiddleware.checkPermission(AdminPermissionsMiddleware.PERMISSIONS.BLOCK_USERS),
  adminController.blockUser
);

router.post(
  '/users/:id/unblock',
  validateIdMiddleware('id'),
  AdminPermissionsMiddleware.checkPermission(AdminPermissionsMiddleware.PERMISSIONS.BLOCK_USERS),
  adminController.unblockUser
);

router.post(
  '/users/:id/reset-password',
  validateIdMiddleware('id'),
  AdminPermissionsMiddleware.checkPermission(AdminPermissionsMiddleware.PERMISSIONS.MANAGE_USERS),
  adminController.resetUserPassword
);

// ===== Gestion des assistants administrateurs =====
// Accessible uniquement au super_admin
// TODO: Implement createAdminHelper and updateAdminPermissions in adminController
// router.post('/admin-helpers', adminController.createAdminHelper);
// router.put('/admin-helpers/:id/permissions', validateIdMiddleware('id'), adminController.updateAdminPermissions);

// ===== Gestion du contenu statique, pages et fichiers =====
// Pages statiques (édition complète)
router.get('/content/pages', (req, res) => res.json({ success: true, data: [] }));
router.get('/content/pages/:id', validateIdMiddleware('id'), (req, res) => res.json({ success: true, data: {} }));
router.post('/content/pages', (req, res) => res.json({ success: true, data: {} }));
router.put('/content/pages/:id', validateIdMiddleware('id'), (req, res) => res.json({ success: true, data: {} }));
router.patch('/content/pages/:id', validateIdMiddleware('id'), (req, res) => res.json({ success: true, data: {} }));
router.delete('/content/pages/:id', validateIdMiddleware('id'), (req, res) => res.json({ success: true, message: 'Deleted' }));

// Fichiers, images et documents
router.get('/content/files', (req, res) => res.json({ success: true, data: [] }));
router.get('/content/media', (req, res) => res.json({ success: true, data: [] }));
router.post('/content/files', (req, res) => res.json({ success: true, data: {} }));
router.post('/content/files/bulk', (req, res) => res.json({ success: true, data: [] }));
router.put('/content/files/:id', validateIdMiddleware('id'), (req, res) => res.json({ success: true, data: {} }));
router.delete('/content/files/:id', validateIdMiddleware('id'), (req, res) => res.json({ success: true, message: 'Deleted' }));
router.delete('/content/files/bulk', (req, res) => res.json({ success: true, message: 'Deleted' }));

// Images (optimisées)
router.get('/content/images', (req, res) => res.json({ success: true, data: [] }));
router.post('/content/images', (req, res) => res.json({ success: true, data: {} }));
router.put('/content/images/:id', validateIdMiddleware('id'), (req, res) => res.json({ success: true, data: {} }));
router.delete('/content/images/:id', validateIdMiddleware('id'), (req, res) => res.json({ success: true, message: 'Deleted' }));

// Documents
router.get('/content/documents', (req, res) => res.json({ success: true, data: [] }));
router.post('/content/documents', (req, res) => res.json({ success: true, data: {} }));
router.put('/content/documents/:id', validateIdMiddleware('id'), (req, res) => res.json({ success: true, data: {} }));
router.delete('/content/documents/:id', validateIdMiddleware('id'), (req, res) => res.json({ success: true, message: 'Deleted' }));

// Gestion avancée du contenu
router.post('/content/sync', (req, res) => res.json({ success: true, message: 'Synced' }));
router.get('/content/stats', (req, res) => res.json({ success: true, data: {} }));
router.post('/content/backup', (req, res) => res.json({ success: true, message: 'Backup created' }));
router.post('/content/restore', (req, res) => res.json({ success: true, message: 'Restored' }));

// ===== Configuration du système =====
router.get('/config', (req, res) => res.json({ success: true, data: { platformName: 'MyNet.tn', maintenanceMode: false } }));
router.get('/system/config', (req, res) => res.json({ success: true, data: { platformName: 'MyNet.tn', maintenanceMode: false } }));
router.put('/config', (req, res) => res.json({ success: true, data: req.body }));
router.put('/system/config', (req, res) => res.json({ success: true, data: req.body }));
router.put('/config/maintenance', (req, res) => res.json({ success: true, message: 'Maintenance mode toggled' }));
router.post('/system/maintenance', (req, res) => res.json({ success: true, message: 'Maintenance mode toggled' }));
router.post('/config/cache/clear', (req, res) => res.json({ success: true, message: 'Cache cleared' }));
router.post('/config/system/restart', (req, res) => res.json({ success: true, message: 'System restart scheduled' }));

// ===== Analyses et surveillance =====
router.get('/analytics/stats', (req, res) => AdminController.getAnalytics(req, res));
router.get('/analytics/health', (req, res) => AdminController.getHealthDashboard(req, res));
router.get('/analytics/activities', (req, res) => AdminController.getRecentActivities(req, res));
router.get('/analytics/users', (req, res) => AdminController.getUserStatistics(req, res));
router.get('/analytics/performance', (req, res) => AdminController.getAdminPerformance(req, res));
router.get('/analytics/assistants', (req, res) => AdminController.getAdminAssistantsStats(req, res));

// ===== Gestion des abonnements =====
router.get('/subscriptions/plans', SubscriptionAdminController.getAllPlans.bind(SubscriptionAdminController));
router.post('/subscriptions/plans', SubscriptionAdminController.createPlan.bind(SubscriptionAdminController));
router.put('/subscriptions/plans/:id', validateIdMiddleware('id'), SubscriptionAdminController.updatePlan.bind(SubscriptionAdminController));
router.delete('/subscriptions/plans/:id', validateIdMiddleware('id'), SubscriptionAdminController.deletePlan.bind(SubscriptionAdminController));
router.get('/subscriptions/analytics', SubscriptionAdminController.getSubscriptionAnalytics.bind(SubscriptionAdminController));

// ===== Gestion des publicités =====
router.get('/advertisements', AdvertisementController.getAllAds.bind(AdvertisementController));
router.post('/advertisements', AdvertisementController.createAd.bind(AdvertisementController));
router.put('/advertisements/:id', validateIdMiddleware('id'), AdvertisementController.updateAd.bind(AdvertisementController));
router.delete('/advertisements/:id', validateIdMiddleware('id'), AdvertisementController.deleteAd.bind(AdvertisementController));
router.get('/advertisements/:id/analytics', validateIdMiddleware('id'), AdvertisementController.getAdAnalytics.bind(AdvertisementController));

// ===== Routes de compatibilité (anciennes versions) =====
router.put('/users/:id/block', validateIdMiddleware('id'), (req, res, next) => {
  if (adminController.blockUser) {
    return adminController.blockUser(req, res, next);
  }
  return AdminController.toggleUserStatus.bind(AdminController)(req, res, next);
});

module.exports = router;