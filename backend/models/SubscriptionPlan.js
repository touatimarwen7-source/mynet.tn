
const BaseEntity = require('./BaseEntity');

class SubscriptionPlan extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.billing_cycle = data.billing_cycle; // monthly, yearly
    this.features = data.features; // JSON array
    this.max_tenders = data.max_tenders; // -1 for unlimited
    this.max_offers = data.max_offers;
    this.is_active = data.is_active !== false;
    this.stripe_price_id = data.stripe_price_id;
  }

  static get tableName() {
    return 'subscription_plans';
  }
}

module.exports = SubscriptionPlan;
