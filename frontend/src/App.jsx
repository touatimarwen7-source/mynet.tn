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
import SupplierSearch from './pages/SupplierSearch';
import SubmitBid from './pages/SubmitBid';
import NotificationCenter from './pages/NotificationCenter';
import SupplierCatalog from './pages/SupplierCatalog';
import SupplierProfile from './pages/SupplierProfile';
import SupplierInvoices from './pages/SupplierInvoices';
import AdminDashboard from './pages/AdminDashboard';
import MFASetup from './pages/MFASetup';
import { setupInactivityTimer } from './utils/security';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUser(tokenData);
      } catch (error) {
        console.error('خطأ في فك تشفير التوكن:', error);
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  // إعداد مراقبة الخمول - تنبيه بعد 15 دقيقة من عدم النشاط
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
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <h1>MyNet.tn</h1>
              <span>نظام المناقصات والمشتريات</span>
            </div>
            <div className="nav-links">
              {user ? (
                <>
                  <a href="/tenders">المناقصات</a>
                  {user.role === 'buyer' && <a href="/buyer-dashboard">لوحتي</a>}
                  {user.role === 'buyer' && <a href="/create-tender">إنشاء مناقصة</a>}
                  {user.role === 'supplier' && <a href="/supplier-search">البحث</a>}
                  {user.role === 'supplier' && <a href="/notifications">إشعاراتي</a>}
                  {user.role === 'supplier' && <a href="/supplier-catalog">منتجاتي</a>}
                  {user.role === 'admin' && <a href="/admin">لوحة التحكم</a>}
                  <a href="/profile">الملف الشخصي</a>
                  <button onClick={handleLogout} className="btn-logout">تسجيل الخروج</button>
                </>
              ) : (
                <>
                  <a href="/login">تسجيل الدخول</a>
                  <a href="/register">التسجيل</a>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            {/* المصادقة */}
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />

            {/* المناقصات */}
            <Route path="/tenders" element={<TenderList />} />
            <Route path="/tender/:id" element={<TenderDetail />} />
            <Route path="/tender/:id/audit-log" element={<AuditLog />} />
            <Route path="/tender/:id/award" element={<PartialAward />} />
            <Route path="/tender/:id/analysis" element={<OfferAnalysis />} />

            {/* واجهة المشتري */}
            <Route 
              path="/buyer-dashboard" 
              element={user?.role === 'buyer' ? <BuyerDashboard /> : <Navigate to="/tenders" />} 
            />
            <Route 
              path="/create-tender" 
              element={user?.role === 'buyer' ? <CreateTender /> : <Navigate to="/tenders" />} 
            />
            <Route 
              path="/invoices" 
              element={user?.role === 'buyer' ? <InvoiceManagement /> : <Navigate to="/tenders" />} 
            />

            {/* واجهة المورد */}
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

            {/* الإدارة */}
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/tenders" />} 
            />

            {/* الملف الشخصي والأمان */}
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/mfa-setup" 
              element={user ? <MFASetup /> : <Navigate to="/login" />} 
            />

            {/* الافتراضي */}
            <Route path="/" element={<Navigate to="/tenders" />} />
            <Route path="*" element={<Navigate to="/tenders" />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2025 MyNet.tn - نظام إدارة المناقصات والمشتريات</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

// Route for Admin Dashboard should be added:
// import AdminDashboard from './pages/AdminDashboard';
// <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/tenders" />} />
