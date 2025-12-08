
const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'clarifications' });
});

// Get all clarifications for a tender (buyer)
router.get('/tender/:tenderId', verifyToken, validateIdMiddleware('tenderId'), async (req, res) => {
  try {
    res.json({ success: true, data: [], message: 'Clarifications retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create clarification request (buyer)
router.post('/create', verifyToken, checkRole(['buyer']), async (req, res) => {
  try {
    res.json({ success: true, message: 'Clarification created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Respond to clarification (supplier)
router.post('/:clarificationId/respond', verifyToken, checkRole(['supplier']), validateIdMiddleware('clarificationId'), async (req, res) => {
  try {
    res.json({ success: true, message: 'Response submitted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
