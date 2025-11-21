import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import InvoiceManagement from './pages/InvoiceManagement';
import CreateTenderImproved from './pages/CreateTenderImproved';
import TenderChat from './pages/TenderChat';
import TeamManagement from './pages/TeamManagement';
import SupplierSearch from './pages/SupplierSearch';
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
import { useToast } from './components/ToastContainer';
import ToastContainer from './components/ToastContainer';
import { ToastContext } from './contexts/ToastContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUser(tokenData);
      } catch (error) {
        console.error('Erreur lors du décodage du jeton:', error);
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
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
    <DarkModeProvider>
      <ToastContext.Provider value={{ addToast }}>
        <Router>
          <div className="app">
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <h1>MyNet.tn</h1>
              <span>Système de Gestion des Appels d'Offres</span>
            </div>
            <div className="nav-links">
              {user ? (
                <>
                  <a href="/tenders">Appels d'offres</a>
                  {user.role === 'buyer' && <a href="/buyer-dashboard">Mon tableau de bord</a>}
                  {user.role === 'buyer' && <a href="/create-tender">Créer un appel d'offres</a>}
                  {user.role === 'supplier' && <a href="/supplier-search">Rechercher</a>}
                  {user.role === 'supplier' && <a href="/notifications">Notifications</a>}
                  {user.role === 'supplier' && <a href="/supplier-catalog">Mon catalogue</a>}
                  {user.role === 'admin' && <a href="/admin">Tableau de contrôle</a>}
                  <a href="/profile">Profil</a>
                  <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
                </>
              ) : (
                <>
                  <a href="/login">Connexion</a>
                  <a href="/register">Inscription</a>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            {/* Authentification */}
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />

            {/* Appels d'offres */}
            <Route path="/tenders" element={<TenderList />} />
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
            <Route path="/" element={<Navigate to="/tenders" />} />
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
  );
}

export default App;

// Dark Mode Toggle Button for navbar - add to navbar section:
// <button onClick={toggleDarkMode} className="btn-dark-mode">
//   {isDarkMode ? '☀️' : '🌙'}
// </button>

// Add to navbar after nav-brand (around line 85):
// <LanguageSwitcher />
