import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from '../contexts/WebSocketContext'; // 1. استيراد المزود الجديد
import { AnimatePresence } from 'framer-motion';

// Import Pages
import Navbar from '../components/Navbar'; // 1. استيراد شريط التنقل
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AnimatedPage from './components/AnimatedPage'; // استيراد مكون التحريك
import ProtectedRoute from './pages/ProtectedRoute';
import UpgradePlanPage from './pages/UpgradePlanPage'; // استيراد صفحة الترقية
import UnauthorizedPage from './pages/UnauthorizedPage'; // 1. استيراد الصفحة الجديدة
import NotFoundPage from './pages/NotFoundPage'; // استيراد صفحة 404
import AdminDashboard from './pages/AdminDashboard'; // مثال لصفحة محمية
import CreateTenderWizard from './pages/CreateTenderWizard'; // استيراد معالج إنشاء المناقصة
import CreateOffer from './pages/CreateOffer'; // ✅ استيراد النموذج الموحد

function App() {
  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider> {/* 2. تغليف التطبيق بمزود WebSocket */}
          {/* إضافة شريط التنقل هنا ليظهر في كل الصفحات */}
          <Navbar /> 
          {/* بقية محتوى التطبيق */}
          <AppRoutes /> 
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  );
}

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
        <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
        <Route path="/unauthorized" element={<AnimatedPage><UnauthorizedPage /></AnimatedPage>} />
        <Route path="/upgrade-plan" element={<AnimatedPage><UpgradePlanPage /></AnimatedPage>} />

        {/* Protected Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AnimatedPage><AdminDashboard /></AnimatedPage>
            </ProtectedRoute>
          } 
        />

        {/* مسار إنشاء المناقصة */}
        <Route 
          path="/create-tender" 
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <AnimatedPage><CreateTenderWizard /></AnimatedPage>
            </ProtectedRoute>
          } 
        />

        {/* ✅ مسار تقديم العروض الموحد */}
        <Route 
          path="/tender/:tenderId/create-offer" 
          element={
            <ProtectedRoute allowedRoles={['supplier']}>
              <AnimatedPage><CreateOffer /></AnimatedPage>
            </ProtectedRoute>
          } 
        />
        {/* Catch-all Route for 404 Not Found */}
        <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
        {/* أضف باقي المسارات المحمية هنا */}
      </Routes>
    </AnimatePresence>
  );
};

export default App;