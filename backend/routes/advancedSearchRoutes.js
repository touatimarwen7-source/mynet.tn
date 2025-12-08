// Advanced Search Routes - TURN 3 ENHANCEMENT
const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { buildPaginationQuery } = require('../utils/paginationHelper');
const router = express.Router();
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Advanced search tenders with filters
router.get('/tenders/advanced', verifyToken, async (req, res) => {
  try {
    const { search, minBudget, maxBudget, category, location, minRating, status } = req.query;

    const { limit, offset, sql } = buildPaginationQuery(req.query.limit, req.query.offset);
    const db = req.app.get('db');

    let query = `
      SELECT t.*, u.company_name, u.average_rating
      FROM tenders t
      LEFT JOIN users u ON t.buyer_id = u.id
      WHERE t.is_deleted = false AND t.status = 'open'
    `;
    const params = [];

    if (search) {
      query += ` AND (t.title ILIKE $${params.length + 1} OR t.description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (minBudget) {
      query += ` AND t.budget >= $${params.length + 1}`;
      params.push(parseFloat(minBudget));
    }

    if (maxBudget) {
      query += ` AND t.budget <= $${params.length + 1}`;
      params.push(parseFloat(maxBudget));
    }

    if (category) {
      query += ` AND t.category = $${params.length + 1}`;
      params.push(category);
    }

    if (location) {
      query += ` AND u.location ILIKE $${params.length + 1}`;
      params.push(`%${location}%`);
    }

    if (minRating) {
      query += ` AND u.average_rating >= $${params.length + 1}`;
      params.push(parseFloat(minRating));
    }

    if (status) {
      query += ` AND t.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY t.created_at DESC ${sql}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Advanced search suppliers with filters
router.get('/suppliers/advanced', verifyToken, async (req, res) => {
  try {
    const { search, minRating, maxRating, category, location, verified } = req.query;

    const { limit, offset, sql } = buildPaginationQuery(req.query.limit, req.query.offset);
    const db = req.app.get('db');

    let query = `
      SELECT 
        id, company_name, contact_email, phone, 
        location, category, average_rating, 
        verified, created_at
      FROM users 
      WHERE role = 'supplier' AND is_deleted = false
    `;
    const params = [];

    if (search) {
      query += ` AND (company_name ILIKE $${params.length + 1} OR contact_email ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (minRating) {
      query += ` AND average_rating >= $${params.length + 1}`;
      params.push(parseFloat(minRating));
    }

    if (maxRating) {
      query += ` AND average_rating <= $${params.length + 1}`;
      params.push(parseFloat(maxRating));
    }

    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    if (location) {
      query += ` AND location ILIKE $${params.length + 1}`;
      params.push(`%${location}%`);
    }

    if (verified !== undefined) {
      query += ` AND verified = $${params.length + 1}`;
      params.push(verified === 'true');
    }

    query += ` ORDER BY average_rating DESC ${sql}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
