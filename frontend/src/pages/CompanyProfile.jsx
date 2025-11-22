import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { setPageTitle } from '../utils/pageTitle';

export default function CompanyProfile() {
  const [activeSection, setActiveSection] = useState('presentation');
  const [loading, setLoading] = useState(false);

  // Données dynamiques de la compagnie (simulées - à remplacer par API)
  const companyData = {
    // ===== I. HEADER & SHARE =====
    header: {
      name: 'SÉCURITÉ VIGILANT',
      city: 'Ariana',
      sectors: ['Sécurité', 'Gardiennage', 'Surveillance'],
      logo: 'https://via.placeholder.com/120?text=SV',
    },
    // ===== II. KEY STATS =====
    stats: {
      foundationDate: '2005',
      employees: '150+',
      services: '8',
      clients: '45+',
      certifications: ['ISO 9001', 'ISO 45001'],
    },
    // ===== III. PRESENTATION =====
    presentation: {
      description: `Sécurité Vigilant est une entreprise leader dans le domaine de la sécurité et du gardiennage en Tunisie.
Avec plus de 15 ans d'expérience, nous offrons des solutions de sécurité complètes et innovantes pour protéger vos biens et vos personnes.

Notre expertise couvre:
• Gardiennage statique et dynamique
• Surveillance vidéo 24/7
• Services d'escorte et de transport de fonds
• Sécurité événementielle
• Prévention incendie

Nous opérons dans toute la région du Grand Tunis avec une équipe de professionnels certifiés et expérimentés.`,
      specialization: 'Sécurité, Gardiennage, Surveillance',
      coverage: 'Grand Tunis, Ariana, Ben Arous, Mannouba',
      certifications: ['ISO 9001:2015 (Management Qualité)', 'ISO 45001:2018 (Santé & Sécurité)'],
      experience: '15+ ans',
    },
    // ===== IV. PRODUCTS & SERVICES =====
    services: [
      {
        id: 1,
        name: 'SÉCURITÉ INCENDIE',
        description: 'Systèmes de détection et de lutte contre les incendies',
      },
      {
        id: 2,
        name: 'GARDIENNAGE STATIQUE',
        description: 'Surveillance et protection des locaux commerciaux',
      },
      {
        id: 3,
        name: 'SURVEILLANCE VIDÉO',
        description: 'Monitoring et enregistrement vidéo HD 24/7',
      },
      {
        id: 4,
        name: 'ESCORTE ET TRANSPORT',
        description: 'Services d\'escorte personnelle et transport de fonds',
      },
      {
        id: 5,
        name: 'SÉCURITÉ ÉVÉNEMENTIELLE',
        description: 'Protection lors de manifestations et événements',
      },
      {
        id: 6,
        name: 'AUDIT DE SÉCURITÉ',
        description: 'Évaluation et recommandations de sécurité',
      },
      {
        id: 7,
        name: 'GARDIENNAGE DYNAMIQUE',
        description: 'Patrouilles et interventions d\'urgence',
      },
      {
        id: 8,
        name: 'FORMATION SÉCURITÉ',
        description: 'Formation du personnel aux protocoles de sécurité',
      },
    ],
    // ===== V. SIMILAR COMPANIES =====
    similarCompanies: [
      { id: 1, name: 'GROUPE SÉCURITÉ PLUS', sector: 'Sécurité' },
      { id: 2, name: 'GARDIENNAGE TUNISIA', sector: 'Gardiennage' },
      { id: 3, name: 'PROTECTION VIGILANT', sector: 'Sécurité' },
      { id: 4, name: 'SAFE TUNISIA', sector: 'Surveillance' },
    ],
    // ===== VI. EVENTS & EXHIBITIONS =====
    events: [
      {
        id: 1,
        name: 'SECURITY EXPO TUNISIA 2025',
        date: '15-17 Mars 2025',
        location: 'Palais des Congrès - Tunis',
      },
      {
        id: 2,
        name: 'SALON DE LA SÉCURITÉ',
        date: '10-12 Mai 2025',
        location: 'Centre d\'Affaires - Ariana',
      },
      {
        id: 3,
        name: 'TECH SECURITY FORUM',
        date: '5-7 Juin 2025',
        location: 'Cité de l\'Innovation - Sousse',
      },
    ],
    // ===== CONTACT =====
    contact: {
      phone: '+216 71 123 456',
      email: 'info@securite-vigilant.tn',
      address: 'Rue de la Sécurité, Ariana 2037',
    },
  };

  useEffect(() => {
    setPageTitle('Profil d\'Entreprise');
  }, []);

  // ===== NAVIGATION MENU =====
  const navigationItems = [
    { id: 'presentation', label: 'PRÉSENTATION', icon: '📋' },
    { id: 'services', label: 'PRODUITS ET SERVICES', icon: '🛒' },
    { id: 'statistics', label: 'CHIFFRES CLÉS', icon: '📊' },
    { id: 'similar', label: 'ENTREPRISES SIMILAIRES', icon: '🏢' },
    { id: 'events', label: 'ÉVÉNEMENTS ET EXPOSITIONS', icon: '📅' },
    { id: 'contact', label: 'CONTACTER L\'ENTREPRISE', icon: '📞' },
  ];

  // ===== RENDER SECTIONS =====
  const renderPresentation = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '16px', color: '#0056B3' }}>
        À PROPOS DE L'ENTREPRISE
      </Typography>
      <Paper sx={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '20px' }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#212121' }}>
          {companyData.presentation.description}
        </Typography>
      </Paper>

      <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0056B3', marginBottom: '8px' }}>
                SPÉCIALISATION
              </Typography>
              <Typography variant="body2" sx={{ color: '#212121' }}>
                {companyData.presentation.specialization}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0056B3', marginBottom: '8px' }}>
                ZONE DE COUVERTURE
              </Typography>
              <Typography variant="body2" sx={{ color: '#212121' }}>
                {companyData.presentation.coverage}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0056B3', marginBottom: '12px' }}>
            CERTIFICATIONS
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: '8px' }}>
            {companyData.presentation.certifications.map((cert, idx) => (
              <Chip key={idx} label={cert} sx={{ backgroundColor: '#0056B3', color: '#ffffff' }} />
            ))}
          </Stack>
          <Typography variant="body2" sx={{ marginTop: '12px', color: '#666666' }}>
            <strong>Expérience:</strong> {companyData.presentation.experience}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  const renderServices = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '20px', color: '#0056B3' }}>
        PRODUITS ET SERVICES
      </Typography>
      <Grid container spacing={2}>
        {companyData.services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <Card sx={{ border: '1px solid #e0e0e0', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0056B3', marginBottom: '8px' }}>
                  {service.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666', marginBottom: '16px' }}>
                  {service.description}
                </Typography>
              </CardContent>
              <Divider />
              <Box sx={{ padding: '12px', display: 'flex', gap: '8px' }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    flex: 1,
                    borderColor: '#0056B3',
                    color: '#0056B3',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                >
                  Consulter
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    flex: 1,
                    backgroundColor: '#0056B3',
                    color: '#ffffff',
                    '&:hover': { backgroundColor: '#003d7a' },
                  }}
                >
                  Devis
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderStatistics = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '20px', color: '#0056B3' }}>
        CHIFFRES CLÉS
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#0056B3', marginBottom: '8px' }}>
                {companyData.stats.foundationDate}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                Année de Fondation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#0056B3', marginBottom: '8px' }}>
                {companyData.stats.employees}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                Effectifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#0056B3', marginBottom: '8px' }}>
                {companyData.stats.services}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                Services
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#0056B3', marginBottom: '8px' }}>
                {companyData.stats.clients}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                Clients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderSimilarCompanies = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '20px', color: '#0056B3' }}>
        AUTRES ENTREPRISES DANS LE MÊME SECTEUR
      </Typography>
      <Grid container spacing={2}>
        {companyData.similarCompanies.map((company) => (
          <Grid item xs={12} sm={6} key={company.id}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#212121' }}>
                    {company.name}
                  </Typography>
                  <Chip label={company.sector} size="small" sx={{ marginTop: '8px', backgroundColor: '#e3f2fd', color: '#0056B3' }} />
                </Box>
                <Button variant="text" sx={{ color: '#0056B3' }}>
                  Voir
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderEvents = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '20px', color: '#0056B3' }}>
        ÉVÉNEMENTS ET EXPOSITIONS
      </Typography>
      <List sx={{ backgroundColor: '#ffffff' }}>
        {companyData.events.map((event, idx) => (
          <Box key={event.id}>
            <ListItem sx={{ paddingY: '16px' }}>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#212121' }}>
                    {event.name}
                  </Typography>
                }
                secondary={
                  <Box sx={{ marginTop: '8px' }}>
                    <Typography variant="body2" sx={{ color: '#666666', marginBottom: '4px' }}>
                      <strong>Date:</strong> {event.date}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666' }}>
                      <strong>Lieu:</strong> {event.location}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            {idx < companyData.events.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Box>
  );

  const renderContact = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '20px', color: '#0056B3' }}>
        CONTACTER L'ENTREPRISE
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CallIcon sx={{ color: '#0056B3' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666666' }}>Téléphone</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#212121' }}>
                      {companyData.contact.phone}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <EmailIcon sx={{ color: '#0056B3' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666666' }}>Email</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#212121' }}>
                      {companyData.contact.email}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <LocationOnIcon sx={{ color: '#0056B3', marginTop: '2px' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666666' }}>Adresse</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#212121' }}>
                      {companyData.contact.address}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0056B3', marginBottom: '12px' }}>
                SUIVEZ-NOUS
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<LinkedInIcon />}
                  sx={{ borderColor: '#0056B3', color: '#0056B3', flex: 1 }}
                >
                  LinkedIn
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  sx={{ borderColor: '#0056B3', color: '#0056B3', flex: 1 }}
                >
                  Facebook
                </Button>
              </Stack>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  marginTop: '12px',
                  backgroundColor: '#0056B3',
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#003d7a' },
                }}
              >
                Demander un Devis
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', paddingY: '40px' }}>
      <Container maxWidth="lg">
        {/* ===== I. HEADER =====  */}
        <Box sx={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', marginBottom: '30px', border: '1px solid #e0e0e0' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm="auto">
              <Box
                sx={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '4px',
                  backgroundColor: '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src={companyData.header.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            </Grid>
            <Grid item xs={12} sm>
              <Typography variant="h3" sx={{ fontSize: '28px', fontWeight: 600, color: '#0056B3', marginBottom: '8px' }}>
                {companyData.header.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <LocationOnIcon sx={{ fontSize: '18px', color: '#666666' }} />
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  {companyData.header.city}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: '8px' }}>
                {companyData.header.sectors.map((sector, idx) => (
                  <Chip key={idx} label={sector} sx={{ backgroundColor: '#0056B3', color: '#ffffff' }} />
                ))}
              </Stack>
              <Box sx={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <Button
                  variant="outlined"
                  startIcon={<LinkedInIcon />}
                  sx={{ borderColor: '#0056B3', color: '#0056B3' }}
                >
                  LinkedIn
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  sx={{ borderColor: '#0056B3', color: '#0056B3' }}
                >
                  Facebook
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* ===== II. NAVIGATION MENU ===== */}
        <Box sx={{ marginBottom: '30px', overflowX: 'auto' }}>
          <Stack direction="row" spacing={1} sx={{ paddingY: '8px', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                sx={{
                  padding: '10px 16px',
                  borderRadius: '4px',
                  backgroundColor: activeSection === item.id ? '#0056B3' : '#ffffff',
                  color: activeSection === item.id ? '#ffffff' : '#0056B3',
                  border: '1px solid #0056B3',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: activeSection === item.id ? '#003d7a' : '#f5f5f5',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* ===== CONTENT SECTIONS ===== */}
        <Box sx={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
          {loading && <CircularProgress />}

          {!loading && activeSection === 'presentation' && renderPresentation()}
          {!loading && activeSection === 'services' && renderServices()}
          {!loading && activeSection === 'statistics' && renderStatistics()}
          {!loading && activeSection === 'similar' && renderSimilarCompanies()}
          {!loading && activeSection === 'events' && renderEvents()}
          {!loading && activeSection === 'contact' && renderContact()}
        </Box>
      </Container>
    </Box>
  );
}
