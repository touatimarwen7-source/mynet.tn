import React, { useEffect } from 'react';
import { Container, Box, Typography, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { setPageTitle } from '../utils/pageTitle';

const PaymentSuccessPage = () => {
  useEffect(() => {
    setPageTitle('Paiement Réussi');
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main' }} />
      <Typography variant="h4" sx={{ mt: 2, mb: 4 }}>
        Paiement Réussi!
      </Typography>
      <Alert severity="success">
        Votre abonnement a été mis à jour. Vous pouvez maintenant accéder à toutes les fonctionnalités de votre nouvelle baqa.
      </Alert>
    </Container>
  );
};

export default PaymentSuccessPage;