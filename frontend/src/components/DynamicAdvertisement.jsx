import { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Stack, IconButton } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function DynamicAdvertisement() {
  const [advertisements] = useState([
    { id: 1, type: 'success', title: 'Succès Client', message: 'Banque Tunisienne adopte MyNet.tn pour gérer 500M TND d\'achats annuels', cta: 'En savoir plus' },
    { id: 2, type: 'webinar', title: 'Webinaire Gratuit', message: 'Masterclass: Optimiser vos appels d\'offres avec l\'IA - Jeudi 20h', cta: 'S\'inscrire gratuitement' },
    { id: 3, type: 'promo', title: 'Offre Limitée', message: 'Gold Plan à -30% pour les 3 premiers mois - Code: GROWTH30', cta: 'Profiter de l\'offre' }
  ]);

  const [currentAd, setCurrentAd] = useState(0);

  const handleNext = () => {
    setCurrentAd((prev) => (prev + 1) % advertisements.length);
  };

  const ad = advertisements[currentAd];

  return (
    <Box sx={{ padding: '24px' }}>
      <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none' }}>
        <CardContent sx={{ padding: '32px' }}>
          <Typography variant="h5" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '12px' }}>
            {ad.title}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', color: '#616161', marginBottom: '16px' }}>
            {ad.message}
          </Typography>
          <Button variant="contained" sx={{ backgroundColor: '#0056B3', color: '#FFFFFF' }}>
            {ad.cta}
          </Button>

          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', marginTop: '20px' }}>
            {advertisements.map((_, idx) => (
              <Box
                key={idx}
                component="button"
                onClick={() => setCurrentAd(idx)}
                sx={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: idx === currentAd ? '#0056B3' : '#E0E0E0',
                  border: 'none',
                  cursor: 'pointer',
                }}
              />
            ))}
            <IconButton size="small" onClick={handleNext} sx={{ marginLeft: '12px' }}>
              <NavigateNextIcon />
            </IconButton>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
