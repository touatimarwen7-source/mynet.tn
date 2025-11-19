const BaseEntity = require('./BaseEntity');

class Offer extends BaseEntity {
    constructor(data = {}) {
        super(data);
        this.tender_id = data.tender_id || null;
        this.supplier_id = data.supplier_id || null;
        this.offer_number = data.offer_number || '';
        this.total_amount = data.total_amount || 0;
        this.currency = data.currency || 'TND';
        this.delivery_time = data.delivery_time || '';
        this.payment_terms = data.payment_terms || '';
        this.technical_proposal = data.technical_proposal || '';
        this.financial_proposal = data.financial_proposal || '';
        this.attachments = data.attachments || [];
        this.status = data.status || 'submitted';
        this.evaluation_score = data.evaluation_score || null;
        this.evaluation_notes = data.evaluation_notes || '';
        this.submitted_at = data.submitted_at || new Date();
        this.is_winner = data.is_winner || false;
    }

    toJSON() {
        const baseData = super.toJSON();
        return {
            ...baseData,
            tender_id: this.tender_id,
            supplier_id: this.supplier_id,
            offer_number: this.offer_number,
            total_amount: this.total_amount,
            currency: this.currency,
            delivery_time: this.delivery_time,
            payment_terms: this.payment_terms,
            technical_proposal: this.technical_proposal,
            financial_proposal: this.financial_proposal,
            attachments: this.attachments,
            status: this.status,
            evaluation_score: this.evaluation_score,
            evaluation_notes: this.evaluation_notes,
            submitted_at: this.submitted_at,
            is_winner: this.is_winner
        };
    }
}

module.exports = Offer;
