const schemaQueries = [
    `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        password_salt VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'viewer',
        company_name VARCHAR(200),
        company_registration VARCHAR(100),
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP WITH TIME ZONE,
        mfa_enabled BOOLEAN DEFAULT FALSE,
        mfa_secret VARCHAR(255),
        mfa_backup_codes JSONB,
        average_rating DECIMAL(3,2) DEFAULT 0,
        preferred_categories JSONB DEFAULT '[]',
        service_locations JSONB DEFAULT '[]',
        minimum_budget DECIMAL(15,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        is_deleted BOOLEAN DEFAULT FALSE
    );`,

    `CREATE TABLE IF NOT EXISTS tenders (
        id SERIAL PRIMARY KEY,
        tender_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        budget_min DECIMAL(15, 2),
        budget_max DECIMAL(15, 2),
        currency VARCHAR(3) DEFAULT 'TND',
        status VARCHAR(20) DEFAULT 'draft',
        publish_date TIMESTAMP WITH TIME ZONE,
        deadline TIMESTAMP WITH TIME ZONE,
        opening_date TIMESTAMP WITH TIME ZONE,
        requirements JSONB,
        attachments JSONB,
        buyer_id INTEGER REFERENCES users(id),
        is_public BOOLEAN DEFAULT TRUE,
        evaluation_criteria JSONB,
        first_offer_at TIMESTAMP WITH TIME ZONE,
        is_archived BOOLEAN DEFAULT FALSE,
        archived_at TIMESTAMP WITH TIME ZONE,
        allow_partial_award BOOLEAN DEFAULT FALSE,
        max_winners INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        is_deleted BOOLEAN DEFAULT FALSE
    );`,

    `CREATE TABLE IF NOT EXISTS offers (
        id SERIAL PRIMARY KEY,
        tender_id INTEGER REFERENCES tenders(id),
        supplier_id INTEGER REFERENCES users(id),
        offer_number VARCHAR(50) UNIQUE NOT NULL,
        total_amount DECIMAL(15, 2),
        currency VARCHAR(3) DEFAULT 'TND',
        delivery_time VARCHAR(100),
        payment_terms TEXT,
        technical_proposal TEXT,
        financial_proposal TEXT,
        attachments JSONB,
        status VARCHAR(20) DEFAULT 'submitted',
        evaluation_score DECIMAL(5, 2),
        evaluation_notes TEXT,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_winner BOOLEAN DEFAULT FALSE,
        encrypted_data TEXT,
        decryption_key_id VARCHAR(255),
        encryption_iv VARCHAR(255),
        is_archived BOOLEAN DEFAULT FALSE,
        archived_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        is_deleted BOOLEAN DEFAULT FALSE
    );`,

    `CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        po_number VARCHAR(50) UNIQUE NOT NULL,
        tender_id INTEGER REFERENCES tenders(id),
        offer_id INTEGER REFERENCES offers(id),
        supplier_id INTEGER REFERENCES users(id),
        buyer_id INTEGER REFERENCES users(id),
        total_amount DECIMAL(15, 2),
        currency VARCHAR(3) DEFAULT 'TND',
        status VARCHAR(20) DEFAULT 'pending',
        issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        delivery_date TIMESTAMP WITH TIME ZONE,
        payment_terms TEXT,
        terms_and_conditions TEXT,
        items JSONB,
        attachments JSONB,
        notes TEXT,
        is_archived BOOLEAN DEFAULT FALSE,
        archived_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        is_deleted BOOLEAN DEFAULT FALSE
    );`,

    `CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        po_id INTEGER REFERENCES purchase_orders(id),
        supplier_id INTEGER REFERENCES users(id),
        buyer_id INTEGER REFERENCES users(id),
        amount DECIMAL(15, 2),
        tax_amount DECIMAL(15, 2),
        total_amount DECIMAL(15, 2),
        currency VARCHAR(3) DEFAULT 'TND',
        status VARCHAR(20) DEFAULT 'pending',
        issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP WITH TIME ZONE,
        payment_date TIMESTAMP WITH TIME ZONE,
        attachments JSONB,
        notes TEXT,
        is_archived BOOLEAN DEFAULT FALSE,
        archived_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        is_deleted BOOLEAN DEFAULT FALSE
    );`,

    `CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id),
        bio TEXT,
        profile_picture VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        tax_id VARCHAR(50),
        rating DECIMAL(3, 2) DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        preferences JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50),
        title VARCHAR(255),
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        related_entity_type VARCHAR(50),
        related_entity_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        related_entity_type VARCHAR(50),
        related_entity_id INTEGER,
        subject VARCHAR(255),
        content TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        attachments JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS archive_policies (
        id SERIAL PRIMARY KEY,
        entity_type VARCHAR(50) UNIQUE NOT NULL,
        retention_days INTEGER NOT NULL DEFAULT 2555,
        archive_action VARCHAR(20) DEFAULT 'archive',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        reviewer_id INTEGER REFERENCES users(id),
        reviewed_user_id INTEGER REFERENCES users(id),
        tender_id INTEGER REFERENCES tenders(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        details JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'TND',
        duration_days INTEGER NOT NULL,
        features JSONB,
        max_tenders INTEGER,
        max_offers INTEGER,
        max_products INTEGER DEFAULT 50,
        storage_limit INTEGER DEFAULT 5,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        plan_id INTEGER REFERENCES subscription_plans(id),
        start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'active',
        payment_method VARCHAR(50),
        transaction_id VARCHAR(255),
        auto_renew BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS supplier_features (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER REFERENCES users(id) NOT NULL,
        feature_key VARCHAR(100) NOT NULL,
        feature_name VARCHAR(255),
        category VARCHAR(50),
        is_enabled BOOLEAN DEFAULT FALSE,
        enabled_by INTEGER REFERENCES users(id),
        reason TEXT,
        enabled_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(supplier_id, feature_key)
    );`,

    `CREATE INDEX IF NOT EXISTS idx_supplier_features_supplier ON supplier_features(supplier_id);`,
    `CREATE INDEX IF NOT EXISTS idx_supplier_features_enabled ON supplier_features(is_enabled);`,
    `CREATE INDEX IF NOT EXISTS idx_supplier_features_expires ON supplier_features(expires_at);`,

    `CREATE TABLE IF NOT EXISTS tender_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tender_id INTEGER REFERENCES tenders(id),
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        previous_state VARCHAR(50),
        new_state VARCHAR(50),
        metadata JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS purchase_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        buyer_id INTEGER REFERENCES users(id),
        supplier_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        quantity INTEGER,
        unit VARCHAR(50),
        budget DECIMAL(15, 2),
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS tender_award_line_items (
        id SERIAL PRIMARY KEY,
        tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
        line_item_id VARCHAR(50) NOT NULL,
        item_description TEXT NOT NULL,
        total_quantity DECIMAL(15, 2) NOT NULL,
        unit VARCHAR(50),
        awarded_offers JSONB DEFAULT '[]',
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id),
        UNIQUE(tender_id, line_item_id)
    );`,

    `CREATE TABLE IF NOT EXISTS mfa_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        code VARCHAR(6) NOT NULL,
        purpose VARCHAR(50) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, purpose, is_used)
    );`,

    `CREATE TABLE IF NOT EXISTS supplier_verifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id),
        company_registration VARCHAR(100) NOT NULL,
        tax_id VARCHAR(50),
        verification_document JSONB,
        verification_status VARCHAR(20) DEFAULT 'pending',
        verified_at TIMESTAMP WITH TIME ZONE,
        verified_by INTEGER REFERENCES users(id),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS encryption_keys (
        id SERIAL PRIMARY KEY,
        key_id VARCHAR(255) UNIQUE NOT NULL,
        encrypted_key TEXT NOT NULL,
        key_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        rotated_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE
    );`,

    `CREATE TABLE IF NOT EXISTS feature_flags (
        id SERIAL PRIMARY KEY,
        feature_name VARCHAR(100) UNIQUE NOT NULL,
        feature_key VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_enabled BOOLEAN DEFAULT FALSE,
        category VARCHAR(50),
        requires_erp BOOLEAN DEFAULT FALSE,
        requires_payment BOOLEAN DEFAULT FALSE,
        requires_websocket BOOLEAN DEFAULT FALSE,
        enabled_at TIMESTAMP WITH TIME ZONE,
        disabled_at TIMESTAMP WITH TIME ZONE,
        created_by INTEGER REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS feature_flag_audits (
        id SERIAL PRIMARY KEY,
        feature_id INTEGER REFERENCES feature_flags(id),
        admin_id INTEGER REFERENCES users(id),
        action VARCHAR(50),
        previous_status BOOLEAN,
        new_status BOOLEAN,
        reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS opening_reports (
        id SERIAL PRIMARY KEY,
        tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
        opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        opened_by INTEGER REFERENCES users(id),
        total_offers_received INTEGER DEFAULT 0,
        total_valid_offers INTEGER DEFAULT 0,
        total_invalid_offers INTEGER DEFAULT 0,
        offers_data JSONB DEFAULT '[]',
        status VARCHAR(20) DEFAULT 'open',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(is_enabled);`,
    `CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);`,
    `CREATE INDEX IF NOT EXISTS idx_feature_flag_audits_feature ON feature_flag_audits(feature_id);`,
    `CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);`,
    `CREATE INDEX IF NOT EXISTS idx_tenders_buyer ON tenders(buyer_id);`,
    `CREATE INDEX IF NOT EXISTS idx_offers_tender ON offers(tender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_offers_supplier ON offers(supplier_id);`,
    `CREATE INDEX IF NOT EXISTS idx_po_tender ON purchase_orders(tender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);`,
    `CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);`,
    `CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON user_subscriptions(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_tender_history_tender ON tender_history(tender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_purchase_requests_buyer ON purchase_requests(buyer_id);`,
    `CREATE INDEX IF NOT EXISTS idx_purchase_requests_supplier ON purchase_requests(supplier_id);`,
    `CREATE INDEX IF NOT EXISTS idx_mfa_codes_user ON mfa_codes(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_supplier_verifications_user ON supplier_verifications(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_supplier_verifications_status ON supplier_verifications(verification_status);`,
    `CREATE INDEX IF NOT EXISTS idx_encryption_keys_active ON encryption_keys(is_active);`,
    `CREATE INDEX IF NOT EXISTS idx_tender_award_items_tender ON tender_award_line_items(tender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_tender_award_items_status ON tender_award_line_items(status);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_entity ON messages(related_entity_type, related_entity_id);`,
    
    // Indexes for company profile search and performance
    `CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON user_profiles(city);`,
    `CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON user_profiles(country);`,
    `CREATE INDEX IF NOT EXISTS idx_user_profiles_rating ON user_profiles(rating DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,
    `CREATE INDEX IF NOT EXISTS idx_users_average_rating ON users(average_rating DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);`,
    `CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);`,
    
    // Full text search support for company profiles
    `CREATE INDEX IF NOT EXISTS idx_users_company_name ON users USING GIN(to_tsvector('french', company_name));`,
    `CREATE INDEX IF NOT EXISTS idx_user_profiles_bio ON user_profiles USING GIN(to_tsvector('french', bio));`,
    
    // JSONB indexes for categories and service locations
    `CREATE INDEX IF NOT EXISTS idx_users_preferred_categories ON users USING GIN(preferred_categories);`,
    `CREATE INDEX IF NOT EXISTS idx_users_service_locations ON users USING GIN(service_locations);`,
    
    // Add is_archived column if it doesn't exist (for existing tables)
    `ALTER TABLE IF EXISTS tenders ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE IF EXISTS offers ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE IF EXISTS purchase_orders ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE IF EXISTS tenders ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE IF EXISTS offers ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE IF EXISTS purchase_orders ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;`,
    
    // Create indexes after columns exist
    `CREATE INDEX IF NOT EXISTS idx_tenders_archived ON tenders(is_archived);`,
    `CREATE INDEX IF NOT EXISTS idx_offers_archived ON offers(is_archived);`,
    `CREATE INDEX IF NOT EXISTS idx_po_archived ON purchase_orders(is_archived);`,
    `CREATE INDEX IF NOT EXISTS idx_invoices_archived ON invoices(is_archived);`,
    `CREATE INDEX IF NOT EXISTS idx_opening_reports_tender ON opening_reports(tender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_opening_reports_opened_at ON opening_reports(opened_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_opening_reports_status ON opening_reports(status);`,

    // Tender Inquiries Table
    `CREATE TABLE IF NOT EXISTS tender_inquiries (
        id SERIAL PRIMARY KEY,
        tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
        supplier_id INTEGER NOT NULL REFERENCES users(id),
        subject VARCHAR(255) NOT NULL,
        inquiry_text TEXT NOT NULL,
        attachments JSONB DEFAULT '[]',
        status VARCHAR(20) DEFAULT 'pending',
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
    );`,

    // Inquiry Responses Table
    `CREATE TABLE IF NOT EXISTS inquiry_responses (
        id SERIAL PRIMARY KEY,
        inquiry_id INTEGER NOT NULL REFERENCES tender_inquiries(id) ON DELETE CASCADE,
        tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
        response_text TEXT NOT NULL,
        attachments JSONB DEFAULT '[]',
        answered_by INTEGER REFERENCES users(id),
        answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
    );`,

    // Addenda Table (ملحق)
    `CREATE TABLE IF NOT EXISTS addenda (
        id SERIAL PRIMARY KEY,
        tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
        addendum_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        inquiry_responses JSONB DEFAULT '[]',
        published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        published_by INTEGER REFERENCES users(id),
        document_url VARCHAR(500),
        version INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
    );`,

    // Addendum Notifications Table
    `CREATE TABLE IF NOT EXISTS addendum_notifications (
        id SERIAL PRIMARY KEY,
        addendum_id INTEGER NOT NULL REFERENCES addenda(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP WITH TIME ZONE,
        notification_method VARCHAR(50) DEFAULT 'email',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    // Indexes for inquiry and addenda tables
    `CREATE INDEX IF NOT EXISTS idx_tender_inquiries_tender ON tender_inquiries(tender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_tender_inquiries_supplier ON tender_inquiries(supplier_id);`,
    `CREATE INDEX IF NOT EXISTS idx_tender_inquiries_status ON tender_inquiries(status);`,
    `CREATE INDEX IF NOT EXISTS idx_inquiry_responses_inquiry ON inquiry_responses(inquiry_id);`,
    `CREATE INDEX IF NOT EXISTS idx_inquiry_responses_tender ON inquiry_responses(tender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_addenda_tender ON addenda(tender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_addenda_number ON addenda(addendum_number);`,
    `CREATE INDEX IF NOT EXISTS idx_addendum_notifications_addendum ON addendum_notifications(addendum_id);`,
    `CREATE INDEX IF NOT EXISTS idx_addendum_notifications_user ON addendum_notifications(user_id);`,

];

async function initializeSchema(pool) {
    console.log('--- Initializing Database Schema ---');
    try {
        for (const query of schemaQueries) {
            await pool.query(query);
        }
        console.log('✅ SCHEMA: All tables created or verified successfully.');
        return true;
    } catch (error) {
        console.error('❌ SCHEMA ERROR: Failed to create one or more tables.');
        console.error('Error Details:', error.message);
        return false;
    }
}

module.exports = {
    initializeSchema
};