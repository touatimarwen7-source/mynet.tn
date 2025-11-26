/**
 * Sidebar menu definitions for all user roles
 * Organized by role: buyer, supplier, admin, super_admin
 */

export const buyerMenu = [
  {
    id: 'dashboard',
    label: 'Tableau de Bord',
    path: '/buyer-dashboard',
    featureKey: 'dashboard',
    subItems: []
  },
  {
    id: 'tenders',
    label: 'Appels d\'Offres',
    subItems: [
      { label: 'Actifs', path: '/buyer-active-tenders', featureKey: 'browsetenders' },
      { label: 'Créer un Appel', path: '/create-tender', featureKey: 'createtender' },
      { label: 'Soumissions', path: '/monitoring-submissions', featureKey: 'browsetenders' },
      { label: 'Évaluation', path: '/tender-evaluation', featureKey: 'analytics' },
      { label: 'Attribution', path: '/tender-awarding', featureKey: 'analytics' },
      { label: 'Notifications', path: '/award-notifications', featureKey: 'analytics' },
      { label: 'المسودات', path: '/drafts', featureKey: 'drafts' }
    ]
  },
  {
    id: 'finances',
    label: 'Finances',
    subItems: [
      { label: 'Factures', path: '/invoices', featureKey: 'invoices' },
      { label: 'Génération', path: '/invoice-generation', featureKey: 'invoices' },
      { label: 'Budgets', path: '/budgets', featureKey: 'budgets' },
      { label: 'Rapports Financiers', path: '/financial-reports', featureKey: 'customreports' }
    ]
  },
  {
    id: 'operations',
    label: 'Opérations',
    subItems: [
      { label: 'Contrats', path: '/contracts', featureKey: 'operations' },
      { label: 'Livraisons', path: '/deliveries', featureKey: 'operations' },
      { label: 'Performance', path: '/performance', featureKey: 'operations' },
      { label: 'Litiges', path: '/disputes', featureKey: 'operations' }
    ]
  },
  {
    id: 'team',
    label: 'Équipe',
    subItems: [
      { label: 'Gestion d\'équipe', path: '/team-management', featureKey: 'teammanagement' },
      { label: 'Permissions', path: '/team-permissions', featureKey: 'teammanagement' },
      { label: 'Rôles', path: '/team-roles', featureKey: 'teammanagement' }
    ]
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/notifications',
    featureKey: 'notifications',
    subItems: []
  },
  {
    id: 'profile',
    label: 'Profil',
    featureKey: 'profile',
    subItems: [
      { label: 'Paramètres', path: '/profile', featureKey: 'profile' },
      { label: 'Sécurité', path: '/security', featureKey: 'profile' },
      { label: 'Préférences', path: '/preferences', featureKey: 'profile' }
    ]
  }
];

export const supplierMenu = [
  {
    id: 'dashboard',
    label: 'Tableau de Bord',
    path: '/supplier-search',
    featureKey: 'dashboard',
    subItems: []
  },
  {
    id: 'tenders',
    label: 'Appels d\'Offres',
    subItems: [
      { label: 'Parcourir', path: '/tenders', featureKey: 'browsetenders' },
      { label: 'Mes Offres', path: '/my-offers', featureKey: 'myoffers' },
      { label: 'Soumises', path: '/my-offers?status=submitted', featureKey: 'myoffers' },
      { label: 'Évaluées', path: '/my-offers?status=evaluated', featureKey: 'myoffers' }
    ]
  },
  {
    id: 'catalog',
    label: 'Catalogue',
    subItems: [
      { label: 'Gestion Produits', path: '/supplier-products', featureKey: 'catalog' },
      { label: 'Gestion Services', path: '/supplier-services', featureKey: 'catalog' },
      { label: 'Visibilité', path: '/supplier-catalog', featureKey: 'catalog' }
    ]
  },
  {
    id: 'finances',
    label: 'Finances',
    subItems: [
      { label: 'Factures', path: '/supplier-invoices', featureKey: 'invoices' },
      { label: 'Paiements', path: '/supplier-payments', featureKey: 'invoices' },
      { label: 'Rapports', path: '/supplier-reports', featureKey: 'customreports' }
    ]
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/notifications',
    featureKey: 'notifications',
    subItems: []
  },
  {
    id: 'profile',
    label: 'Profil',
    featureKey: 'profile',
    subItems: [
      { label: 'Paramètres', path: '/profile', featureKey: 'profile' },
      { label: 'Sécurité', path: '/security', featureKey: 'profile' },
      { label: 'Entreprise', path: '/company-info', featureKey: 'profile' }
    ]
  }
];

