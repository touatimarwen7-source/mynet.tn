
class CreateTenderDTO {
    constructor(data) {
        this.title = data.title;
        this.description = data.description;
        this.category = data.category;
        this.budget_min = data.budget_min;
        this.budget_max = data.budget_max;
        this.currency = data.currency || 'TND';
        this.deadline = data.deadline;
        this.requirements = data.requirements || [];
        this.attachments = data.attachments || [];
        this.is_public = data.is_public !== undefined ? data.is_public : true;
        this.evaluation_criteria = data.evaluation_criteria || {};
    }

    validate() {
        const errors = [];

        if (!this.title || this.title.trim() === '') {
            errors.push('title is required');
        }

        if (this.title && this.title.length < 5) {
            errors.push('title must be at least 5 characters');
        }

        if (!this.description || this.description.trim() === '') {
            errors.push('description is required');
        }

        if (!this.category || this.category.trim() === '') {
            errors.push('category is required');
        }

        if (this.budget_min && this.budget_max && this.budget_min > this.budget_max) {
            errors.push('budget_min cannot be greater than budget_max');
        }

        if (!this.deadline) {
            errors.push('deadline is required');
        }

        if (this.deadline && new Date(this.deadline) <= new Date()) {
            errors.push('deadline must be in the future');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = CreateTenderDTO;
