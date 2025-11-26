const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { buildPaginationQuery } = require('../utils/paginationHelper');

const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Get company profile (only own profile or any if admin)
router.get('/supplier/:supplierId', validateIdMiddleware('supplierId'), authMiddleware, async (req, res) => {
  try {
    const { supplierId } = req.params;
    const userId = parseInt(supplierId);
    
    // Check authorization: user can only view their own profile, super_admin can view any
    if (req.user.role !== 'super_admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const db = req.app.get('db');
    
    const result = await db.query(`
      SELECT 
        u.id,
        u.company_name,
        u.company_registration,
        u.phone,
        u.average_rating,
        u.preferred_categories,
        u.service_locations,
        up.bio,
        up.address,
        up.city,
        up.country,
        up.profile_picture,
        up.total_reviews,
        sv.verification_status,
        sv.verified_at
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN supplier_verifications sv ON u.id = sv.user_id
      WHERE u.id = $1 AND (u.role = 'supplier' OR u.role = 'buyer')
    `, [supplierId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update company profile (Admin, Suppliers, Buyers)
router.put('/supplier/:supplierId', validateIdMiddleware('supplierId'), authMiddleware, async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { company_name, phone, bio, address, city, country, profile_picture, preferred_categories, service_locations } = req.body;
    
    // Check if user is super_admin or the user themselves (supplier or buyer)
    if (req.user.role !== 'super_admin' && req.user.id !== parseInt(supplierId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const db = req.app.get('db');
    
    // Update users table
    await db.query(`
      UPDATE users 
      SET company_name = $1, phone = $2, preferred_categories = $3, service_locations = $4
      WHERE id = $5
    `, [company_name, phone, JSON.stringify(preferred_categories), JSON.stringify(service_locations), supplierId]);
    
    // Update or insert user_profiles
    await db.query(`
      INSERT INTO user_profiles (user_id, bio, address, city, country, profile_picture)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE SET
        bio = $2, address = $3, city = $4, country = $5, profile_picture = $6, updated_at = CURRENT_TIMESTAMP
    `, [supplierId, bio, address, city, country, profile_picture]);
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search suppliers with advanced filtering
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query, category, minRating, maxBudget, location } = req.query;
    const db = req.app.get('db');
    
    let sql = `
      SELECT 
        u.id,
        u.company_name,
        u.average_rating,
        u.phone,
        u.preferred_categories,
        u.service_locations,
        up.city,
        up.bio
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.role = 'supplier' AND u.is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (query) {
      sql += ` AND (u.company_name ILIKE $${paramIndex} OR up.bio ILIKE $${paramIndex})`;
      params.push(`%${query}%`);
      paramIndex++;
    }
    
    if (category) {
      sql += ` AND u.preferred_categories @> $${paramIndex}`;
      params.push(JSON.stringify([category]));
      paramIndex++;
    }
    
    if (minRating) {
      sql += ` AND u.average_rating >= $${paramIndex}`;
      params.push(parseFloat(minRating));
      paramIndex++;
    }
    
    if (location) {
      sql += ` AND up.city ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }
    
    const { limit, offset, sql: paginationSql } = buildPaginationQuery(50, 0);
    sql += ` ORDER BY u.average_rating DESC ${paginationSql}`;
    params.push(limit, offset);
    
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
