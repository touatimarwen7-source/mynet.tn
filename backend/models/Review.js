
const BaseEntity = require('./BaseEntity');

class Review extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.purchase_order_id = data.purchase_order_id;
    this.reviewer_id = data.reviewer_id; // buyer or supplier
    this.reviewee_id = data.reviewee_id; // the other party
    this.rating = data.rating; // 1-5
    this.comment = data.comment;
    this.is_verified = data.is_verified || false; // verified after PO completion
  }

  static get tableName() {
    return 'reviews';
  }
}

module.exports = Review;
