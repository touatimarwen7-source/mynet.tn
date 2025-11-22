import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

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
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              padding: '40px 20px',
              textAlign: 'center'
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 80,
                color: '#c62828',
                marginBottom: '20px'
              }}
            />
            
            <Typography
              variant="h3"
              sx={{
                color: '#212121',
                fontWeight: 600,
                marginBottom: '16px'
              }}
            >
              عذراً، حدث خطأ ما
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: '#616161',
                marginBottom: '24px',
                maxWidth: '500px'
              }}
            >
              حدثت مشكلة غير متوقعة. يرجى محاولة التحديث أو العودة إلى الصفحة الرئيسية.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  padding: '16px',
                  marginBottom: '24px',
                  width: '100%',
                  maxHeight: '200px',
                  overflow: 'auto',
                  textAlign: 'left'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#c62828',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={this.handleReset}
                sx={{
                  backgroundColor: '#0056B3',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '10px 24px',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#003d7a'
                  }
                }}
              >
                حاول مرة أخرى
              </Button>
              
              <Button
                variant="outlined"
                onClick={this.handleReload}
                sx={{
                  borderColor: '#0056B3',
                  color: '#0056B3',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '10px 24px',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#F9F9F9'
                  }
                }}
              >
                الرجوع للصفحة الرئيسية
              </Button>
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
