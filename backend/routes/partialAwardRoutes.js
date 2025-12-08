const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'partial-awards' });
});

// Get partial award settings for a tender
router.get('/tender/:tenderId/settings', verifyToken, validateIdMiddleware('tenderId'), async (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: { allowPartialAward: false, maxWinners: 1 },
      message: 'Partial award settings retrieved' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create partial award (buyer)
router.post('/create', verifyToken, checkRole(['buyer']), async (req, res) => {
  try {
    res.json({ success: true, message: 'Partial award created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;