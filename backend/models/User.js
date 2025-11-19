const BaseEntity = require('./BaseEntity');

class User extends BaseEntity {
    constructor(data = {}) {
        super(data);
        this.username = data.username || '';
        this.email = data.email || '';
        this.password_hash = data.password_hash || '';
        this.password_salt = data.password_salt || '';
        this.full_name = data.full_name || '';
        this.phone = data.phone || '';
        this.role = data.role || 'viewer';
        this.company_name = data.company_name || '';
        this.company_registration = data.company_registration || '';
        this.is_verified = data.is_verified || false;
        this.is_active = data.is_active || true;
        this.last_login = data.last_login || null;
    }

    toJSON() {
        const baseData = super.toJSON();
        return {
            ...baseData,
            username: this.username,
            email: this.email,
            full_name: this.full_name,
            phone: this.phone,
            role: this.role,
            company_name: this.company_name,
            company_registration: this.company_registration,
            is_verified: this.is_verified,
            is_active: this.is_active,
            last_login: this.last_login
        };
    }
}

module.exports = User;
