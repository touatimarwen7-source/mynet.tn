const express = require('express');
const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const superAdminController = require('../controllers/superAdminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// File upload middleware
let upload;
try {
  const multer = require('multer');
  upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
  }).single('file');
} catch (e) {
  upload = (req, res, next) => next();
}

/**
 * 🔐 SUPER ADMIN ROUTES
 * All routes require authentication and super_admin role
 * Protected by comprehensive admin middleware suite
 */

// Middleware: Verify token and super_admin role
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkRole(['super_admin']));

// Admin-specific middleware stack
router.use(adminMiddleware.adminLimiter);                    // Rate limiting
router.use(adminMiddleware.validateQueryParams);            // Query validation
router.use(adminMiddleware.validateAdminInput);             // Input sanitization
router.use(adminMiddleware.protectSensitiveData);           // Sensitive data protection
router.use(adminMiddleware.logAdminAction);                 // Audit logging
router.use(adminMiddleware.concurrentRequestLimiter());     // Concurrent request limit

// ===== 1. STATIC PAGES =====
router.get('/pages', superAdminController.listPages);
router.get('/pages/:id', validateIdMiddleware('id'), superAdminController.getPage);
router.post('/pages', superAdminController.createPage);
router.put('/pages/:id', validateIdMiddleware('id'), superAdminController.updatePage);
router.delete('/pages/:id', validateIdMiddleware('id'), superAdminController.deletePage);

// ===== 2. FILE MANAGEMENT =====
router.get('/files', superAdminController.listFiles);
router.post('/files', 
  adminMiddleware.adminFileUploadLimiter,
  upload, 
  adminMiddleware.validateFileUpload,
  superAdminController.uploadFile
);
router.delete('/files/:id', validateIdMiddleware('id'), adminMiddleware.adminMutationLimiter, superAdminController.deleteFile);

// ===== 3. DOCUMENT MANAGEMENT =====
router.get('/documents', superAdminController.listDocuments);
router.post('/documents', superAdminController.createDocument);
router.delete('/documents/:id', validateIdMiddleware('id'), superAdminController.deleteDocument);

// ===== 4. EMAIL NOTIFICATIONS =====
router.get('/emails', superAdminController.listEmails);
router.post('/emails/send', superAdminController.sendEmail);

// ===== 5. USER MANAGEMENT =====
router.get('/users', superAdminController.listUsers);
router.put('/users/:id/role', validateIdMiddleware('id'), adminMiddleware.adminMutationLimiter, superAdminController.updateUserRole);
router.post('/users/:id/block', validateIdMiddleware('id'), adminMiddleware.adminMutationLimiter, superAdminController.blockUser);
router.post('/users/:id/unblock', adminMiddleware.adminMutationLimiter, superAdminController.unblockUser);

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
router.put('/subscription-plans/:id', validateIdMiddleware('id'), superAdminController.updateSubscriptionPlan);
router.delete('/subscription-plans/:id', validateIdMiddleware('id'), superAdminController.deleteSubscriptionPlan);

// ===== 10. FEATURE CONTROL =====
router.get('/features', superAdminController.listFeatures);
router.put('/features/:id/toggle', validateIdMiddleware('id'), superAdminController.toggleFeature);

module.exports = router;
