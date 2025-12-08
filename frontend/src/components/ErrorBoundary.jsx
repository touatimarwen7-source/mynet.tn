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
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Get theme using a functional component pattern workaround
      const errorContent = (
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 80,
                color: THEME_COLORS.error,
                marginBottom: '20px',
              }}
            />

            <Typography
              variant="h3"
              sx={{
                color: THEME_COLORS.textPrimary,
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              Désolé, une erreur s'est produite
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: THEME_COLORS.textSecondary,
                marginBottom: '24px',
                maxWidth: '500px',
              }}
            >
              Un problème inattendu s'est produit. Veuillez essayer de rafraîchir la page ou de
              retourner à l'accueil.
            </Typography>

            <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={this.handleReset}
                sx={{
                  backgroundColor: THEME_COLORS.primary,
                  color: THEME_COLORS.bgPaper,
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  minHeight: '40px',
                  '&:hover': {
                    backgroundColor: THEME_COLORS.primaryDark,
                  },
                }}
              >
                Réessayer
              </Button>

              <Button
                variant="outlined"
                onClick={this.handleReload}
                sx={{
                  color: THEME_COLORS.primary,
                  borderColor: THEME_COLORS.primary,
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  minHeight: '40px',
                  '&:hover': {
                    borderColor: THEME_COLORS.primaryDark,
                    backgroundColor: `${THEME_COLORS.primary}10`,
                  },
                }}
              >
                Aller à l'accueil
              </Button>
            </Box>
          </Box>
        </Container>
      );
      return errorContent;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
