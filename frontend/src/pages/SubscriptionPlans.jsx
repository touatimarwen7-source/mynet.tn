import { useState } from 'react';
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';

export default function SubscriptionPlans() {
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      period: 'Gratuit',
      description: 'Parfait pour débuter',
      features: [
        'Jusqu\'à 5 appels d\'offres',
        'Accès basique aux fournisseurs',
        'Support par email',
        'Rapports basiques',
        'Messagerie limitée',
      ],
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 299,
      period: '/mois',
      description: 'Pour les entreprises actives',
      features: [
        'Appels d\'offres illimités',
        'Accès complet aux fournisseurs',
        'Support prioritaire',
        'Analytics avancées',
        'Messagerie illimitée',
        'Export de données',
        'API d\'accès',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 999,
      period: '/mois',
      description: 'Pour les grandes organisations',
      features: [
        'Toutes les fonctionnalités Pro',
        'Support 24/7 dédié',
        'Gestionnaire de compte',
        'Formation personnalisée',
        'Intégrations personnalisées',
        'SLA de service',
        'Audit logs avancés',
        'Multi-workspace',
      ],
      popular: false,
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', marginBottom: '48px' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#212121', marginBottom: '16px' }}>
            Plans d'Abonnement
          </Typography>
          <Typography sx={{ fontSize: '16px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            Choisissez le plan qui convient le mieux à vos besoins. Vous pouvez changer de plan à tout moment.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  border: plan.popular ? '2px solid #0056B3' : '1px solid #e0e0e0',
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.popular && (
                  <Box sx={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: theme.palette.primary.main,
                    color: '#fff',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <StarIcon sx={{ fontSize: '14px' }} />
                    Le plus populaire
                  </Box>
                )}

                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '24px', color: '#212121', marginBottom: '8px' }}>
                    {plan.name}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '24px' }}>
                    {plan.description}
                  </Typography>

                  <Box sx={{ marginBottom: '32px' }}>
                    <Typography sx={{ fontSize: '32px', fontWeight: 700, color: theme.palette.primary.main }}>
                      {plan.price}
                      <span style={{ fontSize: '14px', fontWeight: 400, color: '#666' }}>
                        {plan.period && ` ${plan.period}`}
                      </span>
                    </Typography>
                    {plan.price > 0 && (
                      <Typography sx={{ fontSize: '12px', color: '#999' }}>
                        Facturation mensuelle
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant={plan.popular ? 'contained' : 'outlined'}
                    fullWidth
                    onClick={() => setSelectedPlan(plan.id)}
                    sx={{
                      backgroundColor: plan.popular ? '#0056B3' : 'transparent',
                      color: plan.popular ? '#fff' : '#0056B3',
                      borderColor: '#0056B3',
                      marginBottom: '24px',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: plan.popular ? '#003d7a' : '#f5f5f5',
                      }
                    }}
                  >
                    Choisir ce plan
                  </Button>

                  <List sx={{ flex: 1 }}>
                    {plan.features.map((feature, i) => (
                      <ListItem key={i} sx={{ padding: '12px 0' }}>
                        <ListItemIcon sx={{ minWidth: '32px' }}>
                          <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: '20px' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            sx: { fontSize: '14px', color: '#212121' }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* FAQ Section */}
        <Box sx={{ marginTop: '64px' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#212121', marginBottom: '32px', textAlign: 'center' }}>
            Questions Fréquemment Posées
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '12px' }}>
                    Puis-je changer de plan?
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#666' }}>
                    Oui, vous pouvez changer de plan à tout moment. Les modifications prennent effet immédiatement.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '12px' }}>
                    Y a-t-il une période d'essai?
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#666' }}>
                    Oui, le plan Starter est gratuit. Commencez dès aujourd'hui sans carte de crédit.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '12px' }}>
                    Que se passe-t-il si j'annule?
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#666' }}>
                    Vous pouvez annuler à tout moment. Aucune pénalité ou frais d'annulation.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '12px' }}>
                    Offrez-vous des rabais?
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#666' }}>
                    Oui, contactez notre équipe pour les tarifs Enterprise et les rabais volume.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
