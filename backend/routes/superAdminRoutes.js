const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * 🔐 SUPER ADMIN ROUTES
 * All routes require authentication and super_admin role
 */

// Middleware: Verify token and super_admin role
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkRole(['super_admin']));

// ===== 1. STATIC PAGES =====
router.get('/pages', superAdminController.listPages);
router.get('/pages/:id', superAdminController.getPage);
router.post('/pages', superAdminController.createPage);
router.put('/pages/:id', superAdminController.updatePage);
router.delete('/pages/:id', superAdminController.deletePage);

// ===== 2. FILE MANAGEMENT =====
router.get('/files', superAdminController.listFiles);
router.post('/files', superAdminController.uploadFile);
router.delete('/files/:id', superAdminController.deleteFile);

// ===== 3. DOCUMENT MANAGEMENT =====
router.get('/documents', superAdminController.listDocuments);
router.post('/documents', superAdminController.createDocument);
router.delete('/documents/:id', superAdminController.deleteDocument);

// ===== 4. EMAIL NOTIFICATIONS =====
router.get('/emails', superAdminController.listEmails);
router.post('/emails/send', superAdminController.sendEmail);

// ===== 5. USER MANAGEMENT =====
router.get('/users', superAdminController.listUsers);
router.put('/users/:id/role', superAdminController.updateUserRole);
router.post('/users/:id/block', superAdminController.blockUser);
router.post('/users/:id/unblock', superAdminController.unblockUser);

// ===== 6. AUDIT LOGS =====
router.get('/audit-logs', superAdminController.getAuditLogs);

// ===== 7. HEALTH MONITORING =====
router.get('/health', superAdminController.getSystemHealth);

// ===== 8. BACKUP & RESTORE =====
router.get('/backups', superAdminController.listBackups);
router.post('/backups/create', superAdminController.createBackup);
router.post('/backups/:id/restore', superAdminController.restoreBackup);

// ===== 9. SUBSCRIPTION PLANS =====
router.get('/subscription-plans', superAdminController.listSubscriptionPlans);
router.post('/subscription-plans', superAdminController.createSubscriptionPlan);
router.put('/subscription-plans/:id', superAdminController.updateSubscriptionPlan);
router.delete('/subscription-plans/:id', superAdminController.deleteSubscriptionPlan);

// ===== 10. FEATURE CONTROL =====
router.get('/features', superAdminController.listFeatures);
router.put('/features/:id/toggle', superAdminController.toggleFeature);

module.exports = router;
