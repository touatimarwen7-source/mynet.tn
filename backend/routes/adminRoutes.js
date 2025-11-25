const express = require('express');
const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// جميع مسارات الإدارة محمية - admin و super_admin
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkRole(['admin', 'super_admin']));

// ===== لوحة التحكم =====
router.get('/health', adminController.getHealthDashboard);
router.get('/dashboard', adminController.getDashboard);
router.get('/audit-logs/export', adminController.exportAuditLogs);

// ===== إدارة المستخدمين =====
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', validateIdMiddleware('id'), adminController.getUserDetails);
router.put('/users/:id/role', validateIdMiddleware('id'), adminController.updateUserRole);
router.post('/users/:id/block', validateIdMiddleware('id'), adminController.blockUser);
router.post('/users/:id/unblock', adminController.unblockUser);
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// ===== إدارة المحتوى الثابت والصفحات والملفات =====
// الصفحات الثابتة (تحرير كامل)
router.get('/content/pages', adminController.getAllPages);
router.get('/content/pages/:id', validateIdMiddleware('id'), adminController.getPageById);
router.post('/content/pages', adminController.createPage);
router.put('/content/pages/:id', validateIdMiddleware('id'), adminController.updatePage);
router.patch('/content/pages/:id', validateIdMiddleware('id'), adminController.updatePagePartial);
router.delete('/content/pages/:id', validateIdMiddleware('id'), adminController.deletePage);

// الملفات والصور والوثائق
router.get('/content/files', adminController.getAllFiles);
router.get('/content/media', adminController.getAllMedia);
router.post('/content/files', adminController.uploadFile);
router.post('/content/files/bulk', adminController.uploadBulkFiles);
router.put('/content/files/:id', validateIdMiddleware('id'), adminController.updateFileMetadata);
router.delete('/content/files/:id', validateIdMiddleware('id'), adminController.deleteFile);
router.delete('/content/files/bulk', adminController.deleteBulkFiles);

// الصور (محسّنة)
router.get('/content/images', adminController.getAllImages);
router.post('/content/images', adminController.uploadImage);
router.put('/content/images/:id', validateIdMiddleware('id'), adminController.updateImage);
router.delete('/content/images/:id', validateIdMiddleware('id'), adminController.deleteImage);

// الوثائق والمستندات
router.get('/content/documents', adminController.getAllDocuments);
router.post('/content/documents', adminController.uploadDocument);
router.put('/content/documents/:id', validateIdMiddleware('id'), adminController.updateDocument);
router.delete('/content/documents/:id', validateIdMiddleware('id'), adminController.deleteDocument);

// إدارة المحتوى المتقدمة
router.post('/content/sync', adminController.syncContent);
router.get('/content/stats', adminController.getContentStats);
router.post('/content/backup', adminController.backupContent);
router.post('/content/restore', adminController.restoreContent);

// ===== إعدادات النظام =====
router.get('/config', adminController.getSystemConfig);
router.get('/system/config', adminController.getSystemConfig);
router.put('/config', adminController.updateSystemConfig);
router.put('/system/config', adminController.updateSystemConfig);
router.put('/config/maintenance', adminController.toggleMaintenance);
router.post('/system/maintenance', adminController.toggleMaintenance);
router.post('/config/cache/clear', adminController.clearCache);
router.post('/config/system/restart', adminController.restartSystem);

// ===== التحليلات والمراقبة =====
router.get('/analytics/stats', adminController.getAnalyticsStats);
router.get('/analytics/health', adminController.getHealthDashboard);
router.get('/analytics/activities', adminController.getRecentActivities);
router.get('/analytics/users', adminController.getUserStatistics);

// ===== نسخة احتياطية من المسارات القديمة =====
router.put('/users/:id/block', validateIdMiddleware('id'), adminController.blockUser);

module.exports = router;
