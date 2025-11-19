const express = require('express');
const router = express.Router();
const SearchService = require('../services/SearchService');

router.get('/tenders', async (req, res) => {
    try {
        const searchParams = {
            keyword: req.query.keyword,
            category: req.query.category,
            status: req.query.status,
            minBudget: req.query.minBudget ? parseFloat(req.query.minBudget) : null,
            maxBudget: req.query.maxBudget ? parseFloat(req.query.maxBudget) : null,
            limit: req.query.limit ? parseInt(req.query.limit) : 20,
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

router.get('/suppliers', async (req, res) => {
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

module.exports = router;
