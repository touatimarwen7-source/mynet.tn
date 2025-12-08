const UserService = require('../../services/UserService');
const SearchService = require('../../services/SearchService');

const AdvancedAdminService = require('../../services/AdvancedAdminService');

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
      const filters = {
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0,
        userId: req.query.userId,
        actionType: req.query.actionType,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const timeline = await AdvancedAdminService.getActivityTimeline(filters);

      res.status(200).json({
        success: true,
        data: timeline
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
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
}

module.exports = new AdminController();