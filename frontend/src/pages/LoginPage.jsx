import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, TextField, Typography, Container, CircularProgress, Alert } from '@mui/material';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. استخلاص الرسالة من الـ state الذي تم تمريره بواسطة ProtectedRoute
  const message = location.state?.message;
  
  // استخلاص المسار الذي كان المستخدم يحاول الوصول إليه
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await login(email, password);
    if (success) {
      // عند نجاح تسجيل الدخول، أعد توجيه المستخدم إلى الصفحة التي كان يقصدها
      navigate(from, { replace: true });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          تسجيل الدخول
        </Typography>
        
        {/* 2. عرض الرسالة إذا كانت موجودة (مثل "انتهت صلاحية الجلسة") */}
        {message && <Alert severity="info" sx={{ mt: 2, width: '100%' }}>{message}</Alert>}
        
        {/* عرض أخطاء تسجيل الدخول من سياق المصادقة */}
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="البريد الإلكتروني"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="كلمة المرور"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'تسجيل الدخول'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;