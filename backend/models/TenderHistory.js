
const BaseEntity = require('./BaseEntity');

class TenderHistory extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.tender_id = data.tender_id;
    this.user_id = data.user_id;
    this.action = data.action; // created, published, closed, awarded, cancelled
    this.previous_state = data.previous_state;
    this.new_state = data.new_state;
    this.metadata = data.metadata; // JSON field for additional context
    this.ip_address = data.ip_address;
    this.user_agent = data.user_agent;
  }

  static get tableName() {
    return 'tender_history';
  }
}

module.exports = TenderHistory;
