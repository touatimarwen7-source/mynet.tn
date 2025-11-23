import { useState } from 'react';
import { Box, Container, Card, CardContent, Button, List, ListItem, ListItemIcon, ListItemText, Typography, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import institutionalTheme from '../theme/theme';

export default function HomePageRoleCards({ onRoleClick }) {
  const theme = institutionalTheme;
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    { id: 'buyer', title: 'Je suis Acheteur', description: 'Publiez vos appels d\'offres, recevez les meilleures propositions, évaluez les fournisseurs et finalisez vos contrats en toute confiance.', features: ['Créer des appels d\'offres', 'Gérer les soumissions', 'Analyser les offres', 'Émettre des bons de commande', 'Gérer l\'équipe d\'achat'] },
    { id: 'supplier', title: 'Je suis Fournisseur', description: 'Découvrez les opportunités de marché, soumettez vos offres compétitives, et développez votre activité avec des clients de confiance.', features: ['Parcourir les appels d\'offres', 'Soumettre des offres', 'Gérer votre catalogue', 'Suivre les évaluations', 'Recevoir les commandes'] },
  ];

  const handleStartTrial = (role) => {
    setSelectedRole(role);
    onRoleClick(role);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingY: '60px' }}>
      <Box sx={{ textAlign: 'center', marginBottom: '48px' }}>
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: theme.palette.text.primary, marginBottom: '12px' }}>
          Choisissez Votre Rôle
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '16px', color: '#616161' }}>
          Deux expériences optimisées, une plateforme unifiée
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {roles.map((role) => (
          <Grid size={{ xs: 12, md: 6 }} key={role.id}>
            <Card sx={{ height: '100%', border: selectedRole === role.id ? '2px solid #0056B3' : '1px solid #e0e0e0', borderRadius: '8px', boxShadow: 'none', transition: 'all 300ms ease-in-out', cursor: 'pointer', '&:hover': { borderColor: theme.palette.primary.main, boxShadow: 'none' } }} onClick={() => setSelectedRole(role.id)}>
              <CardContent sx={{ padding: '32px' }}>
                <Typography variant="h3" sx={{ fontSize: '24px', fontWeight: 500, color: theme.palette.primary.main, marginBottom: '16px' }}>
                  {role.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#616161', marginBottom: '24px', lineHeight: 1.6 }}>
                  {role.description}
                </Typography>
                <List sx={{ marginBottom: '24px' }}>
                  {role.features.map((feature, idx) => (
                    <ListItem key={idx} sx={{ paddingLeft: 0, paddingTop: '6px', paddingBottom: '6px' }}>
                      <ListItemIcon sx={{ minWidth: 32, color: '#2e7d32' }}>
                        <CheckCircleIcon sx={{ fontSize: 18 }} />
                      </ListItemIcon>
                      <ListItemText primary={feature} sx={{ '& .MuiTypography-root': { fontSize: '14px', color: theme.palette.text.primary, fontWeight: 400 } }} />
                    </ListItem>
                  ))}
                </List>
                <Button fullWidth variant="contained" onClick={() => handleStartTrial(role.id)} sx={{ backgroundColor: theme.palette.primary.main, textTransform: 'none', fontWeight: 500, padding: '12px 24px', minHeight: '44px', '&:hover': { backgroundColor: '#0d47a1' } }}>
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
