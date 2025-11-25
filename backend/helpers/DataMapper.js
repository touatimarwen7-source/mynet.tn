/**
 * DataMapper Helper - Backend Mapping Pattern
 * 
 * Purpose: Map frontend field names to database schema
 * Benefits:
 * - Security: Filter out unknown fields
 * - Flexibility: Frontend can send extra fields, backend ignores them
 * - Maintainability: Single source of truth for field mappings
 * - Consistency: Same pattern across all services
 * 
 * Usage:
 * const mapped = DataMapper.mapUser(frontendData);
 * const mapped = DataMapper.mapOffer(frontendData);
 */

class DataMapper {
    /**
     * Generic mapper - map any data to allowed fields
     */
    static mapData(data, allowedFields) {
        const mapped = {};
        
        // Only copy allowed fields
        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                mapped[field] = data[field];
            }
        });
        
        return mapped;
    }

    /**
     * Map User data (registration, profile update)
     * Allowed frontend fields → Database columns
     */
    static mapUser(userData) {
        const allowedFields = [
            'username', 'email', 'password', 'full_name', 'phone',
            'role', 'company_name', 'company_registration'
        ];
        
        return this.mapData(userData, allowedFields);
    }

    /**
     * Map Tender data
     * frontend: {title, description, publication_date, specification_documents, ...}
     * database: {title, description, publish_date, attachments, ...}
     */
    static mapTender(tenderData) {
        const mapped = {};
        
        const allowedFields = [
            'title', 'description', 'category', 'budget_min', 'budget_max',
            'currency', 'status', 'deadline', 'opening_date', 'requirements',
            'attachments', 'lots', 'participation_eligibility', 'mandatory_documents',
            'disqualification_criteria', 'submission_method', 'sealed_envelope_requirements',
            'contact_person', 'contact_email', 'contact_phone', 'technical_specifications',
            'queries_start_date', 'queries_end_date', 'offer_validity_days', 'alert_type',
            'is_public', 'evaluation_criteria'
        ];
        
        // Copy allowed fields
        allowedFields.forEach(field => {
            if (tenderData[field] !== undefined) {
                mapped[field] = tenderData[field];
            }
        });
        
        // Special mappings
        if (tenderData.publish_date !== undefined) {
            mapped.publish_date = tenderData.publish_date;
        } else if (tenderData.publication_date !== undefined) {
            mapped.publish_date = tenderData.publication_date;
        }
        
        // Merge specification_documents into attachments
        if (tenderData.specification_documents && Array.isArray(tenderData.specification_documents)) {
            mapped.attachments = mapped.attachments || [];
            mapped.attachments = [
                ...mapped.attachments,
                ...tenderData.specification_documents
            ];
        }
        
        return mapped;
    }

    /**
     * Map Offer data
     */
    static mapOffer(offerData) {
        const allowedFields = [
            'tender_id', 'supplier_id', 'total_amount', 'currency',
            'delivery_time', 'payment_terms', 'technical_proposal',
            'financial_proposal', 'attachments', 'status', 'evaluation_score',
            'evaluation_notes', 'is_winner'
        ];
        
        return this.mapData(offerData, allowedFields);
    }

    /**
     * Map Invoice data
     */
    static mapInvoice(invoiceData) {
        const allowedFields = [
            'tender_id', 'offer_id', 'invoice_number', 'amount',
            'currency', 'invoice_date', 'due_date', 'status',
            'payment_terms', 'description', 'attachments'
        ];
        
        return this.mapData(invoiceData, allowedFields);
    }

    /**
     * Map Purchase Order data
     */
    static mapPurchaseOrder(poData) {
        const allowedFields = [
            'tender_id', 'offer_id', 'supplier_id', 'po_number',
            'amount', 'currency', 'delivery_date', 'status',
            'description', 'attachments', 'terms'
        ];
        
        return this.mapData(poData, allowedFields);
    }

    /**
     * Map Review data
     */
    static mapReview(reviewData) {
        const allowedFields = [
            'tender_id', 'offer_id', 'supplier_id', 'rating',
            'comment', 'attachment'
        ];
        
        return this.mapData(reviewData, allowedFields);
    }

    /**
     * Map Evaluation data
     */
    static mapEvaluation(evaluationData) {
        const allowedFields = [
            'tender_id', 'offer_id', 'technical_score', 'financial_score',
            'delivery_score', 'quality_score', 'notes', 'evaluated_by'
        ];
        
        return this.mapData(evaluationData, allowedFields);
    }

    /**
     * Map Award data
     */
    static mapAward(awardData) {
        const allowedFields = [
            'tender_id', 'offer_id', 'supplier_id', 'lot_id',
            'awarded_amount', 'currency', 'status'
        ];
        
        return this.mapData(awardData, allowedFields);
    }

    /**
     * Map Chat/Message data
     */
    static mapMessage(messageData) {
        const allowedFields = [
            'recipient_id', 'subject', 'body', 'attachment'
        ];
        
        return this.mapData(messageData, allowedFields);
    }

    /**
     * Map Subscription data
     */
    static mapSubscription(subscriptionData) {
        const allowedFields = [
            'plan_id', 'user_id', 'start_date', 'end_date', 'auto_renew', 'status'
        ];
        
        return this.mapData(subscriptionData, allowedFields);
    }

    /**
     * Map Addendum data
     */
    static mapAddendum(addendumData) {
        const allowedFields = [
            'tender_id', 'title', 'description', 'attachment', 'effective_date'
        ];
        
        return this.mapData(addendumData, allowedFields);
    }

    /**
     * Map Inquiry data
     */
    static mapInquiry(inquiryData) {
        const allowedFields = [
            'tender_id', 'question', 'supplier_name', 'supplier_email'
        ];
        
        return this.mapData(inquiryData, allowedFields);
    }

    /**
     * Filter sensitive fields from response (don't expose in API)
     */
    static filterSensitiveFields(data, fieldsToRemove = []) {
        const defaultSensitiveFields = [
            'password_hash', 'password_salt', 'encrypted_data',
            'encryption_iv', 'decryption_key_id', 'api_key'
        ];
        
        const allSensitiveFields = [...defaultSensitiveFields, ...fieldsToRemove];
        
        if (Array.isArray(data)) {
            return data.map(item => this.filterSensitiveFields(item, fieldsToRemove));
        }
        
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        
        const filtered = { ...data };
        allSensitiveFields.forEach(field => {
            delete filtered[field];
        });
        
        return filtered;
    }
}

module.exports = DataMapper;
