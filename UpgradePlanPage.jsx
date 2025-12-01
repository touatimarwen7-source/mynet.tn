import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Alert } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import institutionalTheme from '../theme/theme';

const UpgradePlanPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const message = location.state?.message || "الوصول إلى هذه الميزة يتطلب باقة اشتراك أعلى.";

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
          border: `1px solid ${institutionalTheme.palette.primary.main}`,
          borderRadius: '8px',
          backgroundColor: '#f3f6ff'
        }}
      >
        <StarIcon sx={{ fontSize: 60, color: institutionalTheme.palette.primary.main, mb: 2 }} />
        <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          ميزة حصرية
        </Typography>
        
        <Alert severity="info" sx={{ width: '100%', justifyContent: 'center', mb: 3 }}>
          {message}
        </Alert>

        <Typography variant="body1" sx={{ mb: 4 }}>
          يرجى ترقية باقة اشتراكك للاستفادة من هذه الميزة والميزات المتقدمة الأخرى.
        </Typography>

        <Button variant="contained" onClick={() => navigate('/subscriptions')}>
          عرض باقات الاشتراك
        </Button>
      </Box>
    </Container>
  );
};

export default UpgradePlanPage;