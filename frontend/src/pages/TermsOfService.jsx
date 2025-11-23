import { Container, Typography, Box, Paper } from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';
import { useEffect } from 'react';

export default function TermsOfService() {
  useEffect(() => {
    setPageTitle('Conditions d\'Utilisation');
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
        <Typography variant="h2" sx={{ mb: 4, color: theme.palette.primary.main, fontWeight: 600 }}>
          Conditions d'Utilisation
        </Typography>

        <Paper sx={{ p: 4, backgroundColor: '#F9F9F9' }}>
          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 3 }}>
            1. Acceptation des Conditions
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            En utilisant MyNet.tn, vous acceptez ces conditions. Si vous n'acceptez pas, 
            veuillez cesser l'utilisation immédiatement.
          </Typography>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            2. Licence d'Utilisation
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Nous vous accordons une licence non exclusive, révocable pour accéder et utiliser 
            la Plateforme conformément à ces conditions.
          </Typography>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            3. Responsabilités de l'Utilisateur
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Vous êtes responsable de:
          </Typography>
          <Box sx={{ ml: 2, mb: 2 }}>
            <Typography>• Garder votre mot de passe confidentiel</Typography>
            <Typography>• Toute activité sous votre compte</Typography>
            <Typography>• Respecter les lois applicables</Typography>
            <Typography>• Ne pas violer les droits d'autrui</Typography>
            <Typography>• Ne pas utiliser la Plateforme à des fins illégales</Typography>
          </Box>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            4. Contenu de l'Utilisateur
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Vous conservez tous les droits sur votre contenu. En le publiant, vous nous accordez 
            une licence pour l'utiliser sur la Plateforme.
          </Typography>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            5. Limitation de Responsabilité
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            MyNet.tn est fourni "tel quel". Nous ne garantissons pas que la Plateforme 
            fonctionnera sans interruption ou erreur.
          </Typography>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            6. Interdictions
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Vous ne devez pas:
          </Typography>
          <Box sx={{ ml: 2, mb: 2 }}>
            <Typography>• Violer les droits d'autrui</Typography>
            <Typography>• Utiliser du contenu offensant ou illégal</Typography>
            <Typography>• Tenter de pirater la Plateforme</Typography>
            <Typography>• Spammer ou harceler d'autres utilisateurs</Typography>
            <Typography>• Utiliser la Plateforme à titre commercial sans permission</Typography>
          </Box>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            7. Résiliation
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Nous pouvons résilier votre compte si vous violez ces conditions. 
            Vous pouvez résilier votre compte à tout moment.
          </Typography>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            8. Modifications
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Nous pouvons modifier ces conditions à tout moment. Les modifications 
            entrent en vigueur immédiatement après publication.
          </Typography>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            9. Loi Applicable
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Ces conditions sont régies par les lois de la Tunisie.
          </Typography>

          <Typography sx={{ mt: 4, color: '#999', fontSize: '12px' }}>
            Dernière mise à jour: 23 Novembre 2025
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
