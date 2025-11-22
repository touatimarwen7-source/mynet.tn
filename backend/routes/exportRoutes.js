// Export Features Routes - TURN 3 ENHANCEMENT
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Export tender as JSON
router.get('/tender/:tenderId/json', authMiddleware, async (req, res) => {
  try {
    const { tenderId } = req.params;
    const db = req.app.get('db');

    const result = await db.query(`
      SELECT t.*, u.company_name, u.contact_email
      FROM tenders t
      LEFT JOIN users u ON t.buyer_id = u.id
      WHERE t.id = $1 AND t.is_deleted = false
    `, [tenderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=tender-${tenderId}.json`);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export offers list as JSON
router.get('/offers/:tenderId/json', authMiddleware, async (req, res) => {
  try {
    const { tenderId } = req.params;
    const db = req.app.get('db');

    const result = await db.query(`
      SELECT 
        o.*,
        u.company_name as supplier_name,
        u.average_rating
      FROM offers o
      LEFT JOIN users u ON o.supplier_id = u.id
      WHERE o.tender_id = $1 AND o.is_deleted = false
      ORDER BY o.created_at DESC
    `, [tenderId]);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=offers-${tenderId}.json`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export invoice as JSON
router.get('/invoice/:invoiceId/json', authMiddleware, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const db = req.app.get('db');

    const result = await db.query(`
      SELECT i.*, u.company_name
      FROM invoices i
      LEFT JOIN users u ON i.supplier_id = u.id
      WHERE i.id = $1 AND i.is_deleted = false
    `, [invoiceId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.json`);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export CSV template for bulk import
router.get('/template/tenders-csv', authMiddleware, async (req, res) => {
  try {
    const csv = `title,description,budget,category,deadline,required_qualifications
Example Tender,Sample tender description,50000,Technology,2025-12-31,"ISO 9001, Experience"`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tenders-template.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
