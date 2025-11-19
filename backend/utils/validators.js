class Validators {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPassword(password) {
        return password && password.length >= 6;
    }

    static isValidPhone(phone) {
        const phoneRegex = /^[0-9+\-\s()]+$/;
        return phoneRegex.test(phone);
    }

    static sanitizeString(str) {
        if (typeof str !== 'string') return str;
        return str.trim().replace(/[<>]/g, '');
    }

    static validateTenderData(data) {
        const errors = [];

        if (!data.title || data.title.trim().length < 5) {
            errors.push('Title must be at least 5 characters long');
        }

        if (!data.description || data.description.trim().length < 20) {
            errors.push('Description must be at least 20 characters long');
        }

        if (data.budget_min && data.budget_max && data.budget_min > data.budget_max) {
            errors.push('Minimum budget cannot be greater than maximum budget');
        }

        if (data.deadline && new Date(data.deadline) < new Date()) {
            errors.push('Deadline cannot be in the past');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateOfferData(data) {
        const errors = [];

        if (!data.tender_id) {
            errors.push('Tender ID is required');
        }

        if (!data.total_amount || data.total_amount <= 0) {
            errors.push('Total amount must be greater than 0');
        }

        if (!data.delivery_time || data.delivery_time.trim().length === 0) {
            errors.push('Delivery time is required');
        }

        if (!data.technical_proposal || data.technical_proposal.trim().length < 50) {
            errors.push('Technical proposal must be at least 50 characters long');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = Validators;
