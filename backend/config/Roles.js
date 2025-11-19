const Roles = {
    ADMIN: 'admin',
    BUYER: 'buyer',
    SUPPLIER: 'supplier',
    ACCOUNTANT: 'accountant',
    VIEWER: 'viewer'
};

const Permissions = {
    CREATE_TENDER: 'create_tender',
    VIEW_TENDER: 'view_tender',
    EDIT_TENDER: 'edit_tender',
    DELETE_TENDER: 'delete_tender',
    SUBMIT_OFFER: 'submit_offer',
    VIEW_OFFER: 'view_offer',
    APPROVE_OFFER: 'approve_offer',
    REJECT_OFFER: 'reject_offer',
    CREATE_PURCHASE_ORDER: 'create_purchase_order',
    VIEW_PURCHASE_ORDER: 'view_purchase_order',
    MANAGE_USERS: 'manage_users',
    VIEW_REPORTS: 'view_reports',
    MANAGE_INVOICES: 'manage_invoices'
};

const RolePermissions = {
    [Roles.ADMIN]: Object.values(Permissions),
    [Roles.BUYER]: [
        Permissions.CREATE_TENDER,
        Permissions.VIEW_TENDER,
        Permissions.EDIT_TENDER,
        Permissions.VIEW_OFFER,
        Permissions.APPROVE_OFFER,
        Permissions.REJECT_OFFER,
        Permissions.CREATE_PURCHASE_ORDER,
        Permissions.VIEW_PURCHASE_ORDER,
        Permissions.VIEW_REPORTS
    ],
    [Roles.SUPPLIER]: [
        Permissions.VIEW_TENDER,
        Permissions.SUBMIT_OFFER,
        Permissions.VIEW_OFFER,
        Permissions.VIEW_PURCHASE_ORDER
    ],
    [Roles.ACCOUNTANT]: [
        Permissions.VIEW_TENDER,
        Permissions.VIEW_OFFER,
        Permissions.VIEW_PURCHASE_ORDER,
        Permissions.MANAGE_INVOICES,
        Permissions.VIEW_REPORTS
    ],
    [Roles.VIEWER]: [
        Permissions.VIEW_TENDER,
        Permissions.VIEW_OFFER,
        Permissions.VIEW_PURCHASE_ORDER,
        Permissions.VIEW_REPORTS
    ]
};

function hasPermission(userRole, permission) {
    const permissions = RolePermissions[userRole] || [];
    return permissions.includes(permission);
}

module.exports = {
    Roles,
    Permissions,
    RolePermissions,
    hasPermission
};
