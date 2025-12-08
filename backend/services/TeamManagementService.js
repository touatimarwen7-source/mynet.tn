
const { getPool } = require('../config/db');
const { logger } = require('../utils/logger');

class TeamManagementService {
  /**
   * Get all team members for a buyer
   */
  async getTeamMembers(buyerId) {
    const pool = getPool();
    
    try {
      const result = await pool.query(
        `SELECT 
          id, email, full_name, role, 
          permissions, is_active, created_at,
          last_login, department, position
         FROM team_members 
         WHERE buyer_id = $1 
         ORDER BY created_at DESC`,
        [buyerId]
      );
      
      return { success: true, members: result.rows };
    } catch (error) {
      logger.error('Error fetching team members', { error: error.message });
      throw error;
    }
  }

  /**
   * Add new team member
   */
  async addTeamMember(buyerId, memberData) {
    const pool = getPool();
    const { email, full_name, role, permissions, department, position } = memberData;

    try {
      // Check if email already exists
      const existingMember = await pool.query(
        'SELECT id FROM team_members WHERE email = $1 AND buyer_id = $2',
        [email, buyerId]
      );

      if (existingMember.rows.length > 0) {
        return { success: false, error: 'Email already exists in team' };
      }

      const result = await pool.query(
        `INSERT INTO team_members 
         (buyer_id, email, full_name, role, permissions, department, position, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING *`,
        [buyerId, email, full_name, role, JSON.stringify(permissions || {}), department, position]
      );

      logger.info('Team member added', { buyerId, email });
      return { success: true, member: result.rows[0] };
    } catch (error) {
      logger.error('Error adding team member', { error: error.message });
      throw error;
    }
  }

  /**
   * Update team member
   */
  async updateTeamMember(memberId, buyerId, updates) {
    const pool = getPool();
    
    try {
      const { full_name, role, permissions, department, position, is_active } = updates;
      
      const result = await pool.query(
        `UPDATE team_members 
         SET full_name = COALESCE($1, full_name),
             role = COALESCE($2, role),
             permissions = COALESCE($3, permissions),
             department = COALESCE($4, department),
             position = COALESCE($5, position),
             is_active = COALESCE($6, is_active),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 AND buyer_id = $8
         RETURNING *`,
        [full_name, role, permissions ? JSON.stringify(permissions) : null, 
         department, position, is_active, memberId, buyerId]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Team member not found' };
      }

      logger.info('Team member updated', { memberId, buyerId });
      return { success: true, member: result.rows[0] };
    } catch (error) {
      logger.error('Error updating team member', { error: error.message });
      throw error;
    }
  }

  /**
   * Remove team member
   */
  async removeTeamMember(memberId, buyerId) {
    const pool = getPool();
    
    try {
      const result = await pool.query(
        'DELETE FROM team_members WHERE id = $1 AND buyer_id = $2 RETURNING *',
        [memberId, buyerId]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Team member not found' };
      }

      logger.info('Team member removed', { memberId, buyerId });
      return { success: true };
    } catch (error) {
      logger.error('Error removing team member', { error: error.message });
      throw error;
    }
  }

  /**
   * Get team statistics
   */
  async getTeamStats(buyerId) {
    const pool = getPool();
    
    try {
      const stats = await pool.query(
        `SELECT 
          COUNT(*) as total_members,
          COUNT(*) FILTER (WHERE is_active = true) as active_members,
          COUNT(*) FILTER (WHERE role = 'manager') as managers,
          COUNT(*) FILTER (WHERE role = 'member') as members
         FROM team_members 
         WHERE buyer_id = $1`,
        [buyerId]
      );

      return { success: true, stats: stats.rows[0] };
    } catch (error) {
      logger.error('Error fetching team stats', { error: error.message });
      throw error;
    }
  }
}

module.exports = new TeamManagementService();
