const express = require('express');
const router = express.Router();
const SearchService = require('../services/SearchService');
const authMiddleware = require('../middleware/authMiddleware');
const { buildPaginationQuery } = require('../utils/paginationHelper');

// ISSUE FIX #1: Add authentication
router.get('/tenders', authMiddleware, async (req, res) => {
    try {
        const searchParams = {
            keyword: req.query.keyword,
            category: req.query.category,
            status: req.query.status,
            minBudget: req.query.minBudget ? parseFloat(req.query.minBudget) : null,
            maxBudget: req.query.maxBudget ? parseFloat(req.query.maxBudget) : null,
            limit: Math.min(parseInt(req.query.limit) || 20, 100),
            offset: req.query.offset ? parseInt(req.query.offset) : 0
        };

        const results = await SearchService.searchTenders(searchParams);

        res.status(200).json({
            success: true,
            count: results.length,
            results
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

// ISSUE FIX #1: Add authentication
router.get('/suppliers', authMiddleware, async (req, res) => {
    try {
        const searchParams = {
            keyword: req.query.keyword,
            verified: req.query.verified === 'true'
        };

        const results = await SearchService.searchSuppliers(searchParams);

        res.status(200).json({
            success: true,
            count: results.length,
            results
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

router.get('/users', async (req, res) => {
    try {
        const db = req.app.get('db');
        const { keyword = '', limit = 20 } = req.query;

        const result = await db.query(`
            SELECT 
                u.id,
                u.full_name,
                u.company_name,
                u.role,
                u.average_rating,
                up.profile_picture
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE (u.company_name ILIKE $1 OR u.full_name ILIKE $1)
            AND u.is_active = true
            LIMIT $2
        `, [`%${keyword}%`, limit]);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            results: result.rows
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

module.exports = router;
