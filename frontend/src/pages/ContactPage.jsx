import { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Stack,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { setPageTitle } from '../utils/pageTitle';

export default function ContactPage() {
  setPageTitle('Contact et Support');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
          color: 'white',
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h1" sx={{ fontSize: '44px', fontWeight: 600, marginBottom: '16px' }}>
            📞 Contact et Support
          </Typography>
          <Typography sx={{ fontSize: '18px', color: '#e3f2fd' }}>
            Nous sommes ici pour vous aider
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ paddingY: '60px' }}>
        <Grid container spacing={4}>
          {/* Contact Info Column */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              {/* Address */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ padding: '24px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                    <LocationOnIcon sx={{ color: '#1565c0', marginTop: '2px' }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: '#212121' }}>
                        Siège Social
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ color: '#616161', fontSize: '14px', lineHeight: 1.8 }}>
                    MyNet.tn<br />
                    Immeuble Tunisiana Business Center<br />
                    Rue des Entrepreneurs, La Marsa<br />
                    2070 Tunis, Tunisie
                  </Typography>
                </CardContent>
              </Card>

              {/* Phone */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ padding: '24px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                    <PhoneIcon sx={{ color: '#1565c0', marginTop: '2px' }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: '#212121' }}>
                        Téléphone
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={1}>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#616161', fontWeight: 600 }}>Support Technique</Typography>
                      <Link href="tel:+21671123456" sx={{ color: '#1565c0', textDecoration: 'none', fontSize: '14px' }}>
                        +216 71 123 456
                      </Link>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#616161', fontWeight: 600 }}>Support Commercial</Typography>
                      <Link href="tel:+21671123457" sx={{ color: '#1565c0', textDecoration: 'none', fontSize: '14px' }}>
                        +216 71 123 457
                      </Link>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#616161', fontWeight: 600 }}>Support Légal</Typography>
                      <Link href="tel:+21671123458" sx={{ color: '#1565c0', textDecoration: 'none', fontSize: '14px' }}>
                        +216 71 123 458
                      </Link>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Email */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ padding: '24px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                    <EmailIcon sx={{ color: '#1565c0', marginTop: '2px' }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: '#212121' }}>
                        Email
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={1}>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#616161', fontWeight: 600 }}>Support Général</Typography>
                      <Link href="mailto:support@mynet.tn" sx={{ color: '#1565c0', textDecoration: 'none', fontSize: '14px' }}>
                        support@mynet.tn
                      </Link>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#616161', fontWeight: 600 }}>Technique</Typography>
                      <Link href="mailto:tech@mynet.tn" sx={{ color: '#1565c0', textDecoration: 'none', fontSize: '14px' }}>
                        tech@mynet.tn
                      </Link>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Hours */}
              <Card sx={{ border: '1px solid #e0e0e0', backgroundColor: '#e3f2fd' }}>
                <CardContent sx={{ padding: '24px' }}>
                  <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: '#0d47a1', marginBottom: '12px' }}>
                    ⏰ Horaires
                  </Typography>
                  <Stack spacing={1} sx={{ fontSize: '14px', color: '#0d47a1' }}>
                    <Typography><strong>Lundi - Vendredi:</strong> 8:00 - 18:00</Typography>
                    <Typography><strong>Samedi:</strong> 9:00 - 13:00</Typography>
                    <Typography><strong>Support 24/7:</strong> Disponible pour clients Premium</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Contact Form Column */}
          <Grid item xs={12} md={8}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ padding: '32px' }}>
                <Typography variant="h3" sx={{ fontSize: '24px', fontWeight: 600, color: '#212121', marginBottom: '8px' }}>
                  Envoyez-nous un Message
                </Typography>
                <Typography sx={{ color: '#616161', marginBottom: '24px' }}>
                  Remplissez le formulaire ci-dessous et nous vous répondrons dès que possible
                </Typography>

                {submitted && (
                  <Alert severity="success" sx={{ marginBottom: '24px' }}>
                    ✅ Merci! Votre message a été envoyé avec succès. Nous vous répondrons bientôt.
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nom"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={submitting}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={submitting}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Téléphone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={submitting}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Entreprise"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        disabled={submitting}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Sujet"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        disabled={submitting}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        disabled={submitting}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    variant="contained"
                    type="submit"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{
                      backgroundColor: '#1565c0',
                      textTransform: 'none',
                      fontWeight: 600,
                      minHeight: '44px',
                      marginTop: '16px',
                      '&:hover': { backgroundColor: '#0d47a1' },
                    }}
                  >
                    {submitting ? 'Envoi en cours...' : 'Envoyer le Message'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
