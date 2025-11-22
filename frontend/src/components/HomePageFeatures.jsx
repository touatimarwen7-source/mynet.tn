import { Container, Box, Grid, Card, Typography } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import InventoryIcon from '@mui/icons-material/Inventory';
import LanguageIcon from '@mui/icons-material/Language';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

export default function HomePageFeatures() {
  const features = [
    { icon: <SecurityIcon sx={{ fontSize: '40px', color: '#0056B3' }} />, title: 'Sécurité Entreprise', description: 'Chiffrement AES-256, authentification 2FA, et audit complet' },
    { icon: <TrendingUpIcon sx={{ fontSize: '40px', color: '#0056B3' }} />, title: 'Performant', description: 'Infrastructure cloud scalable avec 99.9% d\'uptime' },
    { icon: <GroupIcon sx={{ fontSize: '40px', color: '#0056B3' }} />, title: 'Support Premium', description: 'Équipe d\'experts disponible 24/7' },
    { icon: <InventoryIcon sx={{ fontSize: '40px', color: '#0056B3' }} />, title: 'Analytics Avancées', description: 'Tableaux de bord détaillés et rapports en temps réel' },
    { icon: <LanguageIcon sx={{ fontSize: '40px', color: '#0056B3' }} />, title: 'Multi-Devises', description: 'Support dinars, euros et autres devises' },
    { icon: <PhoneAndroidIcon sx={{ fontSize: '40px', color: '#0056B3' }} />, title: 'Mobile Ready', description: 'Interface responsive pour tous les appareils' },
  ];

  return (
    <Box>
      <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: '#212121', textAlign: 'center', marginBottom: '48px' }}>
        Pourquoi Choisir MyNet.tn?
      </Typography>
      <Grid container spacing={2}>
        {features.map((feature, idx) => (
          <Grid size={{ xs: 12, md: 4 }} key={idx}>
            <Card sx={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '32px 24px', textAlign: 'center', transition: 'all 200ms ease-in-out', '&:hover': { borderColor: '#0056B3', boxShadow: 'none', transform: 'translateY(-4px)' } }}>
              <Box sx={{ marginBottom: '16px' }}>
                {feature.icon}
              </Box>
              <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '12px' }}>
                {feature.title}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#616161', lineHeight: 1.6 }}>
                {feature.description}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
