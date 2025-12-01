import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import institutionalTheme from '../theme/theme';

const NotFoundPage = () => {
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
          border: `1px solid ${institutionalTheme.palette.warning.main}`,
          borderRadius: '8px',
          backgroundColor: '#fffbeb'
        }}
      >
        <ReportProblemIcon sx={{ fontSize: 60, color: institutionalTheme.palette.warning.main, mb: 2 }} />
        <Typography component="h1" variant="h1" sx={{ mb: 2, fontWeight: 'bold', color: institutionalTheme.palette.warning.dark }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ mb: 2, color: institutionalTheme.palette.text.primary }}>
          الصفحة غير موجودة
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: institutionalTheme.palette.text.secondary }}>
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم حذفها أو أن الرابط غير صحيح.
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          sx={{ 
            backgroundColor: institutionalTheme.palette.primary.main 
          }}
        >
          العودة إلى الصفحة الرئيسية
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;