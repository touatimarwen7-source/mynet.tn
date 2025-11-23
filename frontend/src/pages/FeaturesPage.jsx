import { useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { Container, Box, Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';

export default function FeaturesPage() {
  const theme = institutionalTheme;
  const features = [
    { title: 'Facile à utiliser', desc: 'Interface simple et intuitive pour tous' },
    { title: 'Sécurisé et fiable', desc: 'Niveaux de sécurité et de protection les plus élevés' },
    { title: 'Support complet', desc: 'Support français complet pour la plateforme' },
    { title: 'Rapports avancés', desc: 'Analyses et rapports complets' },
    { title: 'Intégration complète', desc: 'Intégration transparente avec d\'autres systèmes' },
    { title: 'Support technique', desc: 'Support technique disponible 24h/24, 7j/7' }
  ];

  useEffect(() => {
    setPageTitle('Fonctionnalités');
  }, []);

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3, textAlign: 'center' }}>
          Nos fonctionnalités
        </Typography>
        <Grid container spacing={3}>
          {features.map((f, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ border: '1px solid #E0E0E0', height: '100%' }}>
                <CardContent>
                  <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>{f.title}</Typography>
                  <Typography sx={{ color: '#616161' }}>{f.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
