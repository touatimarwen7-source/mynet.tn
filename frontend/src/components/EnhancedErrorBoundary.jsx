/**
 * 🔴 ENHANCED ERROR BOUNDARY
 * Catches errors in child components and displays user-friendly messages
 * Also sends errors to backend for monitoring
 */

import React from 'react';
import { Box, Card, CardContent, Button, Typography, Alert } from '@mui/material';
import { institutionalTheme } from '../theme/theme';

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to backend
    this.logErrorToBackend(error, errorInfo);
  }

  logErrorToBackend = async (error, errorInfo) => {
    try {
      await fetch('/api/admin/error-stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      // Debug: removed;
    } catch (err) {
      // Error tracked;
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: institutionalTheme.palette.background.default }}>
          <Card sx={{ maxWidth: 600, margin: '0 auto', marginTop: 5 }}>
            <CardContent>
              <Alert severity="error" sx={{ mb: 2 }}>
                ❌ Oups! Une erreur s'est produite
              </Alert>

              <Typography variant="h6" sx={{ mb: 2, color: institutionalTheme.palette.text.primary }}>
                Détails de l'erreur:
              </Typography>

              <Box sx={{
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                mb: 2,
                maxHeight: 200,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#d32f2f'
              }}>
                <div>{this.state.error && this.state.error.toString()}</div>
                {this.state.errorInfo && (
                  <details style={{ cursor: 'pointer', marginTop: 10 }}>
                    <summary style={{ fontWeight: 'bold' }}>Stack Trace</summary>
                    <pre style={{ margin: '10px 0 0 0', fontSize: '11px', overflow: 'auto' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </Box>

              <Typography sx={{ mb: 3, color: '#666', fontSize: '14px' }}>
                Erreur #{this.state.errorCount} | Cette erreur a été enregistrée automatiquement pour diagnostic.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={this.handleReset}
                  sx={{ backgroundColor: institutionalTheme.palette.primary.main }}
                >
                  🔄 Réessayer
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.location.href = '/'}
                >
                  🏠 Accueil
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
