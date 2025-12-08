/**
 * 🔄 BACKUP MANAGEMENT API
 * Endpoints for managing database backups
 */

const express = require('express');
const router = express.Router();
const BackupService = require('../services/backup/BackupService');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { asyncHandler } = require('../middleware/errorHandlingMiddleware');
const { validationMiddleware } = require('../middleware/validationMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Apply validation middleware to all routes
router.use(validationMiddleware);

// Verify super admin role
const verifySuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ error: 'Only super admins can access backups' });
  }
};

/**
 * GET /api/backups/list
 * List all available backups
 * @summary Retrieves a list of all available backups.
 * @security BearerAuth
 * @return {object} 200 - A list of backups.
 * @return {object} 401 - Unauthorized.
 * @return {object} 403 - Forbidden.
 * @return {object} 500 - Internal Server Error.
 */
router.get(
  '/list',
  authMiddleware.verifyToken,
  verifySuperAdmin,
  asyncHandler(async (req, res) => {
    try {
      const result = BackupService.listBackups();
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error listing backups:', error);
      // Assuming errorResponse is a helper function defined elsewhere
      // return errorResponse(res, error.message, 500, 'LIST_BACKUPS_FAILED');
      res.status(500).json({ success: false, message: 'LIST_BACKUPS_FAILED', error: error.message });
    }
  })
);

/**
 * GET /api/backups/stats
 * Get backup statistics
 * @summary Retrieves statistics about the backups.
 * @security BearerAuth
 * @return {object} 200 - Backup statistics.
 * @return {object} 401 - Unauthorized.
 * @return {object} 403 - Forbidden.
 * @return {object} 400 - Bad Request.
 */
router.get(
  '/stats',
  authMiddleware.verifyToken,
  verifySuperAdmin,
  asyncHandler(async (req, res) => {
    const result = BackupService.getBackupStats();
    res.status(result.success ? 200 : 400).json(result);
  })
);

/**
 * GET /api/backups/scheduler/status
 * Get backup scheduler status
 * @summary Retrieves the status of the backup scheduler.
 * @security BearerAuth
 * @return {object} 200 - Scheduler status.
 * @return {object} 401 - Unauthorized.
 * @return {object} 403 - Forbidden.
 */
router.get(
  '/scheduler/status',
  authMiddleware.verifyToken,
  verifySuperAdmin,
  asyncHandler(async (req, res) => {
    const BackupScheduler = require('../services/backup/BackupScheduler');
    const status = BackupScheduler.getStatus();
    res.status(200).json({
      success: true,
      scheduler: status,
    });
  })
);

/**
 * POST /api/backups/create
 * Create manual backup
 * @summary Initiates a manual backup process.
 * @security BearerAuth
 * @param {object} request.body - Empty body.
 * @return {object} 200 - Backup created successfully.
 * @return {object} 400 - Bad Request.
 * @return {object} 401 - Unauthorized.
 * @return {object} 403 - Forbidden.
 * @return {object} 500 - Internal Server Error.
 */
router.post(
  '/create',
  authMiddleware.verifyToken,
  verifySuperAdmin,
  asyncHandler(async (req, res) => {
    try {
      const result = await BackupService.createBackup();
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error creating backup:', error);
      // Assuming errorResponse is a helper function defined elsewhere
      // return errorResponse(res, error.message, 500, 'CREATE_BACKUP_FAILED');
      res.status(500).json({ success: false, message: 'CREATE_BACKUP_FAILED', error: error.message });
    }
  })
);

/**
 * POST /api/backups/verify/:filename
 * Verify backup file integrity
 * @summary Verifies the integrity of a specific backup file.
 * @security BearerAuth
 * @param {string} filename - The name of the backup file to verify.
 * @return {object} 200 - Verification successful.
 * @return {object} 400 - Bad Request.
 * @return {object} 401 - Unauthorized.
 * @return {object} 403 - Forbidden.
 */
router.post(
  '/verify/:filename',
  authMiddleware.verifyToken,
  verifySuperAdmin,
  validateIdMiddleware, // Assuming filename is a valid ID
  asyncHandler(async (req, res) => {
    const { filename } = req.params;
    const result = await BackupService.verifyBackup(filename);
    res.status(result.success ? 200 : 400).json(result);
  })
);

