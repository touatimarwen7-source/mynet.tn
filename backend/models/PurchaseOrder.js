const BaseEntity = require('./BaseEntity');

class PurchaseOrder extends BaseEntity {
    constructor(data = {}) {
        super(data);
        this.po_number = data.po_number || '';
        this.tender_id = data.tender_id || null;
        this.offer_id = data.offer_id || null;
        this.supplier_id = data.supplier_id || null;
        this.buyer_id = data.buyer_id || null;
        this.total_amount = data.total_amount || 0;
        this.currency = data.currency || 'TND';
        this.status = data.status || 'pending';
        this.issue_date = data.issue_date || new Date();
        this.delivery_date = data.delivery_date || null;
        this.payment_terms = data.payment_terms || '';
        this.terms_and_conditions = data.terms_and_conditions || '';
        this.items = data.items || [];
        this.attachments = data.attachments || [];
        this.notes = data.notes || '';
    }

    toJSON() {
        const baseData = super.toJSON();
        return {
            ...baseData,
            po_number: this.po_number,
            tender_id: this.tender_id,
            offer_id: this.offer_id,
            supplier_id: this.supplier_id,
            buyer_id: this.buyer_id,
            total_amount: this.total_amount,
            currency: this.currency,
            status: this.status,
            issue_date: this.issue_date,
            delivery_date: this.delivery_date,
            payment_terms: this.payment_terms,
            terms_and_conditions: this.terms_and_conditions,
            items: this.items,
            attachments: this.attachments,
            notes: this.notes
        };
    }
}

module.exports = PurchaseOrder;
