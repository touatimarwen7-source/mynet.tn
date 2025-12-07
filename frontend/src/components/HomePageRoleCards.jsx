import { THEME_COLORS } from './themeHelpers';
import { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import institutionalTheme from '../theme/theme';

export default function HomePageRoleCards({ onRoleClick }) {
  const theme = institutionalTheme;
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'buyer',
      title: 'Je suis Acheteur / Organisations',
      description:
        "Optimisez vos processus d'approvisionnement. Publiez des appels d'offres auprès de milliers de fournisseurs vérifiés, recevez les meilleures propositions, évaluez avec intelligence artificielle, et finalisez vos contrats sécurisés en quelques jours.",
      features: [
        "✓ Créer des appels d'offres avec évaluation IA",
        '✓ Recevoir 100+ propositions qualifiées',
        '✓ Analyser comparativement avec tableaux de bord',
        '✓ Émettre bons de commande et factures',
        "✓ Gérer équipe d'achat et historique complet",
      ],
    },
    {
      id: 'supplier',
      title: 'Je suis Fournisseur / Producteur',
      description:
        "Multipliez vos opportunités commerciales. Découvrez 100+ appels d'offres quotidiens filtrés, soumettez rapidement vos offres compétitives sécurisées, et développez votre activité B2B avec des clients de confiance et des paiements garantis.",
      features: [
        '✓ Accéder à 100+ opportunités quotidiennes',
        '✓ Soumettre des offres en quelques minutes',
        '✓ Gérer catalogue produits et prix',
        '✓ Suivre évaluations et retours clients',
        '✓ Générer factures et recevoir paiements',
      ],
    },
  ];

  const handleStartTrial = (role) => {
    setSelectedRole(role);
    onRoleClick(role);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingY: '60px' }}>
      <Box sx={{ textAlign: 'center', marginBottom: '48px' }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: '32px',
            fontWeight: 500,
            color: theme.palette.text.primary,
            marginBottom: '12px',
          }}
        >
          Choisissez Votre Rôle
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '16px', color: THEME_COLORS.textSecondary }}>
          Deux expériences optimisées, une plateforme unifiée
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {roles.map((role) => (
          <Grid size={{ xs: 12, md: 6 }} key={role.id}>
            <Card
              sx={{
                height: '100%',
                border: selectedRole === role.id ? '2px solid #0056B3' : '1px solid #e0e0e0',
                borderRadius: '12px',
                boxShadow: 'none',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                backgroundColor: selectedRole === role.id ? '#f0f7ff' : '#FFFFFF',
                '&:hover': { 
                  borderColor: theme.palette.primary.main, 
                  boxShadow: '0 4px 16px rgba(0, 86, 179, 0.1)',
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardContent sx={{ padding: '32px' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '24px',
                    fontWeight: 500,
                    color: theme.palette.primary.main,
                    marginBottom: '16px',
                  }}
                >
                  {role.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: THEME_COLORS.textSecondary, marginBottom: '24px', lineHeight: 1.6 }}
                >
                  {role.description}
                </Typography>
                <List sx={{ marginBottom: '24px' }}>
                  {role.features.map((feature, idx) => (
                    <ListItem
                      key={idx}
                      sx={{ paddingLeft: 0, paddingTop: '6px', paddingBottom: '6px' }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: THEME_COLORS.success }}>
                        <CheckCircleIcon sx={{ fontSize: 18 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        sx={{
                          '& .MuiTypography-root': {
                            fontSize: '14px',
                            color: theme.palette.text.primary,
                            fontWeight: 400,
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleStartTrial(role.id)}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    textTransform: 'none',
                    fontWeight: 500,
                    padding: '12px 24px',
                    minHeight: '44px',
                    '&:hover': { backgroundColor: 'THEME_COLORS.primaryDark' },
                  }}
                >
                  Commencer Essai Gratuit
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
