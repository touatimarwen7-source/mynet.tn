const OfferService = require('../../services/OfferService');
const CreateOfferDTO = require('../../mappers/dtos/CreateOfferDTO');

/**
 * Offer Controller
 * Handles offer creation, retrieval, and evaluation for procurement
 * 
 * @class OfferController
 * @example
 * const controller = new OfferController();
 * await controller.createOffer(req, res);
 */
class OfferController {
    /**
     * Create a new offer for a tender
     * @async
     * @param {Object} req - Express request object
     * @param {Object} req.body - Offer data
     * @param {number} req.body.tender_id - Tender ID (required)
     * @param {number} req.body.total_amount - Bid amount (required)
     * @param {string} req.body.delivery_time - Delivery timeframe
     * @param {string} req.body.technical_proposal - Technical details
     * @param {string} req.body.financial_proposal - Financial details
     * @param {Object} req.user - Authenticated user (supplier)
     * @param {Object} res - Express response object
     * @returns {void} Returns created offer with 201 status
     * @throws {400} If validation fails or offer creation fails
     * @example
     * POST /procurement/offers
     * {
     *   "tender_id": 1,
     *   "total_amount": 5000,
     *   "delivery_time": "30 days",
     *   "technical_proposal": "High quality solution"
     * }
     */
    async createOffer(req, res) {
        try {
            const offerDTO = new CreateOfferDTO(req.body);
            const validation = offerDTO.validate();

            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    errors: validation.errors
                });
            }

            const offer = await OfferService.createOffer(offerDTO, req.user.id);

            res.status(201).json({
                success: true,
                message: 'Offer submitted successfully',
                offer
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }

    /**
     * Get offer details by ID
     * @async
     * @param {Object} req - Express request object
     * @param {Object} req.params - Request parameters
     * @param {number} req.params.id - Offer ID (required)
     * @param {Object} req.user - Authenticated user (optional)
     * @param {Object} res - Express response object
     * @returns {void} Returns offer data with seal status
     * @throws {404} If offer not found
     * @throws {500} If database error occurs
     * @example
     * GET /procurement/offers/:id
     * Response: { success: true, offer: {...}, is_sealed: false }
     */
    async getOffer(req, res) {
        try {
            const { id } = req.params;
            const offer = await OfferService.getOfferById(id, req.user?.id);

            if (!offer) {
                return res.status(404).json({ 
                    error: 'Offer not found' 
                });
            }

            res.status(200).json({
                success: true,
                offer,
                is_sealed: offer.is_sealed || false
            });
        } catch (error) {
            res.status(500).json({ 
                error: error.message 
            });
        }
    }

    /**
     * Get all offers for a tender (sealed or unsealed)
     * @async
     * @param {Object} req - Express request object
     * @param {Object} req.params - Request parameters
     * @param {number} req.params.tenderId - Tender ID (required)
     * @param {Object} req.user - Authenticated user (buyer)
     * @param {Object} res - Express response object
     * @returns {void} Returns offers (sealed if before opening date)
     * @throws {500} If database error occurs
     * @example
     * GET /procurement/tenders/:tenderId/offers
     * Response: { success: true, is_sealed: false, offers: [...] }
     */
    async getOffersByTender(req, res) {
        try {
            const { tenderId } = req.params;
            const result = await OfferService.getOffersByTender(
                tenderId, 
                req.user?.id
            );

            // إذا كانت العروض مختومة (قبل تاريخ الفتح)
            if (result.is_sealed) {
                return res.status(200).json({
                    success: true,
                    is_sealed: true,
                    total_offers: result.total_offers,
                    opening_date: result.opening_date,
                    message: result.message
                });
            }

            // بعد تاريخ الفتح
            res.status(200).json({
                success: true,
                is_sealed: false,
                count: result.total_offers,
                offers: result.offers
            });
        } catch (error) {
            res.status(500).json({ 
                error: error.message 
            });
        }
    }

    async getMyOffers(req, res) {
        try {
            const offers = await OfferService.getOffersBySupplier(req.user.id);

            res.status(200).json({
                success: true,
                count: offers.length,
                offers
            });
        } catch (error) {
            res.status(500).json({ 
                error: error.message 
            });
        }
    }

    /**
     * Evaluate an offer with score and notes
     * @async
     * @param {Object} req - Express request object
     * @param {Object} req.params - Request parameters
     * @param {number} req.params.id - Offer ID (required)
     * @param {Object} req.body - Evaluation data
     * @param {number} req.body.score - Evaluation score 1-10 (required)
     * @param {string} req.body.notes - Evaluation comments
     * @param {Object} req.user - Authenticated user (buyer)
     * @param {Object} res - Express response object
     * @returns {void} Returns evaluated offer
     * @throws {400} If score is missing or invalid
     * @throws {500} If evaluation fails
     * @example
     * PUT /procurement/offers/:id/evaluate
     * {
     *   "score": 8.5,
     *   "notes": "Good technical proposal"
     * }
     */
    async evaluateOffer(req, res) {
        try {
            const { id } = req.params;
            const { score, notes } = req.body;

            if (!score) {
                return res.status(400).json({ 
                    error: 'Evaluation score is required' 
                });
            }

            const offer = await OfferService.evaluateOffer(
                id, 
                { score, notes }, 
                req.user.id
            );

            res.status(200).json({
                success: true,
                message: 'Offer evaluated successfully',
                offer
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }

    async selectWinner(req, res) {
        try {
            const { id } = req.params;
            
            const offer = await OfferService.selectWinningOffer(id, req.user.id);

            res.status(200).json({
                success: true,
                message: 'Winning offer selected successfully',
                offer
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }

    async rejectOffer(req, res) {
        try {
            const { id } = req.params;
            
            const offer = await OfferService.rejectOffer(id, req.user.id);

            res.status(200).json({
                success: true,
                message: 'Offer rejected successfully',
                offer
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }
}

module.exports = new OfferController();
