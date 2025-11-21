/**
 * Utility function to set page titles dynamically
 * Format: "MyNet.tn - [Page Title]"
 */
export const setPageTitle = (pageTitle) => {
  const fullTitle = `MyNet.tn - ${pageTitle}`;
  document.title = fullTitle;
};

export const pageNames = {
  // Auth Pages
  login: "Connexion Sécurisée",
  register: "Inscription",
  
  // Tenders
  tenderList: "Appels d'Offres",
  tenderDetail: "Détails de l'Appel d'Offres",
  createTender: "Créer un Appel d'Offres",
  createTenderImproved: "Nouvelle Manaçse",
  
  // Offers & Bids
  myOffers: "Mes Offres",
  createOffer: "Soumission d'Offre Sécurisée",
  submitBid: "Soumettre une Enchère",
  
  // Buyer Dashboard
  buyerDashboard: "Tableau de Bord Acheteur",
  invoiceManagement: "Gestion des Factures",
  teamManagement: "Gestion de l'Équipe",
  partialAward: "ترسية Partielle",
  offerAnalysis: "Analyse des Offres",
  
  // Supplier Pages
  supplierSearch: "Rechercher des Appels d'Offres",
  supplierCatalog: "Mon Catalogue de Produits",
  supplierProfile: "Profil du Fournisseur",
  supplierInvoices: "Mes Factures",
  
  // Admin Pages
  adminDashboard: "Tableau de Contrôle Administrateur",
  auditLogViewer: "Journaux d'Audit",
  healthMonitoring: "Surveillance de la Santé",
  archiveManagement: "Gestion des Archives",
  subscriptionTiers: "Niveaux d'Abonnement",
  featureControl: "Contrôle des Fonctionnalités",
  userManagement: "Gestion des Utilisateurs",
  
  // User Pages
  profile: "Mon Profil",
  mfaSetup: "Configuration de l'Authentification MFA",
  auditLog: "Journal d'Audit",
  notificationCenter: "Centre de Notifications",
  
  // Collaboration
  tenderChat: "Discussion sur l'Appel d'Offres",
};
