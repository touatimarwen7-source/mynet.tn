import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TenderList from './pages/TenderList';
import CreateTender from './pages/CreateTender';
import TenderDetail from './pages/TenderDetail';
import MyOffers from './pages/MyOffers';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      setUser(tokenData);
    }
    setLoading(false);
  }, []);

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
                  {user.role === 'buyer' && <a href="/create-tender">إنشاء مناقصة</a>}
                  {user.role === 'supplier' && <a href="/my-offers">عروضي</a>}
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
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tenders" element={<TenderList />} />
            <Route path="/tender/:id" element={<TenderDetail />} />
            <Route path="/create-tender" element={user?.role === 'buyer' ? <CreateTender /> : <Navigate to="/tenders" />} />
            <Route path="/my-offers" element={user?.role === 'supplier' ? <MyOffers /> : <Navigate to="/tenders" />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to="/tenders" />} />
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
