import { Box, Container, Typography, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function HomePageCTA() {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: theme.palette.primary.main, color: '#ffffff', paddingY: '80px', backgroundImage: 'linear-gradient(135deg, #0056B3 0%, #0d47a1 100%)' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontSize: '36px', fontWeight: 500, marginBottom: '16px' }}>
            Prêt à Transformer Votre Processus d'Achat?
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '18px', marginBottom: '40px', opacity: 0.9 }}>
            Rejoignez plus de 1,200 organisations qui font confiance à MyNet.tn
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center', marginBottom: '24px' }}>
            <Button variant="contained" onClick={() => navigate('/register')} sx={{ backgroundColor: '#ffffff', color: theme.palette.primary.main, textTransform: 'none', fontWeight: 600, padding: '14px 32px', minHeight: '48px', fontSize: '16px', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              Demander une Démonstration
            </Button>
            <Button variant="outlined" onClick={() => navigate('/login')} sx={{ borderColor: '#ffffff', color: '#ffffff', textTransform: 'none', fontWeight: 600, padding: '14px 32px', minHeight: '48px', fontSize: '16px', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: '#ffffff' } }}>
              Déjà Inscrit? Se Connecter
            </Button>
          </Stack>
          <Typography sx={{ fontSize: '13px', opacity: 0.85 }}>
            Pas de carte bancaire requise • Accès gratuit pendant 30 jours • Support dédié inclus
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
