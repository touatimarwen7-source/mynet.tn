const express = require('express');
const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { errorResponse } = require('../middleware/errorResponseFormatter');
const { validatePagination } = require('../middleware/paginationValidator');


// Toutes les routes d'administration sont protégées - super_admin uniquement
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkRole(['super_admin']));

// ===== Tableau de bord =====
router.get('/health', adminController.getHealthDashboard);
router.get('/dashboard', adminController.getDashboard);
router.get('/analytics', adminController.getAnalytics);
router.get('/analytics/users', adminController.getUserStatistics);
router.get('/activities/recent', adminController.getRecentActivities);
router.get('/audit-logs/export', adminController.exportAuditLogs);

// ===== Gestion des utilisateurs =====
router.get('/users', validatePagination, adminController.getAllUsers);
router.get('/users/:id', validateIdMiddleware('id'), adminController.getUserDetails);
router.put('/users/:id/role', validateIdMiddleware('id'), adminController.updateUserRole);
router.post('/users/:id/block', validateIdMiddleware('id'), adminController.blockUser);
router.post('/users/:id/unblock', validateIdMiddleware('id'), adminController.unblockUser);
router.post(
  '/users/:id/reset-password',
  validateIdMiddleware('id'),
  adminController.resetUserPassword
);

// ===== Gestion des assistants administrateurs =====
// Accessible uniquement au super_admin
// TODO: Implement createAdminHelper and updateAdminPermissions in adminController
// router.post('/admin-helpers', adminController.createAdminHelper);
// router.put('/admin-helpers/:id/permissions', validateIdMiddleware('id'), adminController.updateAdminPermissions);

// ===== Gestion du contenu statique, pages et fichiers =====
// Pages statiques (édition complète)
router.get('/content/pages', adminController.getAllPages);
router.get('/content/pages/:id', validateIdMiddleware('id'), adminController.getPageById);
router.post('/content/pages', adminController.createPage);
router.put('/content/pages/:id', validateIdMiddleware('id'), adminController.updatePage);
router.patch('/content/pages/:id', validateIdMiddleware('id'), adminController.updatePagePartial);
router.delete('/content/pages/:id', validateIdMiddleware('id'), adminController.deletePage);

// Fichiers, images et documents
router.get('/content/files', adminController.getAllFiles);
router.get('/content/media', adminController.getAllMedia);
router.post('/content/files', adminController.uploadFile);
router.post('/content/files/bulk', adminController.uploadBulkFiles);
router.put('/content/files/:id', validateIdMiddleware('id'), adminController.updateFileMetadata);
router.delete('/content/files/:id', validateIdMiddleware('id'), adminController.deleteFile);
router.delete('/content/files/bulk', adminController.deleteBulkFiles);

// Images (optimisées)
router.get('/content/images', adminController.getAllImages);
router.post('/content/images', adminController.uploadImage);
router.put('/content/images/:id', validateIdMiddleware('id'), adminController.updateImage);
router.delete('/content/images/:id', validateIdMiddleware('id'), adminController.deleteImage);

// Documents
router.get('/content/documents', adminController.getAllDocuments);
router.post('/content/documents', adminController.uploadDocument);
router.put('/content/documents/:id', validateIdMiddleware('id'), adminController.updateDocument);
router.delete('/content/documents/:id', validateIdMiddleware('id'), adminController.deleteDocument);

// Gestion avancée du contenu
router.post('/content/sync', adminController.syncContent);
router.get('/content/stats', adminController.getContentStats);
router.post('/content/backup', adminController.backupContent);
router.post('/content/restore', adminController.restoreContent);

// ===== Configuration du système =====
router.get('/config', adminController.getSystemConfig);
router.get('/system/config', adminController.getSystemConfig);
router.put('/config', adminController.updateSystemConfig);
router.put('/system/config', adminController.updateSystemConfig);
router.put('/config/maintenance', adminController.toggleMaintenance);
router.post('/system/maintenance', adminController.toggleMaintenance);
router.post('/config/cache/clear', adminController.clearCache);
router.post('/config/system/restart', adminController.restartSystem);

// ===== Analyses et surveillance =====
router.get('/analytics/stats', adminController.getAnalyticsStats);
router.get('/analytics/health', adminController.getHealthDashboard);
router.get('/analytics/activities', adminController.getRecentActivities);
router.get('/analytics/users', adminController.getUserStatistics);

// ===== Routes de compatibilité (anciennes versions) =====
router.put('/users/:id/block', validateIdMiddleware('id'), adminController.blockUser);

module.exports = router;