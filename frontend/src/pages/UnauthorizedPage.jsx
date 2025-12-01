import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Alert } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import institutionalTheme from '../theme/theme';

const UnauthorizedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // استخلاص الرسالة من الحالة التي تم تمريرها بواسطة ProtectedRoute
  const message = location.state?.message || "ليس لديك الصلاحية للوصول إلى هذه الصفحة.";

  const goBack = () => navigate(-1); // العودة إلى الصفحة السابقة

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 4,
          border: `1px solid ${institutionalTheme.palette.error.main}`,
          borderRadius: '8px',
          backgroundColor: '#fff8f8'
        }}
      >
        <BlockIcon sx={{ fontSize: 60, color: institutionalTheme.palette.error.main, mb: 2 }} />
        <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          وصول غير مصرح به
        </Typography>
        
        <Alert severity="error" sx={{ width: '100%', justifyContent: 'center' }}>
          {message}
        </Alert>

        <Button
          variant="contained"
          onClick={goBack}
          sx={{ 
            mt: 3, 
            backgroundColor: institutionalTheme.palette.primary.main 
          }}
        >
          العودة إلى الصفحة السابقة
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;