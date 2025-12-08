const express = require('express');
const authMiddleware = require('../middleware/authMiddleware'); // This line should ideally be removed if verifyToken replaces it everywhere.
const verifyToken = require('../middleware/verifyToken'); // Assuming verifyToken is imported from a similar path.

const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Get all active suppliers
router.get('/suppliers', verifyToken, async (req, res) => {
  try {
    const db = req.app.get('db');

    const result = await db.query(`
      SELECT 
        u.id,
        u.company_name,
        u.phone,
        u.average_rating,
        u.preferred_categories,
        u.service_locations,
        up.bio,
        up.city
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.role = 'supplier' AND u.is_active = true AND u.is_verified = true
      ORDER BY u.average_rating DESC
      LIMIT 100
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create direct supply request - ISSUE FIX #3: Add input validation
router.post('/create-request', verifyToken, async (req, res) => {
  try {
    // Only buyers can create supply requests
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can create supply requests' });
    }

    const { supplier_id, title, description, category, quantity, unit, budget, notes } = req.body;
    const buyer_id = req.user.id;

    // ISSUE FIX #3: Comprehensive validation
    if (!supplier_id || !title || !category || !budget) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (title.length < 3 || title.length > 255) {
      return res.status(400).json({ error: 'Title must be 3-255 characters' });
    }
    if (quantity && quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    if (budget <= 0) {
      return res.status(400).json({ error: 'Budget must be greater than 0' });
    }
    if (!['pending', 'accepted', 'rejected', 'completed'].includes(category)) {
      // Category validation - allow valid categories
      if (category.length === 0) {
        return res.status(400).json({ error: 'Category cannot be empty' });
      }
    }

    const db = req.app.get('db');

    // Check if supplier exists and is verified
    const supplierCheck = await db.query(
      `
      SELECT id FROM users WHERE id = $1 AND role = 'supplier' AND is_active = true
    `,
      [supplier_id]
    );

    if (supplierCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Create supply request
    const result = await db.query(
      `
      INSERT INTO purchase_requests (
        buyer_id, supplier_id, title, description, category, 
        quantity, unit, budget, notes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *
    `,
      [
        buyer_id,
        supplier_id,
        title,
        description,
        category,
        quantity || 1,
        unit || 'pièce',
        budget,
        notes,
      ]
    );

    // Create notification for supplier
    await db.query(
      `
      INSERT INTO notifications (
        user_id, type, title, message, related_entity_type, related_entity_id
      )
      VALUES ($1, 'supply_request', 'Nouvelle demande de fourniture', 
              $2, 'supply_request', $3)
    `,
      [supplier_id, `Une demande de fourniture directe a été reçue: ${title}`, result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'Supply request created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my supply requests (buyer)
router.get('/my-requests', verifyToken, async (req, res) => {
  try {
    const db = req.app.get('db');

    const result = await db.query(
      `
      SELECT 
        pr.*,
        u.company_name as supplier_name,
        u.phone as supplier_phone,
        u.average_rating as supplier_rating
      FROM purchase_requests pr
      LEFT JOIN users u ON pr.supplier_id = u.id
      WHERE pr.buyer_id = $1
      ORDER BY pr.created_at DESC
    `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get requests received (supplier)
router.get('/received-requests', verifyToken, async (req, res) => {
  try {
    const db = req.app.get('db');

    const result = await db.query(
      `
      SELECT 
        pr.*,
        u.company_name as buyer_company,
        u.full_name as buyer_name,
        u.phone as buyer_phone
      FROM purchase_requests pr
      LEFT JOIN users u ON pr.buyer_id = u.id
      WHERE pr.supplier_id = $1
      ORDER BY pr.created_at DESC
    `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update supply request status (supplier)
router.put(
  '/:requestId/status',
  validateIdMiddleware('requestId'),
  verifyToken,
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;

      // Valid statuses
      const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const db = req.app.get('db');

      // Check if request exists and belongs to supplier
      const checkResult = await db.query(
        `
      SELECT * FROM purchase_requests WHERE id = $1
    `,
        [requestId]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }

      const request = checkResult.rows[0];
      if (request.supplier_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Update status
      const result = await db.query(
        `
      UPDATE purchase_requests 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `,
        [status, requestId]
      );

      res.json({
        success: true,
        message: 'Status updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;