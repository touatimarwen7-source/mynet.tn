import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import institutionalTheme from './theme/theme';
import AlertStrip from './components/AlertStrip';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import { ToastContext } from './contexts/ToastContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { SuperAdminProvider } from './contexts/SuperAdminContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { initializePrefetch } from './utils/prefetchRoutes';
import { LoadingFallback, TableLoadingFallback } from './components/OptimizedLoadingFallback';

// Dynamic imports for heavy components
const HeaderWrapper = lazy(() => import('./components/HeavyComponentsWrapper').then(m => ({ default: m.HeaderWrapper })));
const SidebarWrapper = lazy(() => import('./components/HeavyComponentsWrapper').then(m => ({ default: m.SidebarWrapper })));

// Core pages (eager load - critical for first paint)
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordReset from './pages/PasswordReset';
import EmailVerification from './pages/EmailVerification';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Lazy load non-critical pages
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
const MyOffers = lazy(() => import('./pages/MyOffers.Optimized'));
const Profile = lazy(() => import('./pages/Profile'));
const AuditLog = lazy(() => import('./pages/AuditLog'));
const PartialAward = lazy(() => import('./pages/PartialAward'));
const OfferAnalysis = lazy(() => import('./pages/OfferAnalysis'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const BuyerActiveTenders = lazy(() => import('./pages/BuyerActiveTenders'));
const BidComparison = lazy(() => import('./pages/BidComparison'));
const InvoiceManagement = lazy(() => import('./pages/InvoiceManagement.Optimized'));
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

function AppContent() {
  const { user, authLoading, logout, addToast } = useApp();

  // Initialize prefetch on mount and when user changes
  useEffect(() => {
    if (user) {
      initializePrefetch(user);
    }
  }, [user]);

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
                
                <Suspense fallback={<Box />}>
                  <HeaderWrapper />
                </Suspense>

                <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                  {user && (
                    <Suspense fallback={<Box />}>
                      <SidebarWrapper user={user} onLogout={logout} />
                    </Suspense>
                  )}

                  <Box component="main" sx={{ flex: 1, overflowY: 'auto', paddingY: '20px', paddingX: { xs: '12px', sm: '20px' } }}>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        {/* Public Pages */}
                        <Route path="/" element={!user ? <HomePage /> : <Navigate to="/tenders" />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/features" element={<FeaturesPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />

                        {/* Authentication */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/password-reset" element={<PasswordReset />} />
                        <Route path="/verify-email" element={<EmailVerification />} />

                        {/* Tenders */}
                        <Route path="/tenders" element={user ? <TenderList /> : <Navigate to="/login" />} />
                        <Route path="/tender/:id" element={<TenderDetail />} />
                        <Route path="/tender/:id/bid" element={user?.role === 'supplier' ? <CreateBid /> : <Navigate to="/tenders" />} />
                        <Route path="/tender/:id/award" element={<PartialAward />} />
                        <Route path="/tender/:id/analysis" element={<OfferAnalysis />} />
                        <Route path="/tender/:id/audit-log" element={<AuditLog />} />

                        {/* Offers */}
                        <Route path="/my-offers" element={user ? <MyOffers /> : <Navigate to="/login" />} />
                        <Route path="/offer/:offerId/supply-request" element={user?.role === 'supplier' ? <CreateSupplyRequest /> : <Navigate to="/tenders" />} />

                        {/* Invoices */}
                        <Route path="/invoices" element={user ? <InvoiceManagement /> : <Navigate to="/login" />} />

                        {/* Additional routes... */}
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </Suspense>
                  </Box>
                </Box>

                <ToastContainer />
              </Box>
            </Router>
          </SuperAdminProvider>
        </DarkModeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
