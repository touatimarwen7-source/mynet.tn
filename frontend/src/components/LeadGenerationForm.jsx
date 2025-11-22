import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Stack, FormControlLabel, Radio, RadioGroup, Alert } from '@mui/material';

export default function LeadGenerationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    formType: 'demo'
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
      setFormData({ name: '', email: '', company: '', phone: '', formType: 'demo' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', paddingY: '60px', borderTop: '1px solid #E0E0E0', borderBottom: '1px solid #E0E0E0' }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', marginBottom: '32px' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#212121', marginBottom: '12px' }}>
            Restez Connecté avec MyNet.tn
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#616161' }}>
            Recevez les dernières mises à jour, conseils exclusifs et offres spéciales directement dans votre boîte mail
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {submitted && (
            <Alert severity="success" sx={{ marginBottom: '24px' }}>
              Merci! Nous vous recontacterons sous 24 heures avec plus d'informations.
            </Alert>
          )}

          <Stack spacing={2} sx={{ marginBottom: '24px' }}>
            <RadioGroup row value={formData.formType} onChange={handleChange} name="formType">
              <FormControlLabel
                value="demo"
                control={<Radio />}
                label="Demander une Démo"
              />
              <FormControlLabel
                value="newsletter"
                control={<Radio />}
                label="S'abonner au Newsletter"
              />
            </RadioGroup>
          </Stack>

          <Stack spacing={2} sx={{ marginBottom: '24px' }}>
            <TextField
              fullWidth
              label="Votre Nom Complet"
              name="name"
              placeholder="Exemple: Ahmed Ben Ali"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Votre Email"
              name="email"
              type="email"
              placeholder="vous@entreprise.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Votre Entreprise"
              name="company"
              placeholder="Nom de l'entreprise"
              value={formData.company}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Téléphone (optionnel)"
              name="phone"
              type="tel"
              placeholder="+216 20 000 000"
              value={formData.phone}
              onChange={handleChange}
            />
          </Stack>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer ma Demande'}
          </Button>

          <Typography sx={{ fontSize: '12px', color: '#616161', textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
            Nous respectons votre confidentialité. Aucun spam. Vous pouvez vous désabonner à tout moment.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
