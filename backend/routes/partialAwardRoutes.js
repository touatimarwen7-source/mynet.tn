const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

async function validatePartialAwardSettings(tenderId) {
  const pool = getPool();
  const result = await pool.query(
    'SELECT id, allow_partial_award, max_winners FROM tenders WHERE id = $1',
    [tenderId]
  );
  if (result.rows.length === 0) throw new Error('Tender not found');
  const tender = result.rows[0];
  return { allowPartialAward: tender.allow_partial_award, maxWinners: tender.max_winners || 1 };
}

router.get('/:tenderId/award-settings', async (req, res) => {
  try {
    const { tenderId } = req.params;
    const settings = await validatePartialAwardSettings(parseInt(tenderId));
    res.status(200).json({ 
      success: true, 
      settings,
      description: settings.allowPartialAward 
        ? `ترسية جزئية - حد أقصى: ${settings.maxWinners} فائزين`
        : 'ترسية كاملة - فائز واحد'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = { router, validatePartialAwardSettings };
