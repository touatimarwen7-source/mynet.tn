const BaseEntity = require('./BaseEntity');

class Tender extends BaseEntity {
    constructor(data = {}) {
        super(data);
        this.tender_number = data.tender_number || '';
        this.title = data.title || '';
        this.description = data.description || '';
        this.category = data.category || '';
        this.budget_min = data.budget_min || 0;
        this.budget_max = data.budget_max || 0;
        this.currency = data.currency || 'TND';
        this.status = data.status || 'draft';
        this.publish_date = data.publish_date || null;
        this.deadline = data.deadline || null;
        this.opening_date = data.opening_date || null;
        this.requirements = data.requirements || [];
        this.attachments = data.attachments || [];
        this.buyer_id = data.buyer_id || null;
        this.is_public = data.is_public || true;
        this.evaluation_criteria = data.evaluation_criteria || {};
    }

    toJSON() {
        const baseData = super.toJSON();
        return {
            ...baseData,
            tender_number: this.tender_number,
            title: this.title,
            description: this.description,
            category: this.category,
            budget_min: this.budget_min,
            budget_max: this.budget_max,
            currency: this.currency,
            status: this.status,
            publish_date: this.publish_date,
            deadline: this.deadline,
            opening_date: this.opening_date,
            requirements: this.requirements,
            attachments: this.attachments,
            buyer_id: this.buyer_id,
            is_public: this.is_public,
            evaluation_criteria: this.evaluation_criteria
        };
    }
}

module.exports = Tender;
