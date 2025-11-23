import { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { setPageTitle } from '../utils/pageTitle';
import { companyProfileAPI } from '../api';

export default function CompanyProfileAdmin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    company_name: '',
    company_registration: '',
    phone: '',
    bio: '',
    address: '',
    city: '',
    country: 'Tunisie',
    profile_picture: '',
    preferred_categories: [],
    service_locations: [],
  });
  
  const [newCategory, setNewCategory] = useState('');
  const [newLocation, setNewLocation] = useState('');
  
  const categories = ['Sécurité', 'Gardiennage', 'Surveillance', 'Transport', 'Événementiel', 'Audit', 'Logistique', 'Consulting'];
  const locations = ['Tunis', 'Ariana', 'Ben Arous', 'Mannouba', 'Sfax', 'Sousse', 'Nabeul', 'Gabès'];

  useEffect(() => {
    setPageTitle('Gestion du Profil d\'Entreprise');
    // Get current user's ID from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      setError('Utilisateur non identifié');
      setLoading(false);
      return;
    }
    setCurrentUser(user);
    // كل مستخدم يحرر بروفيله فقط - لا يمكن تغيير ID من URL
    fetchProfileData(user.id);
  }, []);

  const fetchProfileData = async (supplierId) => {
    try {
      setLoading(true);
      const data = await companyProfileAPI.getSupplierProfile(supplierId);
      
      setFormData({
        company_name: data.company_name || '',
        company_registration: data.company_registration || '',
        phone: data.phone || '',
        bio: data.bio || '',
        address: data.address || '',
        city: data.city || '',
        country: 'Tunisie',
        profile_picture: data.profile_picture || '',
        preferred_categories: data.preferred_categories || [],
        service_locations: data.service_locations || [],
      });
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddCategory = () => {
    if (newCategory && !formData.preferred_categories.includes(newCategory)) {
      setFormData(prev => ({
        ...prev,
        preferred_categories: [...prev.preferred_categories, newCategory]
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      preferred_categories: prev.preferred_categories.filter(c => c !== category)
    }));
  };

  const handleAddLocation = () => {
    if (newLocation && !formData.service_locations.includes(newLocation)) {
      setFormData(prev => ({
        ...prev,
        service_locations: [...prev.service_locations, newLocation]
      }));
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      service_locations: prev.service_locations.filter(l => l !== location)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // يمكن للمستخدم تحرير بروفيله فقط - استخدام ID المستخدم الحالي
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        setError('Utilisateur non identifié');
        setSaving(false);
        return;
      }
      
      await companyProfileAPI.updateSupplierProfile(user.id, formData);
      
      setSuccess('Profil mis à jour avec succès!');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err) {
      setError('Erreur lors de la sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    fetchProfileData(user.id || 1);
    setSuccess('');
    setError('');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 600, marginBottom: '30px', color: theme.palette.primary.main }}>
          Gestion du Profil d'Entreprise
        </Typography>

        {error && <Alert severity="error" sx={{ marginBottom: '20px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ marginBottom: '20px' }}>{success}</Alert>}

        {/* Information Générale */}
        <Card sx={{ border: '1px solid #e0e0e0', marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '20px', color: theme.palette.primary.main }}>
              INFORMATIONS GÉNÉRALES
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom de l'Entreprise"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="N° Matricule Fiscal"
                  value={formData.company_registration}
                  onChange={(e) => handleInputChange('company_registration', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="URL Logo/Photo"
                  value={formData.profile_picture}
                  onChange={(e) => handleInputChange('profile_picture', e.target.value)}
                  placeholder="https://..."
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Adresse et Localisation */}
        <Card sx={{ border: '1px solid #e0e0e0', marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '20px', color: theme.palette.primary.main }}>
              ADRESSE ET LOCALISATION
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ville"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pays"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Biographie */}
        <Card sx={{ border: '1px solid #e0e0e0', marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '20px', color: theme.palette.primary.main }}>
              BIOGRAPHIE
            </Typography>
            <TextField
              fullWidth
              label="Description de l'Entreprise"
              multiline
              rows={4}
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Décrivez votre entreprise, vos services, votre expérience..."
            />
          </CardContent>
        </Card>

        {/* Catégories de Services */}
        <Card sx={{ border: '1px solid #e0e0e0', marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '20px', color: theme.palette.primary.main }}>
              CATÉGORIES DE SERVICES
            </Typography>
            <Box sx={{ marginBottom: '16px' }}>
              <Stack direction="row" spacing={1} sx={{ marginBottom: '16px' }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Sélectionner une catégorie</InputLabel>
                  <Select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    label="Sélectionner une catégorie"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleAddCategory}
                  sx={{ backgroundColor: theme.palette.primary.main }}
                >
                  Ajouter
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: '8px' }}>
                {formData.preferred_categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    onDelete={() => handleRemoveCategory(cat)}
                    sx={{ backgroundColor: theme.palette.primary.main, color: '#ffffff' }}
                  />
                ))}
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Zones de Couverture */}
        <Card sx={{ border: '1px solid #e0e0e0', marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '20px', color: theme.palette.primary.main }}>
              ZONES DE COUVERTURE
            </Typography>
            <Box sx={{ marginBottom: '16px' }}>
              <Stack direction="row" spacing={1} sx={{ marginBottom: '16px' }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Sélectionner une localité</InputLabel>
                  <Select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    label="Sélectionner une localité"
                  >
                    {locations.map((loc) => (
                      <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleAddLocation}
                  sx={{ backgroundColor: theme.palette.primary.main }}
                >
                  Ajouter
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: '8px' }}>
                {formData.service_locations.map((loc) => (
                  <Chip
                    key={loc}
                    label={loc}
                    onDelete={() => handleRemoveLocation(loc)}
                    sx={{ backgroundColor: theme.palette.primary.main, color: '#ffffff' }}
                  />
                ))}
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            sx={{ borderColor: '#999999', color: '#999999' }}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ backgroundColor: theme.palette.primary.main }}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Enregistrer'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
