import { useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { Container, Box, Card, CardContent, Typography, Alert } from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';

export default function SupplierProductsManagement() {
  const theme = institutionalTheme;
  
  useEffect(() => {
    setPageTitle('Gestion des Produits - Fournisseur');
  }, []);

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: '32px' }}
        >
          Gestion des Produits et Services
        </Typography>
        
        <Card sx={{ border: '1px solid #e0e0e0', marginBottom: '24px' }}>
          <CardContent sx={{ padding: '40px', textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '20px',
                fontWeight: 500,
                color: theme.palette.text.primary,
                marginBottom: '16px',
              }}
            >
              Catalogue de Produits et Services
            </Typography>
            <Alert
              severity="info"
              sx={{ backgroundColor: '#e3f2fd', color: '#0d47a1', border: '1px solid #1976d2' }}
            >
              Cette fonctionnalité permettra de gérer votre catalogue de produits et services.
              Elle sera disponible prochainement pour améliorer votre visibilité auprès des acheteurs.
            </Alert>
          </CardContent>
        </Card>

        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
          Pour le moment, utilisez la section "Mes Offres" pour gérer vos soumissions aux appels d'offres.
        </Typography>
      </Container>
    </Box>
  );
}
