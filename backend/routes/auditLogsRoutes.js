
const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const pool = require('../config/db');

// Helper function for logging actions
const logAction = async (userId, action, details, ipAddress) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
      [userId, action, JSON.stringify(details), ipAddress]
    );
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

// Get all audit logs (admin only)
router.get('/', verifyToken, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
});

// Export logs helper
router.logAction = logAction;

module.exports = router;
