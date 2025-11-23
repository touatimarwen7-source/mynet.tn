import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * Error Fallback Component
 * Displays when a component fails to load
 * Used with Suspense and Error Boundaries
 */
const ErrorFallback = ({ error, resetError }) => {
  return (
    <Box
      sx={{
        padding: '24px',
        backgroundColor: '#F9F9F9',
        borderRadius: '4px',
        border: '1px solid #E0E0E0',
        textAlign: 'center'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <WarningIcon sx={{ fontSize: 48, color: '#f57c00' }} />
      </Box>

      <Typography
        variant="h5"
        sx={{
          color: '#212121',
          fontWeight: 600,
          marginBottom: '8px'
        }}
      >
        Erreur de chargement du contenu
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: '#616161',
          marginBottom: '16px'
        }}
      >
        Un problème s'est produit lors du chargement de cette section. Veuillez réessayer.
      </Typography>

      {import.meta.env.MODE === 'development' && error && (
        <Alert severity="error" sx={{ marginBottom: '16px', textAlign: 'left' }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '11px' }}>
            {error.message}
          </Typography>
        </Alert>
      )}

      <Button
        variant="contained"
        size="small"
        onClick={resetError}
        startIcon={<RefreshIcon />}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: '#FFFFFF',
          textTransform: 'none',
          fontSize: '14px',
          fontWeight: 500,
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: '#003d7a'
          }
        }}
      >
        Réessayer
      </Button>
    </Box>
  );
};

export default ErrorFallback;
