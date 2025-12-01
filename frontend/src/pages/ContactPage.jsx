import { useState } from 'react';
import institutionalTheme from '../theme/theme';
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
  const theme = institutionalTheme;
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: institutionalTheme.palette.primary.main,
          color: 'white',
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h1" sx={{ fontSize: '44px', fontWeight: 600, marginBottom: '16px' }}>
            📞 Contactez-Nous - Support 24/7
          </Typography>
          <Typography sx={{ fontSize: '18px', color: '#e3f2fd' }}>
            Notre équipe d'experts est disponible pour répondre à toutes vos questions, suggestions et demandes de support
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
                    <LocationOnIcon sx={{ color: institutionalTheme.palette.primary.main, fontSize: '20px', marginTop: '2px' }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: institutionalTheme.palette.text.primary }}>
                        Siège Social
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ color: '#616161', fontSize: '14px', lineHeight: 1.8 }}>
                    MyNet.tn SARL<br />
                    Immeuble Business Innovation Park<br />
                    Boulevard 9 avril, Ariana<br />
                    2080 Ariana, Tunisie<br />
                    <Box sx={{ marginTop: '8px', fontSize: '13px' }}>
                      📍 Localisation GPS disponible sur Google Maps
                    </Box>
                  </Typography>
                </CardContent>
              </Card>

              {/* Phone */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ padding: '24px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                    <PhoneIcon sx={{ color: institutionalTheme.palette.primary.main, fontSize: '20px', marginTop: '2px' }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: institutionalTheme.palette.text.primary }}>
                        Téléphone
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={1}>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#616161', fontWeight: 600 }}>🛠️ Support Technique (Bugs, Accès)</Typography>
                      <Link href="tel:+21671255000" sx={{ color: institutionalTheme.palette.primary.main, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                        +216 71 255 000
                      </Link>
                      <Typography sx={{ fontSize: '11px', color: '#616161', marginTop: '4px' }}>7h-19h (Sam-Jeu), 24/7 Pour clients Premium</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#616161', fontWeight: 600 }}>💼 Support Commercial (Ventes, Partenaires)</Typography>
                      <Link href="tel:+21671255001" sx={{ color: institutionalTheme.palette.primary.main, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                        +216 71 255 001
                      </Link>
                      <Typography sx={{ fontSize: '11px', color: '#616161', marginTop: '4px' }}>8h-18h (Lun-Ven)</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#616161', fontWeight: 600 }}>⚖️ Support Légal & Conformité</Typography>
                      <Link href="tel:+21671255002" sx={{ color: institutionalTheme.palette.primary.main, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                        +216 71 255 002
                      </Link>
                      <Typography sx={{ fontSize: '11px', color: '#616161', marginTop: '4px' }}>9h-17h (Lun-Ven)</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Email */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ padding: '24px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                    <EmailIcon sx={{ color: institutionalTheme.palette.primary.main, fontSize: '20px', marginTop: '2px' }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: institutionalTheme.palette.text.primary }}>
                        Email
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={1}>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#616161', fontWeight: 600 }}>📧 Support Général & Questions</Typography>
                      <Link href="mailto:support@mynet.tn" sx={{ color: institutionalTheme.palette.primary.main, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                        support@mynet.tn
                      </Link>
                      <Typography sx={{ fontSize: '11px', color: '#616161', marginTop: '4px' }}>Réponse en {'<'} 4 heures</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#616161', fontWeight: 600 }}>🔧 Signaler un Bug Technique</Typography>
                      <Link href="mailto:bugs@mynet.tn" sx={{ color: institutionalTheme.palette.primary.main, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                        bugs@mynet.tn
                      </Link>
                      <Typography sx={{ fontSize: '11px', color: '#616161', marginTop: '4px' }}>Avec détails et captures d'écran</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#616161', fontWeight: 600 }}>💡 Suggestions & Partenariats</Typography>
                      <Link href="mailto:business@mynet.tn" sx={{ color: institutionalTheme.palette.primary.main, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                        business@mynet.tn
                      </Link>
                      <Typography sx={{ fontSize: '11px', color: '#616161', marginTop: '4px' }}>Partenaires B2B & projets spéciaux</Typography>
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
                    <Typography><strong>📅 Jours de Bureau:</strong> Samedi - Jeudi</Typography>
                    <Typography><strong>🕐 Horaires Standards:</strong> 7h00 - 19h00</Typography>
                    <Typography><strong>☎️ Support d'Urgence:</strong> Disponible 24/7 pour clients Premium</Typography>
                    <Typography><strong>🌐 Chat En Ligne:</strong> 7h-19h (réponse {'<'} 5 minutes)</Typography>
                    <Box sx={{ marginTop: '12px', padding: '8px', backgroundColor: 'rgba(13, 71, 161, 0.1)', borderRadius: '4px' }}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>💬 Temps de réponse garanti</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Contact Form Column */}
          <Grid item xs={12} md={8}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ padding: '32px' }}>
                <Typography variant="h3" sx={{ fontSize: '24px', fontWeight: 600, color: institutionalTheme.palette.text.primary, marginBottom: '8px' }}>
                  ✉️ Envoyez-Nous un Message
                </Typography>
                <Typography sx={{ color: '#616161', marginBottom: '24px' }}>
                  Remplissez le formulaire ci-dessous avec vos détails et votre demande. Nous vous répondrons dans les meilleurs délais (maximum 4 heures)
                </Typography>

                {submitted && (
                  <Alert severity="success" sx={{ marginBottom: '24px' }}>
                    ✅ Excellent! Votre message a été reçu. Notre équipe l'examinera et vous répondra sous peu. Vérifiez votre email pour les mises à jour.
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
                    <Grid item xs={12} >
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
                    <Grid item xs={12} >
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
                      backgroundColor: institutionalTheme.palette.primary.main,
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
