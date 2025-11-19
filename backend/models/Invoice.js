
const BaseEntity = require('./BaseEntity');

class Invoice extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.purchase_order_id = data.purchase_order_id;
    this.supplier_id = data.supplier_id;
    this.invoice_number = data.invoice_number;
    this.amount = data.amount;
    this.tax = data.tax || 0;
    this.total = data.total;
    this.issue_date = data.issue_date;
    this.due_date = data.due_date;
    this.status = data.status || 'draft'; // draft, sent, paid, overdue
    this.payment_date = data.payment_date;
    this.notes = data.notes;
  }

  static get tableName() {
    return 'invoices';
  }
}

module.exports = Invoice;
