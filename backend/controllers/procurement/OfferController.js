const OfferService = require('../../services/OfferService');
const CreateOfferDTO = require('../../mappers/dtos/CreateOfferDTO');

class OfferController {
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

            const offer = await OfferService.createOffer(offerDTO, req.user.userId);

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

    async getOffer(req, res) {
        try {
            const { id } = req.params;
            const offer = await OfferService.getOfferById(id);

            if (!offer) {
                return res.status(404).json({ 
                    error: 'Offer not found' 
                });
            }

            res.status(200).json({
                success: true,
                offer
            });
        } catch (error) {
            res.status(500).json({ 
                error: error.message 
            });
        }
    }

    async getOffersByTender(req, res) {
        try {
            const { tenderId } = req.params;
            const offers = await OfferService.getOffersByTender(tenderId);

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

    async getMyOffers(req, res) {
        try {
            const offers = await OfferService.getOffersBySupplier(req.user.userId);

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
                req.user.userId
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
            
            const offer = await OfferService.selectWinningOffer(id, req.user.userId);

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
            
            const offer = await OfferService.rejectOffer(id, req.user.userId);

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
