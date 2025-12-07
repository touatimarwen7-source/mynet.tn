import { THEME_COLORS } from './themeHelpers';
import { Box, Container, Typography, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import institutionalTheme from '../theme/theme';

export default function HomePageCTA() {
  const theme = institutionalTheme;
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        paddingY: '100px',
        backgroundImage: 'linear-gradient(135deg, #0056B3 0%, #003d7a 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontSize: '36px', fontWeight: 500, marginBottom: '16px' }}>
            Prêt à Transformer Votre Processus d'Achat?
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '18px', marginBottom: '40px', opacity: 0.9 }}>
            Rejoignez plus de 1,200 organisations qui font confiance à MyNet.tn
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center', marginBottom: '24px' }}
          >
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                backgroundColor: THEME_COLORS.bgPaper,
                color: theme.palette.primary.main,
                textTransform: 'none',
                fontWeight: 600,
                padding: '14px 32px',
                minHeight: '48px',
                fontSize: '16px',
                '&:hover': { backgroundColor: 'THEME_COLORS.bgDefault' },
              }}
            >
              Demander une Démonstration
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'THEME_COLORS.bgPaper',
                color: 'THEME_COLORS.bgPaper',
                textTransform: 'none',
                fontWeight: 600,
                padding: '14px 32px',
                minHeight: '48px',
                fontSize: '16px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'THEME_COLORS.bgPaper',
                },
              }}
            >
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
