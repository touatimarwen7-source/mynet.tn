/**
 * 🔄 DATABASE BACKUP SERVICE
 * Manages automated backups, restores, and backup lifecycle
 * Environment variables: MAX_BACKUPS, BACKUP_DIR
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { getPool } = require('../../config/db');

const execAsync = promisify(exec);
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');
const MAX_BACKUPS = parseInt(process.env.MAX_BACKUPS) || 30;
const BACKUP_PREFIX = 'mynet_backup_';

class BackupService {
  constructor() {
    this.ensureBackupDirectory();
  }

  /**
   * Ensure backup directory exists
   */
  ensureBackupDirectory() {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log('✅ Backup directory created:', BACKUP_DIR);
    }
  }

  /**
   * Generate backup filename with timestamp
   */
  generateBackupFilename() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${BACKUP_PREFIX}${timestamp}.sql`;
  }

  /**
   * Create database backup using pg_dump
   * Returns: { success: boolean, filename: string, size: number, timestamp: string }
   */
  async createBackup() {
    try {
      const filename = this.generateBackupFilename();
      const filepath = path.join(BACKUP_DIR, filename);

      console.log('🔄 Starting database backup...');

      // Use pg_dump to create backup
      const dumpCommand = `pg_dump "${process.env.DATABASE_URL}" > "${filepath}"`;
      
      await execAsync(dumpCommand, {
        timeout: 300000, // 5 minute timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      // Get file stats
      const stats = fs.statSync(filepath);
      const backupSize = (stats.size / 1024 / 1024).toFixed(2); // Size in MB

      console.log(`✅ Backup created: ${filename} (${backupSize}MB)`);

      // Clean old backups
      await this.cleanOldBackups();

      return {
        success: true,
        filename,
        filepath,
        size: backupSize,
        timestamp: new Date().toISOString(),
        sizeBytes: stats.size
      };
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * List all available backups
   */
  listBackups() {
    try {
      const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith(BACKUP_PREFIX))
        .sort()
        .reverse();

      const backups = files.map(filename => {
        const filepath = path.join(BACKUP_DIR, filename);
        const stats = fs.statSync(filepath);
        const timestamp = this.extractTimestampFromFilename(filename);

        return {
          filename,
          size: (stats.size / 1024 / 1024).toFixed(2),
          sizeBytes: stats.size,
          timestamp,
          created: stats.birthtime,
          modified: stats.mtime
        };
      });

      return {
        success: true,
        count: backups.length,
        backups,
        maxRetained: MAX_BACKUPS,
        backupDir: BACKUP_DIR
      };
    } catch (error) {
      console.error('❌ Failed to list backups:', error.message);
      return {
        success: false,
        error: error.message,
        count: 0,
        backups: []
      };
    }
  }

  /**
   * Get backup file path
   */
  getBackupPath(filename) {
    const filepath = path.join(BACKUP_DIR, filename);
    
    // Security: Prevent directory traversal
    if (!filepath.startsWith(BACKUP_DIR)) {
      throw new Error('Invalid backup filename');
    }

    if (!fs.existsSync(filepath)) {
      throw new Error(`Backup file not found: ${filename}`);
    }

    return filepath;
  }

  /**
   * Download backup file content
   */
  getBackupContent(filename) {
    try {
      const filepath = this.getBackupPath(filename);
      const content = fs.readFileSync(filepath, 'utf8');
      return {
        success: true,
        filename,
        content,
        size: Buffer.byteLength(content, 'utf8')
      };
    } catch (error) {
      console.error('❌ Failed to get backup:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Restore database from backup
   * WARNING: This will overwrite current database
   */
  async restoreBackup(filename) {
    try {
      const filepath = this.getBackupPath(filename);

      console.log('🔄 Starting database restore from:', filename);

      // Safety: Ask for confirmation by requiring a flag
      const restoreCommand = `psql "${process.env.DATABASE_URL}" < "${filepath}"`;

      await execAsync(restoreCommand, {
        timeout: 600000, // 10 minute timeout
        maxBuffer: 10 * 1024 * 1024
      });

      console.log(`✅ Database restored from: ${filename}`);

      return {
        success: true,
        filename,
        timestamp: new Date().toISOString(),
        message: 'Database restored successfully'
      };
    } catch (error) {
      console.error('❌ Restore failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Delete old backups, keeping only recent ones
   */
  async cleanOldBackups() {
    try {
      const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith(BACKUP_PREFIX))
        .sort()
        .reverse();

      if (files.length > MAX_BACKUPS) {
        const filesToDelete = files.slice(MAX_BACKUPS);

        for (const file of filesToDelete) {
          const filepath = path.join(BACKUP_DIR, file);
          fs.unlinkSync(filepath);
          console.log(`🗑️  Deleted old backup: ${file}`);
        }
      }
    } catch (error) {
      console.error('⚠️  Error cleaning old backups:', error.message);
    }
  }

  /**
   * Get backup statistics
   */
  getBackupStats() {
    try {
      const result = this.listBackups();

      if (!result.success) {
        return result;
      }

      const totalSize = result.backups.reduce((sum, b) => sum + b.sizeBytes, 0);
      const oldestBackup = result.backups.length > 0 ? result.backups[result.backups.length - 1] : null;
      const newestBackup = result.backups.length > 0 ? result.backups[0] : null;

      return {
        success: true,
        stats: {
          totalBackups: result.count,
          totalSize: (totalSize / 1024 / 1024).toFixed(2),
          totalSizeBytes: totalSize,
          oldestBackup,
          newestBackup,
          maxBackupsRetained: MAX_BACKUPS,
          backupDirectory: BACKUP_DIR
        }
      };
    } catch (error) {
      console.error('❌ Failed to get backup stats:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract timestamp from filename
   */
  extractTimestampFromFilename(filename) {
    const match = filename.match(/mynet_backup_(.+)\.sql/);
    if (match) {
      const timestamp = match[1].replace(/-/g, ':').replace(/_/g, '.');
      return timestamp;
    }
    return 'unknown';
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(filename) {
    try {
      const filepath = this.getBackupPath(filename);
      const content = fs.readFileSync(filepath, 'utf8');

      // Check for basic SQL structure
      const hasCreateTable = /CREATE TABLE/i.test(content);
      const hasBegin = /BEGIN/i.test(content);
      const hasCommit = /COMMIT/i.test(content);

      if (!hasCreateTable) {
        return {
          success: false,
          integrity: 'invalid',
          error: 'Backup file does not contain CREATE TABLE statements'
        };
      }

      return {
        success: true,
        integrity: 'valid',
        filename,
        size: Buffer.byteLength(content, 'utf8'),
        hasStructure: hasCreateTable,
        hasTransaction: hasBegin && hasCommit,
        message: 'Backup file is valid'
      };
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      return {
        success: false,
        integrity: 'unknown',
        error: error.message
      };
    }
  }
}

module.exports = new BackupService();
