const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { validateIdMiddleware } = require('../middleware/validateIdMiddleware');
const cacheMiddleware = require('../middleware/cacheMiddleware');
const AIRecommendationService = require('../services/AIRecommendationService');
const AdvancedAnalyticsService = require('../services/AdvancedAnalyticsService');
const { getPool } = require('../config/db');
const { sendOk, sendInternalError } = require('../utils/responseHelper');

// Get supplier recommendations for a tender
router.get(
  '/suppliers/:tenderId',
  verifyToken,
  validateIdMiddleware('tenderId'),
  cacheMiddleware({ ttl: 300 }),
  async (req, res) => {
    const pool = getPool(); // Get the connection pool
    let client; // Declare client variable
    try {
      client = await pool.connect(); // Acquire a client from the pool
      const { tenderId } = req.params;

      // Assuming AIRecommendationService.recommendSuppliersForTender can accept a client
      // and that it will internally use pool.query() or similar, which the client handles.
      const recommendations = await AIRecommendationService.recommendSuppliersForTender(
        client,
        tenderId
      );

      return sendOk(res, recommendations, 'Recommandations de fournisseurs récupérées avec succès');
    } catch (error) {
      console.error('Supplier Recommendations Error:', error);
      return sendInternalError(res, 'Échec de la génération des recommandations');
    } finally {
      if (client) {
        try {
          client.release(); // Ensure the client is always released
        } catch (releaseErr) {
          // Silently handle release errors to avoid masking original error
          console.error('Error releasing client:', releaseErr);
        }
      }
    }
  }
);

// Get tender recommendations for a supplier
router.get(
  '/tenders',
  verifyToken,
  cacheMiddleware({ ttl: 600 }),
  async (req, res) => {
    const pool = getPool(); // Get the connection pool
    let client; // Declare client variable
    try {
      client = await pool.connect(); // Acquire a client from the pool
      const supplierId = req.user.id;

      // Assuming AIRecommendationService.recommendTendersForSupplier can accept a client
      const recommendations = await AIRecommendationService.recommendTendersForSupplier(
        client,
        supplierId
      );

      return sendOk(res, recommendations, "Recommandations d'appels d'offres récupérées avec succès");
    } catch (error) {
      console.error('Tender Recommendations Error:', error);
      return sendInternalError(res, 'Échec de la génération des recommandations');
    } finally {
      if (client) {
        try {
          client.release(); // Ensure the client is always released
        } catch (releaseErr) {
          // Silently handle release errors
          console.error('Error releasing client:', releaseErr);
        }
      }
    }
  }
);

// Get market trends
router.get(
  '/market/trends',
  verifyToken,
  cacheMiddleware({ ttl: 1800 }),
  async (req, res) => {
    const pool = getPool(); // Get the connection pool
    let client; // Declare client variable
    try {
      client = await pool.connect(); // Acquire a client from the pool
      const { period = '30 days' } = req.query;

      const trends = await AdvancedAnalyticsService.getMarketTrends(client, period);

      return sendOk(res, trends, 'Tendances du marché récupérées avec succès');
    } catch (error) {
      console.error('Market Trends Error:', error);
      return sendInternalError(res, "Échec de l'analyse des tendances");
    } finally {
      if (client) {
        try {
          client.release(); // Ensure the client is always released
        } catch (releaseErr) {
          // Silently handle release errors
          console.error('Error releasing client:', releaseErr);
        }
      }
    }
  }
);

// Get optimal bid prediction
router.get(
  '/predict/bid/:tenderId',
  verifyToken,
  validateIdMiddleware('tenderId'),
  cacheMiddleware({ ttl: 300 }),
  async (req, res) => {
    const pool = getPool(); // Get the connection pool
    let client; // Declare client variable
    try {
      client = await pool.connect(); // Acquire a client from the pool
      const { tenderId } = req.params;
      const supplierId = req.user.id;

      const prediction = await AdvancedAnalyticsService.predictOptimalBid(
        client,
        tenderId,
        supplierId
      );

      return sendOk(res, prediction, 'Prédiction de offre récupérée avec succès');
    } catch (error) {
      console.error('Bid Prediction Error:', error);
      return sendInternalError(res, 'Échec de la prédiction');
    } finally {
      if (client) {
        try {
          client.release(); // Ensure the client is always released
        } catch (releaseErr) {
          // Silently handle release errors
          console.error('Error releasing client:', releaseErr);
        }
      }
    }
  }
);

