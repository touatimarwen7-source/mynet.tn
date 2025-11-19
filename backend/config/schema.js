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
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        subject VARCHAR(255),
        content TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        tender_id INTEGER REFERENCES tenders(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

    `CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);`,
    `CREATE INDEX IF NOT EXISTS idx_tenders_buyer ON tenders(buyer_id);`,
    `CREATE INDEX IF NOT EXISTS idx_offers_tender ON offers(tender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_offers_supplier ON offers(supplier_id);`,
    `CREATE INDEX IF NOT EXISTS idx_po_tender ON purchase_orders(tender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);`,
    `CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);`,
    `CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON user_subscriptions(user_id);`
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