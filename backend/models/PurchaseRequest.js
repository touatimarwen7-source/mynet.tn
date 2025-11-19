
const BaseEntity = require('./BaseEntity');

class PurchaseRequest extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.buyer_id = data.buyer_id;
    this.supplier_id = data.supplier_id;
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
    this.quantity = data.quantity;
    this.unit = data.unit;
    this.budget = data.budget;
    this.status = data.status || 'draft'; // draft, sent, accepted, rejected, completed
    this.notes = data.notes;
  }

  static get tableName() {
    return 'purchase_requests';
  }
}

module.exports = PurchaseRequest;
