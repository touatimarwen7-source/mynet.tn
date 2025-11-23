import { useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { Container, Box, Card, CardContent, CardHeader, Grid, Typography, Button } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { setPageTitle } from '../utils/pageTitle';

export default function OfferAnalysis() {
  const theme = institutionalTheme;
  const analysis = [
    { title: 'Prix moyen', value: '15 000 TND', trend: 'up' },
    { title: 'Prix minimum', value: '5 000 TND', trend: 'down' },
    { title: 'Prix maximum', value: '100 000 TND', trend: 'up' },
    { title: 'Nombre d\'offres', value: '42', trend: 'up' }
  ];

  useEffect(() => {
    setPageTitle('Analyse des offres');
  }, []);

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Analyse des offres
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {analysis.map((item, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card sx={{ border: '1px solid #E0E0E0' }}>
                <CardContent>
                  <Typography sx={{ color: '#616161', fontSize: '12px' }}>{item.title}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '20px', color: theme.palette.primary.main, mr: 1 }}>
                      {item.value}
                    </Typography>
                    <TrendingUpIcon sx={{ color: item.trend === 'up' ? '#4caf50' : '#ff9800', fontSize: 20 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ border: '1px solid #E0E0E0' }}>
          <CardHeader title="Comparaison des offres" action={<Button size="small" sx={{ color: theme.palette.primary.main }}>Exporter</Button>} />
          <CardContent>
            <Typography sx={{ color: '#999' }}>Chargement du graphique en cours...</Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