/**
 * GET /api/backups/download/:filename
 * Download backup file
 * @summary Downloads a specific backup file.
 * @security BearerAuth
 * @param {string} filename - The name of the backup file to download.
 * @return {file} 200 - The backup file.
 * @return {object} 400 - Bad Request.
 * @return {object} 401 - Unauthorized.
 * @return {object} 403 - Forbidden.
 * @return {object} 404 - Not Found.
 */
router.get(
  '/download/:filename',
  authMiddleware.verifyToken,
  verifySuperAdmin,
  validateIdMiddleware, // Assuming filename is a valid ID
  asyncHandler(async (req, res) => {
    const { filename } = req.params;

    try {
      const filepath = BackupService.getBackupPath(filename);
      res.download(filepath, filename);
    } catch (error) {
      console.error('Error downloading backup:', error);
      res.status(400).json({ error: error.message });
    }
  })
);

/**
 * POST /api/backups/restore/:filename
 * Restore database from backup
 * WARNING: This will overwrite current database!
 * Requires explicit confirmation flag
 * @summary Restores the database from a specific backup file.
 * @security BearerAuth
 * @param {string} filename - The name of the backup file to restore from.
 * @param {object} request.body - Request body containing confirmation.
 * @param {boolean} request.body.confirm - Explicit confirmation required to proceed with the restore.
 * @return {object} 200 - Restore successful.
 * @return {object} 400 - Bad Request (e.g., confirmation missing or invalid).
 * @return {object} 401 - Unauthorized.
 * @return {object} 403 - Forbidden.
 * @return {object} 500 - Internal Server Error.
 */
router.post(
  '/restore/:filename',
  authMiddleware.verifyToken,
  verifySuperAdmin,
  validateIdMiddleware, // Assuming filename is a valid ID
  asyncHandler(async (req, res) => {
    const { filename } = req.params;
    const { confirm } = req.body;

    // Require explicit confirmation
    if (confirm !== true) {
      return res.status(400).json({
        error: 'Restore requires explicit confirmation',
        warning: 'This operation will overwrite the current database',
        example: { confirm: true },
      });
    }

    try {
      const result = await BackupService.restoreBackup(filename);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error restoring backup:', error);
      // Assuming errorResponse is a helper function defined elsewhere
      // return errorResponse(res, error.message, 500, 'RESTORE_BACKUP_FAILED');
      res.status(500).json({ success: false, message: 'RESTORE_BACKUP_FAILED', error: error.message });
    }
  })
);

/**
 * DELETE /api/backups/:filename
 * Delete backup file
 * @summary Deletes a specific backup file.
 * @security BearerAuth
 * @param {string} filename - The name of the backup file to delete.
 * @return {object} 200 - Backup deleted successfully.
 * @return {object} 400 - Bad Request (e.g., invalid filename).
 * @return {object} 401 - Unauthorized.
 * @return {object} 403 - Forbidden.
 * @return {object} 404 - Not Found.
 * @return {object} 500 - Internal Server Error.
 */
router.delete(
  '/:filename',
  authMiddleware.verifyToken,
  verifySuperAdmin,
  validateIdMiddleware, // Assuming filename is a valid ID
  asyncHandler(async (req, res) => {
    const { filename } = req.params;

    try {
      const fs = require('fs');
      const path = require('path');
      const BACKUP_DIR = path.join(__dirname, '../backups');
      const filepath = path.join(BACKUP_DIR, filename);

      // Security: Prevent directory traversal
      if (!filepath.startsWith(BACKUP_DIR)) {
        return res.status(400).json({ error: 'Invalid backup filename' });
      }

      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'Backup not found' });
      }

      fs.unlinkSync(filepath);

      res.json({
        success: true,
        message: 'Backup deleted',
        filename,
      });
    } catch (error) {
      console.error('Error deleting backup:', error);
      // Assuming errorResponse is a helper function defined elsewhere
      // return errorResponse(res, error.message, 500, 'DELETE_BACKUP_FAILED');
      res.status(500).json({ success: false, message: 'DELETE_BACKUP_FAILED', error: error.message });
    }
  })
);

module.exports = router;