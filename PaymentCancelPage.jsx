import React, { useEffect } from 'react';
import { Container, Box, Typography, Alert, Button } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../utils/pageTitle';

const PaymentCancelPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setPageTitle('Paiement Annulé');
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <HighlightOffIcon sx={{ fontSize: 80, color: 'error.main' }} />
      <Typography variant="h4" sx={{ mt: 2, mb: 4 }}>
        Paiement Annulé
      </Typography>
      <Alert severity="warning">
        Le processus de paiement a été annulé. Votre abonnement n'a pas été modifié.
      </Alert>
      <Button variant="contained" onClick={() => navigate('/subscriptions')} sx={{ mt: 3 }}>
        Retourner aux Baqat
      </Button>
    </Container>
  );
};

export default PaymentCancelPage;