import React from 'react';
import { Box, Container, Typography, Button, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import institutionalTheme from '../theme/theme';

const THEME_COLORS = {
  primary: institutionalTheme.palette.primary.main,
  primaryDark: institutionalTheme.palette.primary.dark,
  error: institutionalTheme.palette.error.main,
  textPrimary: institutionalTheme.palette.text.primary,
  textSecondary: institutionalTheme.palette.text.secondary,
  bgPaper: institutionalTheme.palette.background.paper,
};

/**
 * Error Boundary Component
 * Catches React component errors and displays fallback UI
 * Prevents entire app crash
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error logging
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('⚠️ React Error Boundary Caught Error:');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // if (import.meta.env.MODE === 'production') {
    //   window.errorTracker?.captureException(error, { errorInfo });
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    // مسح الكاش قبل إعادة التحميل
    if (window.caches) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Clear cache before reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      }).catch(() => {});
    }
    
    // Reload after short delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <Typography variant="h4" color="error" gutterBottom sx={{ fontWeight: 600 }}>
            ⚠️ عذرًا، حدث خطأ غير متوقع
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: '#616161' }}>
            {this.state.error?.message || 'خطأ غير معروف'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={this.handleRetry}>
              إعادة المحاولة
            </Button>
            <Button variant="outlined" onClick={() => window.location.href = '/'}>
              العودة للصفحة الرئيسية
            </Button>
          </Box>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <Box sx={{ mt: 4, textAlign: 'left', backgroundColor: '#F5F5F5', p: 2, borderRadius: 1 }}>
              <Typography variant="caption" component="pre" sx={{ fontSize: '10px' }}>
                {this.state.errorInfo.componentStack}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;