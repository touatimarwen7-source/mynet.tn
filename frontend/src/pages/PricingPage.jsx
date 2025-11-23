import { useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { Container, Box, Card, CardContent, Grid, Typography, Button, List, ListItem } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { setPageTitle } from '../utils/pageTitle';

export default function PricingPage() {
  const theme = institutionalTheme;
  const plans = [
    { name: 'Basique', price: 'Gratuit', features: ['Jusqu\'à 5 appels d\'offres', 'Support de base', 'Rapports simples'] },
    { name: 'Professionnel', price: '50 TND', features: ['Appels d\'offres illimités', 'Support prioritaire', 'Rapports avancés'] },
    { name: 'Entreprise', price: 'Sur devis', features: ['Toutes les fonctionnalités', 'Équipe dédiée', 'API personnalisée'] }
  ];

  useEffect(() => {
    setPageTitle('Tarification');
  }, []);

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3, textAlign: 'center' }}>
          Plans tarifaires
        </Typography>
        <Grid container spacing={3}>
          {plans.map((plan, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ border: '1px solid #E0E0E0', height: '100%' }}>
                <CardContent>
                  <Typography sx={{ fontSize: '20px', fontWeight: 600, mb: 1 }}>{plan.name}</Typography>
                  <Typography sx={{ fontSize: '24px', fontWeight: 600, color: theme.palette.primary.main, mb: 2 }}>{plan.price}</Typography>
                  <List dense>
                    {plan.features.map((f, fidx) => (
                      <ListItem key={fidx} disableGutters>
                        <CheckIcon sx={{ fontSize: 16, color: '#4caf50', mr: 1 }} />
                        {f}
                      </ListItem>
                    ))}
                  </List>
                  <Button variant="contained" fullWidth sx={{ backgroundColor: theme.palette.primary.main, mt: 2 }}>
                    Choisir
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
