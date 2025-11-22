import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import corporateTheme from './theme/corporateTheme';
import AlertStrip from './components/AlertStrip';
import UnifiedHeader from './components/UnifiedHeader';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import Login from './pages/Login';
import Register from './pages/Register';
import TenderList from './pages/TenderList';
import CreateTender from './pages/CreateTender';
import TenderDetail from './pages/TenderDetail';
import MyOffers from './pages/MyOffers';
import Profile from './pages/Profile';
import AuditLog from './pages/AuditLog';
import PartialAward from './pages/PartialAward';
import OfferAnalysis from './pages/OfferAnalysis';
import BuyerDashboard from './pages/BuyerDashboard';
import BuyerActiveTenders from './pages/BuyerActiveTenders';
import InvoiceManagement from './pages/InvoiceManagement';
import FinancialReports from './pages/FinancialReports';
import BudgetManagement from './pages/BudgetManagement';
import TenderEvaluation from './pages/TenderEvaluation';
import TenderAwarding from './pages/TenderAwarding';
import TeamPermissions from './pages/TeamPermissions';
import SupplierProductsManagement from './pages/SupplierProductsManagement';
import SupplierServicesManagement from './pages/SupplierServicesManagement';
import BidSubmission from './pages/BidSubmission';
import ContractManagement from './pages/ContractManagement';
import DeliveryManagement from './pages/DeliveryManagement';
import AwardNotifications from './pages/AwardNotifications';
import PerformanceMonitoring from './pages/PerformanceMonitoring';
import DisputeManagement from './pages/DisputeManagement';
import InvoiceGeneration from './pages/InvoiceGeneration';
import MonitoringSubmissions from './pages/MonitoringSubmissions';
import TestingChecklist from './pages/TestingChecklist';
import CreateTenderImproved from './pages/CreateTenderImproved';
import TenderChat from './pages/TenderChat';
import TenderSecuritySettings from './pages/TenderSecuritySettings';
import TenderPreferencesSettings from './pages/TenderPreferencesSettings';
import TeamManagement from './pages/TeamManagement';
import SupplierSearch from './pages/SupplierSearch';
import SupplierDashboard from './pages/SupplierDashboard';
import AdminGuide from './pages/AdminGuide';
import SubmitBid from './pages/SubmitBid';
import NotificationCenter from './pages/NotificationCenter';
import CreateOffer from './pages/CreateOffer';
import SupplierCatalog from './pages/SupplierCatalog';
import SupplierProfile from './pages/SupplierProfile';
import SupplierInvoices from './pages/SupplierInvoices';
import AdminDashboard from './pages/AdminDashboard';
import MFASetup from './pages/MFASetup';
import AuditLogViewer from './pages/AuditLogViewer';
import HealthMonitoring from './pages/HealthMonitoring';
import ArchiveManagement from './pages/ArchiveManagement';
import SubscriptionTiers from './pages/SubscriptionTiers';
import FeatureControl from './pages/FeatureControl';
import UserManagement from './pages/UserManagement';
import { setupInactivityTimer } from './utils/security';
import ToastContainer from './components/ToastContainer';
import Sidebar from './components/Sidebar';
import { ToastContext } from './contexts/ToastContext';
import { DarkModeProvider } from './contexts/DarkModeContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setUser(tokenData);
        } catch (error) {
          console.error('Erreur lors du décodage du jeton:', error);
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    
    checkAuth();
    
    // Écouter l'événement authChanged depuis Login/Register
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('authChanged', handleAuthChange);
    return () => window.removeEventListener('authChanged', handleAuthChange);
  }, []);

  // Configurer la surveillance de l'inactivité - alerte après 15 minutes d'inactivité
  useEffect(() => {
    if (!user) return;
    const cleanup = setupInactivityTimer(15 * 60 * 1000);
    return cleanup;
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Chargement en cours...</div>;
  }

  return (
    <ThemeProvider theme={corporateTheme}>
      <CssBaseline />
      <DarkModeProvider>
        <ToastContext.Provider value={{ addToast }}>
          <Router>
          <div className="app">
          <AlertStrip />
          <UnifiedHeader />
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        
        {/* Sidebar Navigation - Only for authenticated users */}
        {user && <Sidebar user={user} onLogout={handleLogout} />}

        <main className="main-content">
          <Routes>
            {/* Pages Publiques */}
            <Route path="/" element={!user ? <HomePage /> : <Navigate to="/tenders" />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Authentification */}
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />

            {/* Appels d'offres */}
            <Route path="/tenders" element={<TenderList />} />
            <Route path="/tender/security" element={<TenderSecuritySettings />} />
            <Route path="/tender/preferences" element={<TenderPreferencesSettings />} />
            <Route path="/tender/:id" element={<TenderDetail />} />
            <Route path="/tender/:id/audit-log" element={<AuditLog />} />
            <Route path="/tender/:id/award" element={<PartialAward />} />
            <Route path="/tender/:id/analysis" element={<OfferAnalysis />} />

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
              path="/create-tender" 
              element={user?.role === 'buyer' ? <CreateTenderImproved /> : <Navigate to="/tenders" />} 
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

            {/* Administration */}
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/tenders" />} 
            />
            <Route 
              path="/admin/audit-logs" 
              element={user?.role === 'admin' ? <AuditLogViewer /> : <Navigate to="/tenders" />} 
            />
            <Route 
              path="/admin/health" 
              element={user?.role === 'admin' ? <HealthMonitoring /> : <Navigate to="/tenders" />} 
            />
            <Route 
              path="/admin/archive" 
              element={user?.role === 'admin' ? <ArchiveManagement /> : <Navigate to="/tenders" />} 
            />
            <Route 
              path="/admin/tiers" 
              element={user?.role === 'admin' ? <SubscriptionTiers /> : <Navigate to="/tenders" />} 
            />
            <Route 
              path="/admin/features" 
              element={user?.role === 'admin' ? <FeatureControl /> : <Navigate to="/tenders" />} 
            />
            <Route 
              path="/admin/users" 
              element={user?.role === 'admin' ? <UserManagement /> : <Navigate to="/tenders" />} 
            />

            {/* Profil et Sécurité */}
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/mfa-setup" 
              element={user ? <MFASetup /> : <Navigate to="/login" />} 
            />

            {/* Par défaut */}
            <Route path="*" element={<Navigate to="/tenders" />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2025 MyNet.tn - Système de Gestion des Appels d'Offres et des Achats</p>
        </footer>
        </div>
      </Router>
        </ToastContext.Provider>
      </DarkModeProvider>
    </ThemeProvider>
  );
}

export default App;

// Dark Mode Toggle Button for navbar - add to navbar section:
// <button onClick={toggleDarkMode} className="btn-dark-mode">
//   {isDarkMode ? '☀️' : '🌙'}
// </button>

// Add to navbar after nav-brand (around line 85):
// <LanguageSwitcher />

/* Added imports in main App.jsx */
// Financial corporate styling import (add at end of imports if not present)
// Already added in CSS imports