export const adminMenu = [
  {
    id: 'dashboard',
    label: 'Tableau de Bord',
    path: '/admin',
    subItems: []
  },
  {
    id: 'users',
    label: '👥 Gestion des Utilisateurs et Sécurité',
    subItems: [
      { label: 'Gestion des Utilisateurs', path: '/admin/users' }
    ]
  },
  {
    id: 'analytics',
    label: '📊 Statistiques',
    subItems: [
      { label: 'Afficher les Statistiques', path: '/admin/health' }
    ]
  },
  {
    id: 'profile',
    label: 'Profil',
    subItems: [
      { label: 'Paramètres', path: '/profile' },
      { label: 'Sécurité', path: '/security' }
    ]
  }
];

export const superAdminMenu = [
  {
    id: 'admin-portal',
    label: '🏛️ واجهة الإدارة الرسمية',
    subItems: [
      { label: 'لوحة المعلومات', path: '/admin-portal' },
      { label: 'إدارة الخطط', path: '/admin-portal/subscriptions' },
      { label: 'الإخطارات البريدية', path: '/admin-portal/notifications' },
      { label: 'النسخ الاحتياطية', path: '/admin-portal/backup-restore' },
      { label: '👥 المساعدون الإداريون', path: '/admin-portal/assistants' }
    ]
  },
  {
    id: 'dashboard',
    label: '📊 Centre de Contrôle',
    path: '/super-admin/dashboard',
    subItems: []
  },
  {
    id: 'users-mgmt',
    label: '👥 Gestion des Utilisateurs',
    subItems: [
      { label: 'Utilisateurs', path: '/super-admin/users' },
      { label: 'Gestion des Rôles', path: '/user-management' }
    ]
  },
  {
    id: 'content',
    label: '📄 Gestion du Contenu',
    subItems: [
      { label: 'Pages Statiques', path: '/super-admin' },
      { label: 'Éditeur de Pages', path: '/super-admin/page-editor' },
      { label: 'Gestion des Fichiers', path: '/super-admin/files' }
    ]
  },
  {
    id: 'system',
    label: '⚙️ Configuration Système',
    subItems: [
      { label: 'Paramètres', path: '/super-admin/features' },
      { label: 'Plans d\'Abonnement', path: '/super-admin/tiers' },
      { label: 'Sauvegarde & Restauration', path: '/super-admin/archive' }
    ]
  },
  {
    id: 'monitoring',
    label: '📊 Surveillance & Audit',
    subItems: [
      { label: 'Santé du Système', path: '/super-admin/health' },
      { label: 'Journaux d\'Audit', path: '/super-admin/audit-logs' },
      { label: 'Notifications Email', path: '/email-notifications' }
    ]
  },
  {
    id: 'functions',
    label: '🛠️ Toutes les Fonctions',
    path: '/super-admin-menu',
    subItems: []
  },
  {
    id: 'profile',
    label: 'Profil',
    subItems: [
      { label: 'Paramètres', path: '/profile' },
      { label: 'Sécurité', path: '/security' }
    ]
  }
];

export const getMenuForRole = (role) => {
  switch (role) {
    case 'buyer': return buyerMenu;
    case 'supplier': return supplierMenu;
    case 'admin': return adminMenu;
    case 'super_admin': return superAdminMenu;
    default: return [];
  }
};
