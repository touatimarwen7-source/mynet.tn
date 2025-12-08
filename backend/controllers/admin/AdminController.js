const UserService = require('../../services/UserService');
const SearchService = require('../../services/SearchService');
const AdvancedAdminService = require('../../services/AdvancedAdminService');
const PlatformConfigService = require('../../services/PlatformConfigService');

class AdminController {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboard(req, res) {
    try {
      const [statistics, health, insights] = await Promise.all([
        AdvancedAdminService.getPlatformStatistics(),
        AdvancedAdminService.getSystemHealth(),
        AdvancedAdminService.getUserInsights()
      ]);

      res.status(200).json({
        success: true,
        data: {
          statistics,
          health,
          insights
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get system health dashboard
   */
  async getHealthDashboard(req, res) {
    try {
      const health = await AdvancedAdminService.getSystemHealth();

      res.status(200).json({
        success: true,
        data: health
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get activity timeline
   */
  async getRecentActivities(req, res) {
    try {
      // التحقق من الصلاحيات
      if (!req.user || !['super_admin', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized access'
        });
      }

      // Validation des paramètres
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const offset = Math.max(parseInt(req.query.offset) || 0, 0);

      const filters = {
        limit,
        offset,
        userId: req.query.userId ? parseInt(req.query.userId) : undefined,
        actionType: req.query.actionType,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      // التحقق من التواريخ
      if (filters.startDate && !Date.parse(filters.startDate)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid startDate format'
        });
      }

      if (filters.endDate && !Date.parse(filters.endDate)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid endDate format'
        });
      }

      const timeline = await AdvancedAdminService.getActivityTimeline(filters);

      res.status(200).json({
        success: true,
        data: timeline,
        meta: {
          limit,
          offset,
          total: timeline.pagination?.total || 0
        }
      });
    } catch (error) {
      logger.error('Error fetching activities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch activities'
      });
    }
  }

  /**
   * Get predictive analytics
   */
  async getAnalytics(req, res) {
    try {
      const analytics = await AdvancedAdminService.getPredictiveAnalytics();

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(req, res) {
    try {
      const insights = await AdvancedAdminService.getUserInsights();

      res.status(200).json({
        success: true,
        data: insights
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(req, res) {
    try {
      const { format = 'json', startDate, endDate } = req.query;

      const timeline = await AdvancedAdminService.getActivityTimeline({
        limit: 10000,
        startDate,
        endDate
      });

      if (format === 'csv') {
        const csv = this._convertToCSV(timeline.activities);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
        res.send(csv);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.json"`);
        res.json(timeline.activities);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  _convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  async getAllUsers(req, res) {
    try {
      const filters = {
        role: req.query.role,
        is_verified: req.query.is_verified,
      };

      const users = await UserService.getAllUsers(filters);

      res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  async getStatistics(req, res) {
    try {
      const stats = await SearchService.getStatistics();

      res.status(200).json({
        success: true,
        statistics: stats,
      });
    } catch (error) {
      const { errorResponse } = require('../../middleware/errorResponseFormatter');
      errorResponse(res, error, 'Error fetching statistics');
    }
  }

  async verifyUser(req, res) {
    try {
      const { id } = req.params;
      const pool = require('../../config/db').getPool();

      await pool.query(
        'UPDATE users SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );

      res.status(200).json({
        success: true,
        message: 'User verified successfully',
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const pool = require('../../config/db').getPool();

      await pool.query(
        'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [is_active, id]
      );

      res.status(200).json({
        success: true,
        message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  // إنشاء مساعد إداري (admin) - يمكن فقط للـ super_admin
  async createAdminHelper(req, res) {
    try {
      const { email, full_name, phone, permissions } = req.body;
      const pool = require('../../config/db').getPool();

      // التحقق من أن المستخدم الحالي هو super_admin
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({
          error: 'Only super_admin can create admin helpers',
        });
      }

      // إنشاء مساعد إداري جديد
      const result = await pool.query(
        `INSERT INTO users (email, full_name, phone, role, password_hash, password_salt, created_at)
         VALUES ($1, $2, $3, 'admin', $4, $5, CURRENT_TIMESTAMP)
         RETURNING id, email, full_name, role`,
        [email, full_name, phone, 'temp_hash', 'temp_salt']
      );

      // حفظ الصلاحيات المخصصة
      if (permissions && permissions.length > 0) {
        const permissionValues = permissions.map(p => `(${result.rows[0].id}, '${p}')`).join(',');
        await pool.query(`
          INSERT INTO admin_permissions (user_id, permission_key)
          VALUES ${permissionValues}
        `);
      }

      res.status(201).json({
        success: true,
        admin: result.rows[0],
        message: 'Admin helper created successfully',
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  // تحديث صلاحيات المساعد الإداري
  async updateAdminPermissions(req, res) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      const pool = require('../../config/db').getPool();

      // التحقق من أن المستخدم الحالي هو super_admin
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({
          error: 'Only super_admin can update admin permissions',
        });
      }

      // حذف الصلاحيات القديمة
      await pool.query('DELETE FROM admin_permissions WHERE user_id = $1', [id]);

      // إضافة الصلاحيات الجديدة
      if (permissions && permissions.length > 0) {
        const permissionValues = permissions.map(p => `(${id}, '${p}')`).join(',');
        await pool.query(`
          INSERT INTO admin_permissions (user_id, permission_key)
          VALUES ${permissionValues}
        `);
      }

      res.status(200).json({
        success: true,
        message: 'Admin permissions updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Get platform configuration
   */
  async getPlatformConfig(req, res) {
    try {
      const config = await PlatformConfigService.getAllConfigs();

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update platform configuration
   */
  async updatePlatformConfig(req, res) {
    try {
      const { configs } = req.body;

      if (req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Only super admin can modify platform configuration'
        });
      }

      for (const [key, value] of Object.entries(configs)) {
        await PlatformConfigService.setConfig(key, value);
      }

      res.json({
        success: true,
        message: 'Platform configuration updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtenir les métriques de performance admin
   */
  async getAdminPerformance(req, res) {
    try {
      const metrics = await AdvancedAdminService.getAdminPerformanceMetrics();

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtenir les statistiques des assistants admin
   */
  async getAdminAssistantsStats(req, res) {
    try {
      const stats = await AdvancedAdminService.getAdminAssistantsStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getHealthDashboard(req, res) {
    try {
      const pool = getPool();
      
      const healthQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE is_deleted = FALSE) as total_users,
          COUNT(*) FILTER (WHERE role = 'buyer' AND is_deleted = FALSE) as total_buyers,
          COUNT(*) FILTER (WHERE role = 'supplier' AND is_deleted = FALSE) as total_suppliers,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_week
        FROM users
      `;
      
      const result = await pool.query(healthQuery);
      const stats = result.rows[0];
      
      res.json({
        success: true,
        health: {
          totalUsers: parseInt(stats.total_users) || 0,
          totalBuyers: parseInt(stats.total_buyers) || 0,
          totalSuppliers: parseInt(stats.total_suppliers) || 0,
          newUsersWeek: parseInt(stats.new_users_week) || 0
        }
      });
    } catch (error) {
      console.error('Health dashboard error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch health dashboard' });
    }
  }

  async getDashboard(req, res) {
    try {
      const pool = getPool();
      
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM users WHERE is_deleted = FALSE) as total_users,
          (SELECT COUNT(*) FROM tenders WHERE is_deleted = FALSE) as total_tenders,
          (SELECT COUNT(*) FROM offers WHERE is_deleted = FALSE) as total_offers,
          (SELECT COUNT(*) FROM purchase_orders WHERE is_deleted = FALSE) as total_orders
      `;
      
      const result = await pool.query(statsQuery);
      const stats = result.rows[0];
      
      res.json({
        success: true,
        dashboard: {
          totalUsers: parseInt(stats.total_users) || 0,
          totalTenders: parseInt(stats.total_tenders) || 0,
          totalOffers: parseInt(stats.total_offers) || 0,
          totalOrders: parseInt(stats.total_orders) || 0
        }
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch dashboard' });
    }
  }

  async getAnalytics(req, res) {
    try {
      const pool = getPool();
      
      const analyticsQuery = `
        SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date DESC
      `;
      
      const result = await pool.query(analyticsQuery);
      
      res.json({
        success: true,
        analytics: result.rows
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
  }

  async getUserStatistics(req, res) {
    try {
      const pool = getPool();
      
      const statsQuery = `
        SELECT 
          role,
          COUNT(*) as count
        FROM users
        WHERE is_deleted = FALSE
        GROUP BY role
      `;
      
      const result = await pool.query(statsQuery);
      
      res.json({
        success: true,
        statistics: result.rows
      });
    } catch (error) {
      console.error('User statistics error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch user statistics' });
    }
  }

  async getRecentActivities(req, res) {
    try {
      const pool = getPool();
      
      const activitiesQuery = `
        SELECT 
          id,
          user_id,
          action,
          created_at
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT 50
      `;
      
      const result = await pool.query(activitiesQuery);
      
      res.json({
        success: true,
        activities: result.rows
      });
    } catch (error) {
      console.error('Recent activities error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch recent activities' });
    }
  }

  async exportAuditLogs(req, res) {
    try {
      const pool = getPool();
      
      const logsQuery = `
        SELECT * FROM audit_logs
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(logsQuery);
      
      res.json({
        success: true,
        logs: result.rows
      });
    } catch (error) {
      console.error('Export audit logs error:', error);
      res.status(500).json({ success: false, error: 'Failed to export audit logs' });
    }
  }

  async getAdminPerformance(req, res) {
    try {
      res.json({
        success: true,
        performance: {
          avgResponseTime: 150,
          uptime: 99.9
        }
      });
    } catch (error) {
      console.error('Admin performance error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch admin performance' });
    }
  }

  async getAdminAssistantsStats(req, res) {
    try {
      res.json({
        success: true,
        stats: {
          totalAssistants: 0,
          activeAssistants: 0
        }
      });
    } catch (error) {
      console.error('Admin assistants stats error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch admin assistants stats' });
    }
  }
}

module.exports = new AdminController();
