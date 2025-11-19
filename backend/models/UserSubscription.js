
const BaseEntity = require('./BaseEntity');

class UserSubscription extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.user_id = data.user_id;
    this.plan_id = data.plan_id;
    this.status = data.status; // active, cancelled, expired, past_due
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.stripe_subscription_id = data.stripe_subscription_id;
    this.stripe_customer_id = data.stripe_customer_id;
    this.auto_renew = data.auto_renew !== false;
  }

  static get tableName() {
    return 'user_subscriptions';
  }
}

module.exports = UserSubscription;
