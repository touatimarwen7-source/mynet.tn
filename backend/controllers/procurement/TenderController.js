const TenderService = require('../../services/TenderService');
const NotificationService = require('../../services/NotificationService');

class TenderController {
    async createTender(req, res) {
        try {
            const tenderData = req.body;
            const tender = await TenderService.createTender(tenderData, req.user.userId);

            res.status(201).json({
                success: true,
                message: 'Tender created successfully',
                tender
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }

    async getTender(req, res) {
        try {
            const { id } = req.params;
            const tender = await TenderService.getTenderById(id);

            if (!tender) {
                return res.status(404).json({ 
                    error: 'Tender not found' 
                });
            }

            res.status(200).json({
                success: true,
                tender
            });
        } catch (error) {
            res.status(500).json({ 
                error: error.message 
            });
        }
    }

    async getAllTenders(req, res) {
        try {
            const filters = {
                status: req.query.status,
                category: req.query.category,
                is_public: req.query.is_public,
                limit: req.query.limit ? parseInt(req.query.limit) : 50
            };

            const tenders = await TenderService.getAllTenders(filters);

            res.status(200).json({
                success: true,
                count: tenders.length,
                tenders
            });
        } catch (error) {
            res.status(500).json({ 
                error: error.message 
            });
        }
    }

    async updateTender(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const tender = await TenderService.updateTender(id, updateData, req.user.userId);

            res.status(200).json({
                success: true,
                message: 'Tender updated successfully',
                tender
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }

    async deleteTender(req, res) {
        try {
            const { id } = req.params;

            await TenderService.deleteTender(id, req.user.userId);

            res.status(200).json({
                success: true,
                message: 'Tender deleted successfully'
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }

    async publishTender(req, res) {
        try {
            const { id } = req.params;

            const tender = await TenderService.publishTender(id, req.user.userId);

            await NotificationService.notifyTenderPublished(
                tender.id, 
                tender.title, 
                req.user.userId
            );

            res.status(200).json({
                success: true,
                message: 'Tender published successfully',
                tender
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }

    async closeTender(req, res) {
        try {
            const { id } = req.params;

            const tender = await TenderService.closeTender(id, req.user.userId);

            res.status(200).json({
                success: true,
                message: 'Tender closed successfully',
                tender
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }
}

module.exports = new TenderController();