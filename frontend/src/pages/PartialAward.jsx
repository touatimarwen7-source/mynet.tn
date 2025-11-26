import { useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { Container, Box, Card, CardContent, CardHeader, Grid, Typography, Button, TextField } from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';

export default function PartialAward() {
  const theme = institutionalTheme;
  const offers = [
    { id: 1, supplier: 'supplier1@test.tn', amount: 5000, qty: 10, unit: 'unité' },
    { id: 2, supplier: 'supplier2@test.tn', amount: 4800, qty: 15, unit: 'unité' }
  ];

  useEffect(() => {
    setPageTitle('Attribution partielle');
  }, []);

  return (
    <Box sx={{ backgroundColor: institutionalTheme.palette.background.default, paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: institutionalTheme.palette.primary.main, mb: 3 }}>
          Attribution partielle de l\'appel d\'offres
        </Typography>
        <Grid container spacing={3}>
          {offers.map((offer) => (
            <Grid xs={12} sm={6} key={offer.id}>
              <Card sx={{ border: '1px solid #E0E0E0' }}>
                <CardHeader title={offer.supplier} />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ color: '#616161', fontSize: '12px' }}>Prix:</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '18px', color: institutionalTheme.palette.primary.main }}>{offer.amount} TND</Typography>
                  </Box>
                  <TextField fullWidth label="Quantité à attribuer" type="number" defaultValue={offer.qty} size="small" />
                  <Button variant="contained" fullWidth sx={{ backgroundColor: institutionalTheme.palette.primary.main, mt: 2 }}>
                    Attribuer
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
