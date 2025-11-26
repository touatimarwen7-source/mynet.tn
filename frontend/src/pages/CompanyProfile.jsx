import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import { setPageTitle } from '../utils/pageTitle';
import { companyProfileAPI } from '../api';

export default function CompanyProfile() {
  const theme = institutionalTheme;
  const [activeSection, setActiveSection] = useState('presentation');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [companyData, setCompanyData] = useState(null);
  
  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minRating, setMinRating] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  
  // Service categories
  const categories = ['Sécurité', 'Gardiennage', 'Surveillance', 'Transport', 'Événementiel', 'Audit'];

  useEffect(() => {
    setPageTitle('Profil d\'Entreprise');
    fetchCompanyProfile();
  }, [setPageTitle]);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      // Get supplier ID from URL or context
      const supplierId = new URLSearchParams(window.location.search).get('id') || localStorage.getItem('currentSupplierId') || 1;
      
      const data = await companyProfileAPI.getSupplierProfile(supplierId);
      
      // Transform API response to match component structure
      const transformed = {
        header: {
          name: data.company_name || 'Entreprise',
          city: data.city || 'Tunis',
          sectors: data.preferred_categories || ['Services'],
          logo: data.profile_picture || 'https://via.placeholder.com/120?text=Logo',
        },
        stats: {
          foundationDate: '2005',
          employees: '150+',
          services: '8',
          clients: '45+',
          certifications: ['ISO 9001', 'ISO 45001'],
        },
        presentation: {
          description: data.bio || 'Description de l\'entreprise...',
          specialization: data.preferred_categories?.join(', ') || 'Services généraux',
          coverage: data.city || 'Grand Tunis',
          certifications: ['ISO 9001:2015 (Management Qualité)', 'ISO 45001:2018 (Santé & Sécurité)'],
          experience: '15+ ans',
        },
        services: generateServices(data.preferred_categories),
        similarCompanies: [],
        events: [],
        contact: {
          phone: data.phone || '+216 71 123 456',
          email: data.email || 'info@entreprise.tn',
          address: data.address || 'Rue de la Sécurité, Tunis',
        },
        rating: data.average_rating || 0,
      };
      
      setCompanyData(transformed);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const generateServices = (categories = []) => {
    const services = [
      { id: 1, name: 'SÉCURITÉ INCENDIE', category: 'Sécurité', description: 'Systèmes de détection et lutte contre les incendies' },
      { id: 2, name: 'GARDIENNAGE STATIQUE', category: 'Gardiennage', description: 'Surveillance et protection des locaux' },
      { id: 3, name: 'SURVEILLANCE VIDÉO', category: 'Surveillance', description: 'Monitoring et enregistrement vidéo 24/7' },
      { id: 4, name: 'ESCORTE ET TRANSPORT', category: 'Transport', description: 'Services d\'escorte et transport de fonds' },
      { id: 5, name: 'SÉCURITÉ ÉVÉNEMENTIELLE', category: 'Événementiel', description: 'Protection lors de manifestations' },
      { id: 6, name: 'AUDIT DE SÉCURITÉ', category: 'Audit', description: 'Évaluation et recommandations' },
      { id: 7, name: 'GARDIENNAGE DYNAMIQUE', category: 'Gardiennage', description: 'Patrouilles et interventions d\'urgence' },
      { id: 8, name: 'FORMATION SÉCURITÉ', category: 'Sécurité', description: 'Formation aux protocoles de sécurité' },
    ];
    
    if (categories.length === 0) return services;
    return services.filter(s => categories.includes(s.category));
  };

  const handleSearch = async () => {
    try {
      if (!searchQuery && !selectedCategory && !minRating && !selectedLocation) {
        setSearchResults([]);
        return;
      }
      
      setLoading(true);
      const filters = {};
      if (searchQuery) filters.query = searchQuery;
      if (selectedCategory) filters.category = selectedCategory;
      if (minRating) filters.minRating = minRating;
      if (selectedLocation) filters.location = selectedLocation;
      
      const results = await companyProfileAPI.searchSuppliers(filters);
      setSearchResults(results);
      setShowSearch(true);
    } catch (err) {
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    { id: 'presentation', label: 'PRÉSENTATION', icon: '📋' },
    { id: 'services', label: 'PRODUITS ET SERVICES', icon: '🛒' },
    { id: 'statistics', label: 'CHIFFRES CLÉS', icon: '📊' },
    { id: 'search', label: 'RECHERCHE AVANCÉE', icon: '🔍' },
    { id: 'contact', label: 'CONTACTER L\'ENTREPRISE', icon: '📞' },
  ];

  // ===== RENDER SECTIONS =====
  const renderPresentation = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '16px', color: institutionalTheme.palette.primary.main }}>
        À PROPOS DE L'ENTREPRISE
      </Typography>
      <Paper sx={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '20px' }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: institutionalTheme.palette.text.primary }}>
          {companyData?.presentation.description}
        </Typography>
      </Paper>

      <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
        <Grid xs={12} sm={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, marginBottom: '8px' }}>
                SPÉCIALISATION
              </Typography>
              <Typography variant="body2" sx={{ color: institutionalTheme.palette.text.primary }}>
                {companyData?.presentation.specialization}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, marginBottom: '8px' }}>
                ZONE DE COUVERTURE
              </Typography>
              <Typography variant="body2" sx={{ color: institutionalTheme.palette.text.primary }}>
                {companyData?.presentation.coverage}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, marginBottom: '12px' }}>
            CERTIFICATIONS
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: '8px' }}>
            {companyData?.presentation.certifications.map((cert, idx) => (
              <Chip key={idx} label={cert} sx={{ backgroundColor: institutionalTheme.palette.primary.main, color: '#ffffff' }} />
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );

  const renderServices = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '20px', color: institutionalTheme.palette.primary.main }}>
        PRODUITS ET SERVICES
      </Typography>
      <Grid container spacing={2}>
        {companyData?.services.map((service) => (
          <Grid xs={12} sm={6} md={4} key={service.id}>
            <Card sx={{ border: '1px solid #e0e0e0', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, marginBottom: '8px' }}>
                  {service.name}
                </Typography>
                <Chip label={service.category} size="small" sx={{ marginBottom: '8px', backgroundColor: '#e3f2fd', color: institutionalTheme.palette.primary.main }} />
                <Typography variant="body2" sx={{ color: '#666666', marginBottom: '16px' }}>
                  {service.description}
                </Typography>
              </CardContent>
              <Divider />
              <Box sx={{ padding: '12px', display: 'flex', gap: '8px' }}>
                <Button variant="outlined" size="small" sx={{ flex: 1, borderColor: '#0056B3', color: institutionalTheme.palette.primary.main }}>
                  Consulter
                </Button>
                <Button variant="contained" size="small" sx={{ flex: 1, backgroundColor: institutionalTheme.palette.primary.main }}>
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
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '20px', color: institutionalTheme.palette.primary.main }}>
        CHIFFRES CLÉS
      </Typography>
      <Grid container spacing={2}>
        {companyData?.stats && Object.entries(companyData.stats).slice(0, 4).map(([key, value], idx) => (
          <Grid xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, marginBottom: '8px' }}>
                  {value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  {key.replace(/_/g, ' ').toUpperCase()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {companyData?.rating && (
        <Card sx={{ border: '1px solid #e0e0e0', marginTop: '20px', textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, marginBottom: '8px' }}>
              ⭐ {companyData.rating}/5
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              NOTE MOYENNE
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderSearch = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '20px', color: institutionalTheme.palette.primary.main }}>
        RECHERCHE AVANCÉE
      </Typography>
      
      <Paper sx={{ padding: '20px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Rechercher un fournisseur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ backgroundColor: '#ffffff' }}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth sx={{ backgroundColor: '#ffffff' }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Catégorie"
              >
                <MenuItem value="">Toutes les catégories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="number"
              placeholder="Note min (0-5)"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              sx={{ backgroundColor: '#ffffff' }}
            />
          </Grid>
          <Grid xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              placeholder="Localité"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              sx={{ backgroundColor: '#ffffff' }}
            />
          </Grid>
          <Grid xs={12} sm={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ backgroundColor: institutionalTheme.palette.primary.main, padding: '12px' }}
            >
              Rechercher
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {showSearch && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: '16px', color: institutionalTheme.palette.text.primary }}>
            Résultats ({searchResults.length})
          </Typography>
          {searchResults.length === 0 ? (
            <Alert severity="info">Aucun fournisseur trouvé avec ces critères</Alert>
          ) : (
            <Grid container spacing={2}>
              {searchResults.map((result) => (
                <Grid xs={12} key={result.id}>
                  <Card sx={{ border: '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Grid container alignItems="center" justifyContent="space-between">
                        <Grid xs={12} sm="auto">
                          <Typography variant="h6" sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }}>
                            {result.company_name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666666', marginTop: '4px' }}>
                            ⭐ {result.average_rating}/5 • {result.city}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999999' }}>
                            {result.bio}
                          </Typography>
                        </Grid>
                        <Grid xs={12} sm="auto">
                          <Button variant="contained" sx={{ backgroundColor: institutionalTheme.palette.primary.main }}>
                            Voir Profil
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );

  const renderContact = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '20px', color: institutionalTheme.palette.primary.main }}>
        CONTACTER L'ENTREPRISE
      </Typography>
      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CallIcon sx={{ color: institutionalTheme.palette.primary.main }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666666' }}>Téléphone</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: institutionalTheme.palette.text.primary }}>
                      {companyData?.contact.phone}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <EmailIcon sx={{ color: institutionalTheme.palette.primary.main }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666666' }}>Email</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: institutionalTheme.palette.text.primary }}>
                      {companyData?.contact.email}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <LocationOnIcon sx={{ color: institutionalTheme.palette.primary.main, marginTop: '2px' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666666' }}>Adresse</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: institutionalTheme.palette.text.primary }}>
                      {companyData?.contact.address}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main, marginBottom: '12px' }}>
                SUIVEZ-NOUS
              </Typography>
              <Stack spacing={2}>
                <Button variant="outlined" fullWidth startIcon={<LinkedInIcon />} sx={{ borderColor: '#0056B3', color: institutionalTheme.palette.primary.main }}>
                  LinkedIn
                </Button>
                <Button variant="outlined" fullWidth startIcon={<FacebookIcon />} sx={{ borderColor: '#0056B3', color: institutionalTheme.palette.primary.main }}>
                  Facebook
                </Button>
                <Button fullWidth variant="contained" sx={{ backgroundColor: institutionalTheme.palette.primary.main, marginTop: '12px' }}>
                  Demander un Devis
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  if (loading && !companyData) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: institutionalTheme.palette.primary.main }} />
      </Container>
    );
  }

  if (error && !companyData) {
    return (
      <Container maxWidth="lg" sx={{ paddingY: '40px' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!companyData) return null;

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', paddingY: '40px' }}>
      <Container maxWidth="lg">
        {/* HEADER */}
        <Box sx={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', marginBottom: '30px', border: '1px solid #e0e0e0' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid xs={12} sm="auto">
              <Box sx={{ width: '120px', height: '120px', borderRadius: '4px', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={companyData.header.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            </Grid>
            <Grid xs={12} sm>
              <Typography variant="h3" sx={{ fontSize: '28px', fontWeight: 600, color: institutionalTheme.palette.primary.main, marginBottom: '8px' }}>
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
                  <Chip key={idx} label={sector} sx={{ backgroundColor: institutionalTheme.palette.primary.main, color: '#ffffff' }} />
                ))}
              </Stack>
              <Box sx={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <Button variant="outlined" startIcon={<LinkedInIcon />} sx={{ borderColor: '#0056B3', color: institutionalTheme.palette.primary.main }}>
                  LinkedIn
                </Button>
                <Button variant="outlined" startIcon={<FacebookIcon />} sx={{ borderColor: '#0056B3', color: institutionalTheme.palette.primary.main }}>
                  Facebook
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* NAVIGATION */}
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
                  '&:hover': { backgroundColor: activeSection === item.id ? '#003d7a' : '#f5f5f5' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* CONTENT */}
        <Box sx={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
          {loading && <CircularProgress />}
          {!loading && activeSection === 'presentation' && renderPresentation()}
          {!loading && activeSection === 'services' && renderServices()}
          {!loading && activeSection === 'statistics' && renderStatistics()}
          {!loading && activeSection === 'search' && renderSearch()}
          {!loading && activeSection === 'contact' && renderContact()}
        </Box>
      </Container>
    </Box>
  );
}
