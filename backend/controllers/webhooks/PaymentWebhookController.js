
const SubscriptionService = require('../../services/SubscriptionService');

class PaymentWebhookController {
  async handleStripeWebhook(req, res, next) {
    try {
      const event = req.body;

      // Handle different event types
      switch (event.type) {
        case 'customer.subscription.created':
          await SubscriptionService.activateSubscription(event.data.object);
          break;
        
        case 'customer.subscription.updated':
          await SubscriptionService.updateSubscription(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await SubscriptionService.cancelSubscription(event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await SubscriptionService.handlePaymentSuccess(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await SubscriptionService.handlePaymentFailure(event.data.object);
          break;
      }

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentWebhookController();
