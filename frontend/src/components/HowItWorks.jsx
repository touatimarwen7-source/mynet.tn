import { Box, Container, Typography, Grid, Card, CardContent, Stack } from '@mui/material';

export default function HowItWorks() {
  const buyerSteps = [
    { number: 1, title: 'Créer un Appel d\'Offres', description: 'Définissez vos besoins, fixez les critères et publiez en quelques clics', icon: '📝' },
    { number: 2, title: 'Recevoir les Offres', description: 'Collectez les propositions de fournisseurs qualifiés en temps réel', icon: '📨' },
    { number: 3, title: 'Évaluer et Attribuer', description: 'Comparez, analysez avec l\'IA et attribuez les meilleurs fournisseurs', icon: '✓' }
  ];

  const supplierSteps = [
    { number: 1, title: 'Parcourir les Opportunités', description: 'Découvrez les appels d\'offres correspondant à votre expertise', icon: '🔍' },
    { number: 2, title: 'Soumettre une Offre', description: 'Répondez avec votre proposition chiffrée sécurisée en quelques minutes', icon: '💼' },
    { number: 3, title: 'Remporter le Marché', description: 'Recevez le bon de commande et commencez à servir le client', icon: '🎯' }
  ];

  const benefits = [
    { icon: '⚡', title: 'Rapide', desc: 'Processus complet en quelques jours au lieu de semaines' },
    { icon: '🔐', title: 'Sécurisé', desc: 'Chiffrement AES-256 et audit complet de toutes les transactions' },
    { icon: '🤖', title: 'Intelligent', desc: 'Analyse IA pour sélectionner les meilleures offres automatiquement' },
    { icon: '💰', title: 'Économique', desc: 'Réduisez les coûts d\'approvisionnement de 15-25%' }
  ];

  return (
    <Box sx={{ backgroundColor: '#F9F9F9', paddingY: '60px' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', marginBottom: '60px' }}>
          <Typography variant="h2" sx={{ fontSize: '36px', fontWeight: 700, color: '#212121', marginBottom: '16px' }}>
            Comment Fonctionne MyNet.tn?
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '16px', color: '#616161' }}>
            Trois étapes simples pour transformer vos achats
          </Typography>
        </Box>

        <Box sx={{ marginBottom: '60px' }}>
          <Typography variant="h3" sx={{ fontSize: '24px', fontWeight: 600, color: '#212121', marginBottom: '32px' }}>
            Pour les Acheteurs
          </Typography>
          <Grid container spacing={3}>
            {buyerSteps.map((step, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none', height: '100%' }}>
                  <CardContent sx={{ padding: '32px', textAlign: 'center' }}>
                    <Box sx={{ fontSize: '48px', marginBottom: '16px' }}>{step.icon}</Box>
                    <Box sx={{ fontSize: '32px', fontWeight: 700, color: '#0056B3', marginBottom: '12px' }}>{step.number}</Box>
                    <Typography variant="h5" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '12px' }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '14px', color: '#616161', lineHeight: 1.6 }}>
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ marginBottom: '60px' }}>
          <Typography variant="h3" sx={{ fontSize: '24px', fontWeight: 600, color: '#212121', marginBottom: '32px' }}>
            Pour les Fournisseurs
          </Typography>
          <Grid container spacing={3}>
            {supplierSteps.map((step, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none', height: '100%' }}>
                  <CardContent sx={{ padding: '32px', textAlign: 'center' }}>
                    <Box sx={{ fontSize: '48px', marginBottom: '16px' }}>{step.icon}</Box>
                    <Box sx={{ fontSize: '32px', fontWeight: 700, color: '#0056B3', marginBottom: '12px' }}>{step.number}</Box>
                    <Typography variant="h5" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '12px' }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '14px', color: '#616161', lineHeight: 1.6 }}>
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box>
          <Typography variant="h3" sx={{ fontSize: '24px', fontWeight: 600, color: '#212121', marginBottom: '32px', textAlign: 'center' }}>
            Avantages Clés
          </Typography>
          <Grid container spacing={3}>
            {benefits.map((benefit, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none', textAlign: 'center' }}>
                  <CardContent sx={{ padding: '24px' }}>
                    <Box sx={{ fontSize: '40px', marginBottom: '12px' }}>{benefit.icon}</Box>
                    <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#212121', marginBottom: '8px' }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '13px', color: '#616161', lineHeight: 1.6 }}>
                      {benefit.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