// Get similar tenders
router.get(
  '/similar/:tenderId',
  verifyToken,
  validateIdMiddleware('tenderId'),
  cacheMiddleware({ ttl: 600 }),
  async (req, res) => {
    const pool = getPool(); // Get the connection pool
    let client; // Declare client variable
    try {
      client = await pool.connect(); // Acquire a client from the pool
      const { tenderId } = req.params;
      const { limit = 5 } = req.query;

      const similar = await AIRecommendationService.getSimilarTenders(
        client,
        tenderId,
        parseInt(limit)
      );

      return sendOk(res, similar, "Appels d'offres similaires récupérés avec succès");
    } catch (error) {
      console.error('Similar Tenders Error:', error);
      return sendInternalError(res, "Échec de la récupération des appels d'offres similaires");
    } finally {
      if (client) {
        try {
          client.release(); // Ensure the client is always released
        } catch (releaseErr) {
          // Silently handle release errors
          console.error('Error releasing client:', releaseErr);
        }
      }
    }
  }
);

// Get top suppliers
router.get(
  '/top-suppliers',
  verifyToken,
  cacheMiddleware({ ttl: 1800 }),
  async (req, res) => {
    const pool = getPool(); // Get the connection pool
    let client; // Declare client variable
    try {
      client = await pool.connect(); // Acquire a client from the pool
      const { category, limit = 10 } = req.query;

      const suppliers = await AIRecommendationService.getTopSuppliers(
        client,
        category,
        parseInt(limit)
      );

      return sendOk(res, suppliers, 'Meilleurs fournisseurs récupérés avec succès');
    } catch (error) {
      console.error('Top Suppliers Error:', error);
      return sendInternalError(res, 'Échec de la récupération des meilleurs fournisseurs');
    } finally {
      if (client) {
        try {
          client.release(); // Ensure the client is always released
        } catch (releaseErr) {
          // Silently handle release errors
          console.error('Error releasing client:', releaseErr);
        }
      }
    }
  }
);

// Get supplier performance
router.get(
  '/supplier-performance/:supplierId',
  verifyToken,
  validateIdMiddleware('supplierId'),
  cacheMiddleware({ ttl: 900 }),
  async (req, res) => {
    const pool = getPool(); // Get the connection pool
    let client; // Declare client variable
    try {
      client = await pool.connect(); // Acquire a client from the pool
      const { supplierId } = req.params;
      const { period = '6 months' } = req.query;

      const performance = await AdvancedAnalyticsService.getSupplierPerformance(
        client,
        supplierId,
        period
      );

      return sendOk(res, performance, 'Performance du fournisseur récupérée avec succès');
    } catch (error) {
      console.error('Supplier Performance Error:', error);
      return sendInternalError(res, "Échec de l'analyse de performance");
    } finally {
      if (client) {
        try {
          client.release(); // Ensure the client is always released
        } catch (releaseErr) {
          // Silently handle release errors
          console.error('Error releasing client:', releaseErr);
        }
      }
    }
  }
);

// Get category statistics
router.get(
  '/category-stats',
  verifyToken,
  cacheMiddleware({ ttl: 3600 }),
  async (req, res) => {
    const pool = getPool(); // Get the connection pool
    let client; // Declare client variable
    try {
      client = await pool.connect(); // Acquire a client from the pool

      const stats = await AdvancedAnalyticsService.getCategoryStats(client);

      return sendOk(res, stats, 'Statistiques des catégories récupérées avec succès');
    } catch (error) {
      console.error('Category Stats Error:', error);
      return sendInternalError(res, "Échec de l'analyse des catégories");
    } finally {
      if (client) {
        try {
          client.release(); // Ensure the client is always released
        } catch (releaseErr) {
          // Silently handle release errors
          console.error('Error releasing client:', releaseErr);
        }
      }
    }
  }
);

module.exports = router;