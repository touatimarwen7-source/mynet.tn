
class CreateOfferDTO {
    constructor(data) {
        this.tender_id = data.tender_id;
        this.total_amount = data.total_amount;
        this.currency = data.currency || 'TND';
        this.delivery_time = data.delivery_time;
        this.payment_terms = data.payment_terms;
        this.technical_proposal = data.technical_proposal;
        this.financial_proposal = data.financial_proposal;
        this.attachments = data.attachments || [];
    }

    validate() {
        const errors = [];

        if (!this.tender_id) {
            errors.push('tender_id is required');
        }

        if (!this.total_amount || this.total_amount <= 0) {
            errors.push('total_amount must be greater than 0');
        }

        if (!this.delivery_time || this.delivery_time.trim() === '') {
            errors.push('delivery_time is required');
        }

        if (!this.technical_proposal || this.technical_proposal.trim() === '') {
            errors.push('technical_proposal is required');
        }

        if (!this.financial_proposal || this.financial_proposal.trim() === '') {
            errors.push('financial_proposal is required');
        }

        if (this.currency && !['TND', 'USD', 'EUR'].includes(this.currency)) {
            errors.push('currency must be TND, USD, or EUR');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = CreateOfferDTO;
