import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { procurementAPI } from '../api/procurementAPI';
import { useToast } from '../contexts/AppContext';
import { setPageTitle } from '../utils/pageTitle';

/**
 * A page that displays available subscription plans and allows users to upgrade.
 */
const SubscriptionPlansPage = () => {
  const { addToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null); // Tracks which plan is being submitted
  const [error, setError] = useState(null);

  useEffect(() => {
    setPageTitle('Baqat Alaishtirak');
    const fetchPlans = async () => {
      try {
        const response = await procurementAPI.getSubscriptionPlans();
        setPlans(response.data.plans || []);
      } catch (err) {
        setError('Erreur lors du chargement des baqat.');
        addToast('Erreur de chargement.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [addToast]);

  const handleSubscribe = async (planId) => {
    setSubmitting(planId);
    try {
      const response = await procurementAPI.createCheckoutSession(planId);
      const { checkoutUrl } = response.data;
      if (checkoutUrl) {
        // Redirect to the payment gateway's page
        window.location.href = checkoutUrl;
      } else {
        throw new Error('URL de paiement non reçue.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Échec de la création de la session de paiement.';
      addToast(errorMsg, 'error');
      setSubmitting(null);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Box sx={{ backgroundColor: '#F9F9F9', py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
          Choisissez Votre Baqa
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Des outils puissants pour développer votre activité.
        </Typography>

        <Grid container spacing={4} alignItems="flex-end">
          {plans.map((plan) => (
            <Grid item key={plan.id} xs={12} md={4}>
              <Card sx={{ border: plan.isPopular ? '2px solid' : '1px solid', borderColor: plan.isPopular ? 'primary.main' : 'divider', borderRadius: '16px' }}>
                <CardHeader
                  title={plan.name}
                  titleTypographyProps={{ align: 'center', variant: 'h5', fontWeight: 'bold' }}
                  subheader={plan.isPopular ? <Chip icon={<StarIcon />} label="Le plus populaire" color="primary" sx={{ mt: 1 }} /> : null}
                  sx={{ backgroundColor: '#FFFFFF' }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', mb: 2 }}>
                    <Typography component="h2" variant="h3" color="text.primary">
                      {plan.price}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      /mois
                    </Typography>
                  </Box>
                  <List>
                    {plan.features.map((feature) => (
                      <ListItem key={feature} disableGutters>
                        <ListItemIcon sx={{ minWidth: '32px' }}><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant={plan.isPopular ? 'contained' : 'outlined'}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={submitting === plan.id}
                  >
                    {submitting === plan.id ? <CircularProgress size={24} /> : 'Choisir cette baqa'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default SubscriptionPlansPage;