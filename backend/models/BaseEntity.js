class BaseEntity {
    constructor(data = {}) {
        this.id = data.id || null;
        this.created_at = data.created_at || new Date();
        this.updated_at = data.updated_at || new Date();
        this.created_by = data.created_by || null;
        this.updated_by = data.updated_by || null;
        this.is_deleted = data.is_deleted || false;
    }

    toJSON() {
        return {
            id: this.id,
            created_at: this.created_at,
            updated_at: this.updated_at,
            created_by: this.created_by,
            updated_by: this.updated_by
        };
    }
}

module.exports = BaseEntity;
