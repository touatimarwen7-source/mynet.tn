/**
 * 🕐 BACKUP SCHEDULER
 * Automatically runs backups on schedule (configurable)
 * Environment variables: BACKUP_SCHEDULE, BACKUP_ENABLED
 */

const schedule = require('node-schedule');
const BackupService = require('./BackupService');

class BackupScheduler {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
    this.schedulePattern = this.parseSchedule();
    this.isEnabled = (process.env.BACKUP_ENABLED !== 'false');
  }

  /**
   * Parse backup schedule from environment
   * BACKUP_SCHEDULE format: cron pattern (e.g., "0 2 * * *" = 2 AM daily)
   * Default: "0 2 * * *" (2:00 AM UTC daily)
   */
  parseSchedule() {
    const defaultSchedule = '0 2 * * *'; // 2 AM UTC daily
    
    if (process.env.BACKUP_SCHEDULE) {
      // Validate cron pattern (basic validation)
      const parts = process.env.BACKUP_SCHEDULE.split(' ');
      if (parts.length === 5) {
        return process.env.BACKUP_SCHEDULE;
      }
      console.warn('⚠️  Invalid BACKUP_SCHEDULE. Using default: 2 AM UTC daily');
    }
    
    return defaultSchedule;
  }

  /**
   * Convert cron pattern to human readable format
   */
  getScheduleDescription() {
    const patterns = {
      '0 2 * * *': 'Daily at 2:00 AM UTC',
      '0 0 * * *': 'Daily at 12:00 AM UTC (midnight)',
      '0 12 * * *': 'Daily at 12:00 PM UTC (noon)',
      '0 */6 * * *': 'Every 6 hours (0, 6, 12, 18)',
      '0 */12 * * *': 'Every 12 hours (0, 12)',
      '0 3 * * 0': 'Weekly on Sunday at 3:00 AM UTC',
      '0 3 * * 1': 'Weekly on Monday at 3:00 AM UTC'
    };
    return patterns[this.schedulePattern] || this.schedulePattern;
  }

  /**
   * Start scheduled backups
   */
  start() {
    try {
      if (!this.isEnabled) {
        console.log('⏸️  Backups disabled (BACKUP_ENABLED=false)');
        return;
      }

      // Schedule backup
      const backupJob = schedule.scheduleJob(this.schedulePattern, async () => {
        console.log('🔄 Scheduled backup job started');
        await this.performBackup();
      });

      this.jobs.push(backupJob);
      this.isRunning = true;

      console.log('✅ Backup scheduler started');
      console.log(`   Schedule: ${this.getScheduleDescription()}`);
      console.log(`   Pattern: ${this.schedulePattern}`);
      console.log('   Next backup:', backupJob.nextInvocation());
      console.log('   Tip: Set BACKUP_SCHEDULE env var to customize schedule');
      console.log('   Tip: Set BACKUP_ENABLED=false to disable backups');
    } catch (error) {
      console.error('❌ Failed to start backup scheduler:', error.message);
    }
  }

  /**
   * Perform backup operation
   */
  async performBackup() {
    try {
      console.log('📦 Performing scheduled backup...');
      const result = await BackupService.createBackup();

      if (result.success) {
        console.log(`✅ Scheduled backup completed: ${result.filename} (${result.size}MB)`);
      } else {
        console.error(`❌ Scheduled backup failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('❌ Backup error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    this.jobs.forEach(job => job.cancel());
    this.jobs = [];
    this.isRunning = false;
    console.log('🛑 Backup scheduler stopped');
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isEnabled: this.isEnabled,
      jobsCount: this.jobs.length,
      nextBackup: this.jobs.length > 0 ? this.jobs[0].nextInvocation() : null,
      schedule: this.getScheduleDescription(),
      pattern: this.schedulePattern,
      maxBackupsRetained: 30,
      configurable: true,
      environmentVariables: {
        BACKUP_SCHEDULE: 'Cron pattern (e.g., "0 2 * * *")',
        BACKUP_ENABLED: 'Set to "false" to disable backups'
      }
    };
  }
}

module.exports = new BackupScheduler();
