const TenderService = require('../../services/TenderService');
const NotificationService = require('../../services/NotificationService');
const logger = require('../../utils/logger'); // Assuming logger is configured

class TenderController {
  async createTender(req, res) {
    try {
      const tenderData = req.body;
      const tender = await TenderService.createTender(tenderData, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Tender created successfully',
        tender,
      });
    } catch (error) {
      logger.error('Error creating tender:', error);
      const { errorResponse } = require('../../middleware/errorResponseFormatter');
      errorResponse(res, error, 'Error creating tender');
    }
  }

  async getTender(req, res) {
    try {
      const { id } = req.params;
      const tender = await TenderService.getTenderById(id);

      if (!tender) {
        return res.status(404).json({
          success: false,
          message: 'Tender not found',
        });
      }

      res.status(200).json({
        success: true,
        tender,
      });
    } catch (error) {
      logger.error('Error fetching tender:', error);
      const { errorResponse } = require('../../middleware/errorResponseFormatter');
      errorResponse(res, error, 'Error fetching tender');
    }
  }

  async getAllTenders(req, res) {
    try {
      const filters = {
        status: req.query.status,
        category: req.query.category,
        is_public: req.query.is_public,
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        page: req.query.page ? parseInt(req.query.page) : 1, // Added for pagination validation
      };

      const tenders = await TenderService.getAllTenders(filters);

      res.status(200).json({
        success: true,
        count: tenders.length,
        tenders,
      });
    } catch (error) {
      logger.error('Error fetching tenders:', error);
      const { errorResponse } = require('../../middleware/errorResponseFormatter');
      errorResponse(res, error, 'Error fetching tenders');
    }
  }

  async getMyTenders(req, res) {
    try {
      const filters = {
        status: req.query.status,
        category: req.query.category,
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        page: req.query.page ? parseInt(req.query.page) : 1, // Added for pagination validation
      };

      const tenders = await TenderService.getMyTenders(req.user.id, filters);

      res.status(200).json({
        success: true,
        count: tenders.length,
        tenders,
      });
    } catch (error) {
      logger.error('Error fetching user tenders:', error);
      const { errorResponse } = require('../../middleware/errorResponseFormatter');
      errorResponse(res, error, 'Error fetching user tenders');
    }
  }

  async updateTender(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const tender = await TenderService.updateTender(id, updateData, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Tender updated successfully',
        tender,
      });
    } catch (error) {
      logger.error('Error updating tender:', error);
      const { errorResponse } = require('../../middleware/errorResponseFormatter');
      errorResponse(res, error, 'Error updating tender');
    }
  }

  async deleteTender(req, res) {
    try {
      const { id } = req.params;

      await TenderService.deleteTender(id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Tender deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting tender:', error);
      const { errorResponse } = require('../../middleware/errorResponseFormatter');
      errorResponse(res, error, 'Error deleting tender');
    }
  }

  async publishTender(req, res) {
    try {
      const { id } = req.params;

      const tender = await TenderService.publishTender(id, req.user.id);

      const tenderData = {
        category: tender.category,
        service_location: tender.service_location,
        budget_min: tender.budget_min,
      };

      await NotificationService.notifyTenderPublished(
        tender.id,
        tender.title,
        req.user.id,
        tenderData
      );

      res.status(200).json({
        success: true,
        message: 'Tender published successfully',
        tender,
      });
    } catch (error) {
      logger.error('Error publishing tender:', error);
      const { errorResponse } = require('../../middleware/errorResponseFormatter');
      errorResponse(res, error, 'Error publishing tender');
    }
  }

  async closeTender(req, res) {
    try {
      const { id } = req.params;

      const tender = await TenderService.closeTender(id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Tender closed successfully',
        tender,
      });
    } catch (error) {
      logger.error('Error closing tender:', error);
      const { errorResponse } = require('../../middleware/errorResponseFormatter');
      errorResponse(res, error, 'Error closing tender');
    }
  }

  async getTenderWithOffers(req, res) {
    try {
      const { id } = req.params;

      const tender = await TenderService.getTenderWithOffers(id, req.user.id);

      res.status(200).json({
        success: true,
        tender,
      });
    } catch (error) {
      logger.error('Error fetching tender with offers:', error);
      const { errorResponse } = require('../../middleware/errorResponseFormatter');
      errorResponse(res, error, 'Error fetching tender with offers');
    }
  }

  async getTenderStatistics(req, res) {
    try {
      const { id } = req.params;

      const statistics = await TenderService.getTenderStatistics(id);

      res.status(200).json({
        success: true,
        statistics,
      });
    } catch (error) {
      logger.error('Error fetching tender statistics:', error);
      const { errorResponse } = require('../../middleware/errorResponseFormatter');
      errorResponse(res, error, 'Error fetching tender statistics');
    }
  }

  async awardTender(req, res) {
    try {
      const { id } = req.params;
      const { awards } = req.body;

      const result = await TenderService.awardTender(id, awards, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Tender awarded successfully',
        result,
      });
    } catch (error) {
      logger.error('Error awarding tender:', error);
      const { errorResponse } = require('../../middleware/errorResponseFormatter');
      errorResponse(res, error, 'Error awarding tender');
    }
  }
}

module.exports = new TenderController();