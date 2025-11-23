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
    window.location.reload();
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
                color: theme.palette.text.primary,
                fontWeight: 600,
                marginBottom: '16px'
              }}
            >
              Désolé, une erreur s'est produite
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: '#616161',
                marginBottom: '24px',
                maxWidth: '500px'
              }}
            >
              Un problème inattendu s'est produit. Veuillez essayer de rafraîchir la page ou de retourner à l'accueil.
            </Typography>

            <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={this.handleReset}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  minHeight: '40px',
                  '&:hover': {
                    backgroundColor: '#003d7a'
                  }
                }}
              >
                Réessayer
              </Button>
              
              <Button
                variant="outlined"
                onClick={this.handleReload}
                sx={{
                  color: theme.palette.primary.main,
                  borderColor: theme.palette.primary.main,
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  minHeight: '40px',
                  '&:hover': {
                    borderColor: '#003d7a',
                    backgroundColor: '#f0f7ff'
                  }
                }}
              >
                Aller à l'accueil
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
