
const express = require('express');
const router = express.Router();
const PaymentWebhookController = require('../../controllers/webhooks/PaymentWebhookController');

router.post('/stripe', express.raw({ type: 'application/json' }), PaymentWebhookController.handleStripeWebhook);

module.exports = router;
