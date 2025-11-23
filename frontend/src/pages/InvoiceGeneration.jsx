import { useEffect, useState } from 'react';
import { Container, Box, Card, CardContent, CardHeader, TextField, Button, Grid, Alert, Typography } from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';

export default function InvoiceGeneration() {
  const [invoiceData, setInvoiceData] = useState({
    clientName: '', orderNumber: '', amount: '', description: ''
  });

  useEffect(() => {
    setPageTitle('Génération de facture');
  }, []);

  const handleChange = (e) => {
    setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
  };

  const handleGenerate = () => {
    alert('Facture créée avec succès');
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Génération de facture
        </Typography>
        <Card sx={{ border: '1px solid #E0E0E0' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Nom du client" name="clientName" value={invoiceData.clientName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Numéro de commande" name="orderNumber" value={invoiceData.orderNumber} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Montant (TND)" name="amount" type="number" value={invoiceData.amount} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description" name="description" multiline rows={4} value={invoiceData.description} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" fullWidth sx={{ backgroundColor: theme.palette.primary.main }} onClick={handleGenerate}>
                  Générer la facture
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
