const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Get supplier features - ISSUE FIX #1: Add authentication
router.get(
  '/supplier/:supplierId',
  validateIdMiddleware('supplierId'),
  verifyToken,
  async (req, res) => {
    try {
      const { supplierId } = req.params;
      const db = req.app.get('db');

      const result = await db.query(
        `
      SELECT * FROM supplier_features 
      WHERE supplier_id = $1 AND is_active = true
      ORDER BY created_at DESC
    `,
        [supplierId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Add feature - ISSUE FIX #3: Add input validation
router.post('/', verifyToken, async (req, res) => {
  try {
    const { supplier_id, feature_name, description } = req.body;

    // ISSUE FIX #3: Validation
    if (!supplier_id || !feature_name) {
      return res.status(400).json({ error: 'supplier_id and feature_name are required' });
    }
    if (feature_name.length < 3 || feature_name.length > 255) {
      return res.status(400).json({ error: 'feature_name must be 3-255 characters' });
    }
    if (description && description.length > 1000) {
      return res.status(400).json({ error: 'description too long (max 1000 chars)' });
    }

    const db = req.app.get('db');

    const result = await db.query(
      `
      INSERT INTO supplier_features (supplier_id, feature_name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [supplier_id, feature_name, description]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete feature
router.delete(
  '/:featureId',
  validateIdMiddleware('featureId'),
  verifyToken,
  async (req, res) => {
    try {
      const { featureId } = req.params;
      const db = req.app.get('db');

      await db.query('UPDATE supplier_features SET is_active = false WHERE id = $1', [featureId]);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
