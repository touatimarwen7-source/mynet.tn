import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress, Container } from '@mui/material';
import institutionalTheme from './theme/theme';
import AlertStrip from './components/AlertStrip';
import UnifiedHeader from './components/UnifiedHeader';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import Sidebar from './components/Sidebar';
import { ToastContext } from './contexts/ToastContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { SuperAdminProvider } from './contexts/SuperAdminContext';
import { AppProvider, useApp } from './contexts/AppContext';

// Core pages (eager load)
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordReset from './pages/PasswordReset';
import EmailVerification from './pages/EmailVerification';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Lazy load heavy pages
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TenderList = lazy(() => import('./pages/TenderList.Optimized'));
const CreateTender = lazy(() => import('./pages/CreateTender'));
const CreateBid = lazy(() => import('./pages/CreateBid'));
const CreateSupplyRequest = lazy(() => import('./pages/CreateSupplyRequest'));
const CreateInvoice = lazy(() => import('./pages/CreateInvoice'));
const TenderDetail = lazy(() => import('./pages/TenderDetail.Optimized'));
const MyOffers = lazy(() => import('./pages/MyOffers'));
const Profile = lazy(() => import('./pages/Profile'));
const AuditLog = lazy(() => import('./pages/AuditLog'));
const PartialAward = lazy(() => import('./pages/PartialAward'));
const OfferAnalysis = lazy(() => import('./pages/OfferAnalysis'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const BuyerActiveTenders = lazy(() => import('./pages/BuyerActiveTenders'));
const BidComparison = lazy(() => import('./pages/BidComparison'));
const InvoiceManagement = lazy(() => import('./pages/InvoiceManagement'));
const FinancialReports = lazy(() => import('./pages/FinancialReports'));
const BudgetManagement = lazy(() => import('./pages/BudgetManagement'));
const TenderEvaluation = lazy(() => import('./pages/TenderEvaluation'));
const TenderAwarding = lazy(() => import('./pages/TenderAwarding'));
const TeamPermissions = lazy(() => import('./pages/TeamPermissions'));
const SupplierProductsManagement = lazy(() => import('./pages/SupplierProductsManagement'));
const SupplierServicesManagement = lazy(() => import('./pages/SupplierServicesManagement'));
const BidSubmission = lazy(() => import('./pages/BidSubmission'));
const ContractManagement = lazy(() => import('./pages/ContractManagement'));
const DeliveryManagement = lazy(() => import('./pages/DeliveryManagement'));
const AwardNotifications = lazy(() => import('./pages/AwardNotifications'));
const PerformanceMonitoring = lazy(() => import('./pages/PerformanceMonitoring'));
const DisputeManagement = lazy(() => import('./pages/DisputeManagement'));
const InvoiceGeneration = lazy(() => import('./pages/InvoiceGeneration'));
const MonitoringSubmissions = lazy(() => import('./pages/MonitoringSubmissions'));
const TestingChecklist = lazy(() => import('./pages/TestingChecklist'));
const TenderChat = lazy(() => import('./pages/TenderChat'));
const TenderSecuritySettings = lazy(() => import('./pages/TenderSecuritySettings'));
const TenderPreferencesSettings = lazy(() => import('./pages/TenderPreferencesSettings'));
const TeamManagement = lazy(() => import('./pages/TeamManagement'));
const SupplierSearch = lazy(() => import('./pages/SupplierSearch'));
const SupplierDashboard = lazy(() => import('./pages/SupplierDashboard'));
const AdminGuide = lazy(() => import('./pages/AdminGuide'));
const SubmitBid = lazy(() => import('./pages/SubmitBid'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter'));
const CreateOffer = lazy(() => import('./pages/CreateOffer'));
const SupplierCatalog = lazy(() => import('./pages/SupplierCatalog'));
const SupplierProfile = lazy(() => import('./pages/SupplierProfile'));
const SupplierInvoices = lazy(() => import('./pages/SupplierInvoices'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SuperAdminMenuDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard/index'));
const AdminPortal = lazy(() => import('./pages/AdminPortal/index'));
const SubscriptionManagement = lazy(() => import('./pages/AdminPortal/SubscriptionManagement'));
const EmailNotificationCenter = lazy(() => import('./pages/AdminPortal/EmailNotificationCenter'));
const BackupRestore = lazy(() => import('./pages/AdminPortal/BackupRestore'));
const AdminAssistantManagement = lazy(() => import('./pages/AdminPortal/AdminAssistantManagement'));
const MFASetup = lazy(() => import('./pages/MFASetup'));
const AuditLogViewer = lazy(() => import('./pages/AuditLogViewer'));
const HealthMonitoring = lazy(() => import('./pages/HealthMonitoring'));
const ArchiveManagement = lazy(() => import('./pages/ArchiveManagement'));
const SubscriptionTiers = lazy(() => import('./pages/SubscriptionTiers'));
const FeatureControl = lazy(() => import('./pages/FeatureControl'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile'));
const CompanyProfileAdmin = lazy(() => import('./pages/CompanyProfileAdmin'));
const DirectSupplyRequest = lazy(() => import('./pages/DirectSupplyRequest'));
const MySupplyRequests = lazy(() => import('./pages/MySupplyRequests'));
const SupplierRequests = lazy(() => import('./pages/SupplierRequests'));
const SupplierReviews = lazy(() => import('./pages/SupplierReviews'));
const Inbox = lazy(() => import('./pages/Inbox'));
const Compose = lazy(() => import('./pages/Compose'));
const MessageDetail = lazy(() => import('./pages/MessageDetail'));
const PurchaseOrders = lazy(() => import('./pages/PurchaseOrders'));
const POManagement = lazy(() => import('./pages/POManagement'));
const PODetail = lazy(() => import('./pages/PODetail'));
const ReviewsList = lazy(() => import('./pages/ReviewsList'));
const SuperAdminCRUD = lazy(() => import('./pages/SuperAdminCRUD'));
const FileManagement = lazy(() => import('./pages/FileManagement'));
const EmailNotifications = lazy(() => import('./pages/EmailNotifications'));
const BuyerAnalytics = lazy(() => import('./pages/BuyerAnalytics'));
const SupplierAnalytics = lazy(() => import('./pages/SupplierAnalytics'));
const SupplierPerformanceTracking = lazy(() => import('./pages/SupplierPerformanceTracking'));
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlans'));
const PageEditor = lazy(() => import('./pages/PageEditor'));
const SuperAdminMenu = lazy(() => import('./pages/SuperAdminMenu'));
const OpeningReport = lazy(() => import('./pages/OpeningReport'));
const DraftsPage = lazy(() => import('./pages/DraftsPage'));

const LoadingFallback = () => (
  <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress sx={{ color: institutionalTheme.palette.primary.main }} />
  </Container>
);

// Inner App Component - uses AppContext
function AppContent() {
  const { user, authLoading, logout, addToast } = useApp();

  if (authLoading) {
    return <Box sx={{ padding: '20px', textAlign: 'center' }}>Chargement en cours...</Box>;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={institutionalTheme}>
        <CssBaseline />
        <DarkModeProvider>
          <SuperAdminProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AlertStrip />
            <UnifiedHeader />
            <AppToastContainer />
          
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Sidebar Navigation - Show for authenticated users */}
            {user && <Sidebar user={user} onLogout={logout} />}

            <Box component="main" sx={{ flex: 1, overflowY: 'auto', paddingY: '20px', paddingX: { xs: '12px', sm: '20px' }, transition: 'all 0.3s ease-in-out' }}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
              {/* Pages Publiques */}
              <Route path="/" element={!user ? <HomePage /> : <Navigate to="/tenders" />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />

              {/* Authentification */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              <Route path="/verify-email" element={<EmailVerification />} />

              {/* Appels d'offres */}
              <Route path="/tenders" element={user ? <TenderList /> : <Navigate to="/login" />} />
              <Route path="/tender/security" element={<TenderSecuritySettings />} />
              <Route path="/tender/preferences" element={<TenderPreferencesSettings />} />
              <Route path="/tender/:id" element={<TenderDetail />} />
              <Route path="/tender/:id/audit-log" element={<AuditLog />} />
              <Route path="/tender/:id/award" element={<PartialAward />} />
              <Route path="/tender/:id/analysis" element={<OfferAnalysis />} />
              <Route 
                path="/tender/:tenderId/bid" 
                element={user?.role === 'supplier' ? <CreateBid /> : <Navigate to="/tenders" />} 
              />
              <Route 
                path="/tender/:tenderId/opening-report" 
                element={user?.role === 'buyer' ? <OpeningReport /> : <Navigate to="/tenders" />} 
              />
              <Route 
                path="/offer/:offerId/supply-request" 
                element={user?.role === 'supplier' ? <CreateSupplyRequest /> : <Navigate to="/tenders" />} 
              />
              <Route 
                path="/supply-request/:supplyRequestId/invoice" 
                element={user?.role === 'supplier' ? <CreateInvoice /> : <Navigate to="/tenders" />} 
              />

              {/* Interface Acheteur */}
              <Route 
              path="/buyer-dashboard" 
              element={user?.role === 'buyer' ? <BuyerDashboard /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/buyer-active-tenders" 
              element={user?.role === 'buyer' ? <BuyerActiveTenders /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/bid-comparison/:tenderId" 
              element={user?.role === 'buyer' ? <BidComparison /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/create-tender" 
              element={user?.role === 'buyer' ? <CreateTender /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/tender/:id/chat" 
              element={user ? <TenderChat /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/team-management" 
              element={user?.role === 'buyer' ? <TeamManagement /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/invoices" 
              element={user?.role === 'buyer' ? <InvoiceManagement /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/budgets" 
              element={user?.role === 'buyer' ? <BudgetManagement /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/financial-reports" 
              element={user?.role === 'buyer' ? <FinancialReports /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/security" 
              element={user ? <Profile /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/preferences" 
              element={user ? <Profile /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/team-permissions" 
              element={user?.role === 'buyer' ? <TeamPermissions /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/tender-evaluation" 
              element={user?.role === 'buyer' ? <TenderEvaluation /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/tender-awarding" 
              element={user?.role === 'buyer' ? <TenderAwarding /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/supplier-products" 
              element={user?.role === 'supplier' ? <SupplierProductsManagement /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/supplier-services" 
              element={user?.role === 'supplier' ? <SupplierServicesManagement /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/supplier-reports" 
              element={user?.role === 'supplier' ? <SupplierDashboard /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/bid-submission/:tenderId" 
              element={user?.role === 'supplier' ? <BidSubmission /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/contracts" 
              element={user?.role === 'buyer' ? <ContractManagement /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/deliveries" 
              element={user?.role === 'buyer' ? <DeliveryManagement /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/award-notifications" 
              element={user?.role === 'buyer' ? <AwardNotifications /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/performance" 
              element={user?.role === 'buyer' ? <PerformanceMonitoring /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/disputes" 
              element={user?.role === 'buyer' ? <DisputeManagement /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/invoice-generation" 
              element={user?.role === 'buyer' ? <InvoiceGeneration /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/monitoring-submissions" 
              element={user?.role === 'buyer' ? <MonitoringSubmissions /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/testing-checklist" 
              element={<TestingChecklist />} 
            />
              <Route 
              path="/supplier-payments" 
              element={user?.role === 'supplier' ? <SupplierInvoices /> : <Navigate to="/tenders" />} 
            />

              {/* Interface Fournisseur */}
              <Route 
              path="/supplier-search" 
              element={user?.role === 'supplier' ? <SupplierSearch /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/tender/:id/bid" 
              element={user?.role === 'supplier' ? <SubmitBid /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/notifications" 
              element={user ? <NotificationCenter /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/supplier-catalog" 
              element={user?.role === 'supplier' ? <SupplierCatalog /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/supplier-invoices" 
              element={user?.role === 'supplier' ? <SupplierInvoices /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/my-offers" 
              element={user?.role === 'supplier' ? <MyOffers /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/create-offer/:tenderId" 
              element={user?.role === 'supplier' ? <CreateOffer /> : <Navigate to="/tenders" />} 
            />

              {/* Bons de Commande - Purchase Orders */}
              <Route 
              path="/po-management" 
              element={user?.role === 'buyer' ? <POManagement /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/po-detail/:id" 
              element={user?.role === 'buyer' ? <PODetail /> : <Navigate to="/tenders" />} 
            />

              {/* Avis et Évaluations - Reviews & Ratings */}
              <Route 
              path="/reviews" 
              element={user ? <ReviewsList /> : <Navigate to="/login" />} 
            />

              {/* Messaging System - Communication */}
              <Route 
              path="/inbox" 
              element={user ? <Inbox /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/compose" 
              element={user ? <Compose /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/message/:messageId" 
              element={user ? <MessageDetail /> : <Navigate to="/login" />} 
            />

              {/* Supply Requests & Invoices */}
              <Route 
              path="/my-supply-requests" 
              element={user?.role === 'buyer' ? <MySupplyRequests /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/supplier-requests" 
              element={user?.role === 'supplier' ? <SupplierRequests /> : <Navigate to="/tenders" />} 
            />

              {/* Analytics - Priority 3 */}
              <Route 
              path="/buyer-analytics" 
              element={user?.role === 'buyer' ? <BuyerAnalytics /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/supplier-analytics" 
              element={user?.role === 'supplier' ? <SupplierAnalytics /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/performance-tracking" 
              element={user?.role === 'buyer' ? <SupplierPerformanceTracking /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/subscription-plans" 
              element={user ? <SubscriptionPlans /> : <Navigate to="/login" />} 
            />

              {/* Administration */}
              {/* Admin Portal - Main Interface */}
              {/* Admin Portal Routes */}
              <Route 
              path="/admin-portal" 
              element={user?.role === 'super_admin' ? <AdminPortal /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/admin-portal/subscriptions" 
              element={user?.role === 'super_admin' ? <SubscriptionManagement /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/admin-portal/notifications" 
              element={user?.role === 'super_admin' ? <EmailNotificationCenter /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/admin-portal/backup-restore" 
              element={user?.role === 'super_admin' ? <BackupRestore /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/admin-portal/assistants" 
              element={user?.role === 'super_admin' ? <AdminAssistantManagement /> : <Navigate to="/tenders" />} 
            />
              {/* Super Admin - Main Dashboard */}
              <Route 
              path="/super-admin/dashboard" 
              element={user?.role === 'super_admin' ? <SuperAdminDashboard /> : <Navigate to="/tenders" />} 
            />
              {/* Super Admin - Menu & CRUD */}
              <Route 
              path="/super-admin-menu" 
              element={user?.role === 'super_admin' ? <SuperAdminMenu /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/super-admin" 
              element={user?.role === 'super_admin' ? <SuperAdminCRUD /> : <Navigate to="/tenders" />} 
            />
              {/* Admin - Limited Permissions */}
              <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/tenders" />} 
            />
              {/* Page Editor */}
              <Route 
              path="/super-admin/page-editor" 
              element={user?.role === 'super_admin' ? <PageEditor /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/super-admin/page-editor/:pageId" 
              element={user?.role === 'super_admin' ? <PageEditor /> : <Navigate to="/tenders" />} 
            />

              {/* Super Admin Only Routes */}
              <Route 
              path="/super-admin/audit-logs" 
              element={user?.role === 'super_admin' ? <AuditLogViewer /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/super-admin/health" 
              element={user?.role === 'super_admin' ? <HealthMonitoring /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/super-admin/archive" 
              element={user?.role === 'super_admin' ? <ArchiveManagement /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/super-admin/tiers" 
              element={user?.role === 'super_admin' ? <SubscriptionTiers /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/super-admin/features" 
              element={user?.role === 'super_admin' ? <FeatureControl /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/super-admin/users" 
              element={user?.role === 'super_admin' ? <UserManagement /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/super-admin/files" 
              element={user?.role === 'super_admin' ? <FileManagement /> : <Navigate to="/tenders" />} 
            />
              
              {/* Admin Routes (Redirect to Super Admin) */}
              <Route 
              path="/admin" 
              element={<Navigate to="/super-admin/dashboard" />} 
            />
              <Route 
              path="/admin/audit-logs" 
              element={<Navigate to="/super-admin/audit-logs" />} 
            />
              <Route 
              path="/admin/health" 
              element={<Navigate to="/super-admin/health" />} 
            />
              <Route 
              path="/admin/archive" 
              element={<Navigate to="/super-admin/archive" />} 
            />
              <Route 
              path="/admin/users" 
              element={<Navigate to="/super-admin/users" />} 
            />
              <Route 
              path="/user-management" 
              element={user?.role === 'super_admin' ? <UserManagement /> : <Navigate to="/tenders" />} 
            />

              {/* Email Notifications */}
              <Route 
              path="/email-notifications" 
              element={user?.role === 'super_admin' ? <EmailNotifications /> : <Navigate to="/tenders" />} 
            />

              {/* Profil et Sécurité */}
              <Route 
              path="/profile" 
              element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/company-profile" 
              element={user ? <CompanyProfile /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/company-profile/admin" 
              element={user?.role === 'supplier' || user?.role === 'buyer' || user?.role === 'admin' ? <CompanyProfileAdmin /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/direct-supply-request" 
              element={user?.role === 'buyer' ? <DirectSupplyRequest /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/my-supply-requests" 
              element={user?.role === 'buyer' ? <MySupplyRequests /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/supplier-requests" 
              element={user?.role === 'supplier' ? <SupplierRequests /> : <Navigate to="/tenders" />} 
            />
              <Route 
              path="/supplier-reviews/:supplierId" 
              element={user ? <SupplierReviews /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/inbox" 
              element={user ? <Inbox /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/compose" 
              element={user ? <Compose /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/message/:messageId" 
              element={user ? <MessageDetail /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/purchase-orders" 
              element={user ? <PurchaseOrders /> : <Navigate to="/login" />} 
            />
              <Route 
              path="/mfa-setup" 
              element={user ? <MFASetup /> : <Navigate to="/login" />} 
            />

              {/* Par défaut */}
              <Route path="*" element={<Navigate to="/tenders" />} />
            </Routes>
          </Suspense>
            </Box>
          </Box>

        <Box component="footer" sx={{ backgroundColor: '#F9F9F9', borderTop: '1px solid #E0E0E0', padding: '20px', textAlign: 'center', fontSize: '13px', color: '#616161' }}>
          &copy; 2025 MyNet.tn - Système de Gestion des Appels d'Offres et des Achats
        </Box>
            </Box>
          </Router>
            </SuperAdminProvider>
          </DarkModeProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

// Toast Container Component using AppContext
function AppToastContainer() {
  const { toasts, removeToast } = useApp();
  
  return <ToastContainer toasts={toasts} removeToast={removeToast} />;
}

// Main App with AppProvider wrapper
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

// Dark Mode Toggle Button for navbar - add to navbar section:
// <button onClick={toggleDarkMode} className="btn-dark-mode">
//   {isDarkMode ? '☀️' : '🌙'}
// </button>

// Add to navbar after nav-brand (around line 85):
// <LanguageSwitcher />

/* Added imports in main App.jsx */
// Financial corporate styling import (add at end of imports if not present)
// Already added in CSS imports

// Global CSS override for MUI Box
const globalBoxStyles = {
  '& .MuiBox-root': {
    '&[style*="display: flex"]': {
      // تطبيق default spacing
      gap: 'inherit'
    }
  }
};

// Initialize logging and analytics
import { logger } from './utils/logger';
import { analytics } from './utils/analytics';

logger.info('MyNet Frontend Started');
analytics.trackPageView();

// Track page changes
window.addEventListener('popstate', () => {
  analytics.trackPageView();
});
