import { useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { Container, Box, Card, CardContent, CardHeader, Typography, LinearProgress, Grid } from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';

export default function HealthMonitoring() {
  const theme = institutionalTheme;
  const systemStats = [
    { name: 'Serveur de base de données', value: 45 },
    { name: 'Utilisation mémoire', value: 62 },
    { name: 'Utilisation CPU', value: 28 },
    { name: 'Capacité de stockage', value: 73 }
  ];

  useEffect(() => {
    setPageTitle('Surveillance de la santé');
  }, []);

  return (
    <Box sx={{ backgroundColor: institutionalTheme.palette.background.default, paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: institutionalTheme.palette.primary.main, mb: 3 }}>
          Surveillance de la santé du système
        </Typography>

        <Grid container spacing={2}>
          {systemStats.map((stat, idx) => (
            <Grid xs={12} key={idx}>
              <Card sx={{ border: '1px solid #E0E0E0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>{stat.name}</Typography>
                    <Typography sx={{ color: institutionalTheme.palette.primary.main, fontWeight: 600 }}>{stat.value}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={stat.value} sx={{ height: '8px', borderRadius: '4px' }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ border: '1px solid #E0E0E0', mt: 3 }}>
          <CardHeader title="Informations système" />
          <CardContent>
            <Box>
              <Typography sx={{ mb: 1 }}><strong>Version:</strong> v1.2.0</Typography>
              <Typography sx={{ mb: 1 }}><strong>État du serveur:</strong> <span style={{ color: '#4caf50', fontWeight: 600 }}>✓ Connecté</span></Typography>
              <Typography sx={{ mb: 1 }}><strong>Base de données:</strong> <span style={{ color: '#4caf50', fontWeight: 600 }}>✓ Active</span></Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
