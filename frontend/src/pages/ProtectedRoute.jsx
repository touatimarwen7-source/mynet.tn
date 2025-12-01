import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles, requiredFeature }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login.
    // Pass a message to the login page to inform the user why they were redirected.
    return <Navigate 
      to="/login" 
      state={{ from: location, message: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى." }} 
      replace 
    />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // User is authenticated but does not have the required role.
    // Redirect to an unauthorized page with a specific message.
    return <Navigate 
      to="/unauthorized" 
      state={{ message: `ليس لديك الصلاحية المطلوبة (${allowedRoles.join(' أو ')}) للوصول إلى هذه الصفحة.` }} 
      replace />;
  }

  // 1. التحقق من الميزات المسموح بها بناءً على اشتراك المستخدم
  if (requiredFeature && !user?.features?.includes(requiredFeature)) {
    return <Navigate 
      to="/upgrade-plan" 
      state={{ message: `هذه الميزة (${requiredFeature}) تتطلب ترقية باقة اشتراكك.` }} 
      replace />;
  }

  return children;
};

export default ProtectedRoute;