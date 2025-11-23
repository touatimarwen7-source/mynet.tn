import { Container, Typography, Box, Paper } from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';
import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => {
    setPageTitle('Politique de Confidentialité');
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
        <Typography variant="h2" sx={{ mb: 4, color: theme.palette.primary.main, fontWeight: 600 }}>
          Politique de Confidentialité
        </Typography>

        <Paper sx={{ p: 4, backgroundColor: '#F9F9F9' }}>
          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 3 }}>
            1. Introduction
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            MyNet.tn ("Nous", "Notre", "la Plateforme") s'engage à protéger votre vie privée. 
            Cette politique explique comment nous collectons, utilisons, et protégeons vos données personnelles.
          </Typography>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            2. Collecte de Données
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Nous collectons les données suivantes:
          </Typography>
          <Box sx={{ ml: 2, mb: 2 }}>
            <Typography>• Informations d'enregistrement (nom, email, mot de passe)</Typography>
            <Typography>• Données de profil d'entreprise</Typography>
            <Typography>• Données de transactions et offres</Typography>
            <Typography>• Logs d'accès et d'utilisation</Typography>
            <Typography>• Informations de localisation (optionnelles)</Typography>
          </Box>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            3. Utilisation des Données
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Vos données sont utilisées pour:
          </Typography>
          <Box sx={{ ml: 2, mb: 2 }}>
            <Typography>• Fournir et améliorer nos services</Typography>
            <Typography>• Traiter les transactions</Typography>
            <Typography>• Envoyer des communications importantes</Typography>
            <Typography>• Respecter les obligations légales</Typography>
            <Typography>• Prévenir la fraude et les abus</Typography>
          </Box>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            4. Sécurité des Données
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Nous utilisons le chiffrement AES-256 et les protocoles HTTPS pour protéger vos données. 
            Les données sont stockées sur des serveurs sécurisés avec contrôle d'accès strict.
          </Typography>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            5. Partage de Données
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Nous ne partageons pas vos données personnelles sauf:
          </Typography>
          <Box sx={{ ml: 2, mb: 2 }}>
            <Typography>• Avec votre consentement explicite</Typography>
            <Typography>• Pour respecter les obligations légales</Typography>
            <Typography>• Avec les prestataires de services (sous contrat de confidentialité)</Typography>
          </Box>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            6. Droits de l'Utilisateur
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Vous avez le droit de:
          </Typography>
          <Box sx={{ ml: 2, mb: 2 }}>
            <Typography>• Accéder à vos données personnelles</Typography>
            <Typography>• Corriger les informations inexactes</Typography>
            <Typography>• Demander la suppression de vos données</Typography>
            <Typography>• Retirer votre consentement</Typography>
          </Box>

          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, mt: 4 }}>
            7. Contact
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
            Pour toute question concernant cette politique, veuillez nous contacter à: 
            privacy@mynet.tn
          </Typography>

          <Typography sx={{ mt: 4, color: '#999', fontSize: '12px' }}>
            Dernière mise à jour: 23 Novembre 2025
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
