import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VerifiedIcon from '@mui/icons-material/Verified';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import { authAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function Profile({ user }) {
  useEffect(() => {
    setPageTitle('Mon Profil Professionnel');
  }, []);

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'tender', keyword: '' });
  const [activity, setActivity] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data.user);
      setFormData(response.data.user);
      setInterests(response.data.user.interests || []);
      setAlerts(response.data.user.alerts || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la récupération du profil');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await authAPI.getActivity?.();
      if (response?.data) {
        setActivity(response.data.activity || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'activité');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      setProfile(response.data.user);
      setEditing(false);
      setSuccess('Les modifications ont été enregistrées avec succès');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement des modifications');
    } finally {
      setLoading(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };

  const removeInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const addAlert = () => {
    if (alertData.keyword.trim()) {
      const newAlert = {
        id: Date.now(),
        ...alertData,
        created_at: new Date().toLocaleDateString('fr-FR')
      };
      setAlerts([...alerts, newAlert]);
      setAlertData({ type: 'tender', keyword: '' });
      setShowAlertForm(false);
    }
  };

  const removeAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#1565c0' }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ paddingY: '40px' }}>
        <Alert severity="error">Profil non disponible</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: '#212121' }}>
              Mon Profil Professionnel
            </Typography>
            <Typography sx={{ color: '#616161', marginTop: '8px' }}>
              Gérez vos informations de compte et vos paramètres professionnels
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={editing ? <CancelIcon /> : <EditIcon />}
            onClick={() => setEditing(!editing)}
            sx={{
              backgroundColor: editing ? '#f57c00' : '#1565c0',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: editing ? '#e65100' : '#0d47a1',
              },
            }}
          >
            {editing ? 'Annuler' : 'Modifier'}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ marginBottom: '24px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ marginBottom: '24px' }}>{success}</Alert>}

        {/* Profile Card */}
        <Card sx={{ marginBottom: '32px', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '32px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '24px' }}>
              <Box
                sx={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#1565c0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 600,
                }}
              >
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontSize: '24px', fontWeight: 600, color: '#212121' }}>
                  {profile.full_name || profile.username}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <Chip
                    label={profile.role === 'buyer' ? 'Acheteur' : profile.role === 'supplier' ? 'Fournisseur' : 'Administrateur'}
                    sx={{ backgroundColor: '#1565c0', color: 'white', fontWeight: 600 }}
                  />
                  {profile.is_verified && (
                    <Chip
                      icon={<VerifiedIcon />}
                      label="Vérifié"
                      sx={{ backgroundColor: '#2e7d32', color: 'white', fontWeight: 600 }}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {!editing ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Email
                  </Typography>
                  <Typography sx={{ fontSize: '16px', color: '#212121', fontWeight: 500 }}>
                    {profile.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Téléphone
                  </Typography>
                  <Typography sx={{ fontSize: '16px', color: '#212121', fontWeight: 500 }}>
                    {profile.phone || '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Entreprise
                  </Typography>
                  <Typography sx={{ fontSize: '16px', color: '#212121', fontWeight: 500 }}>
                    {profile.company_name || '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Enregistrement
                  </Typography>
                  <Typography sx={{ fontSize: '16px', color: '#212121', fontWeight: 500 }}>
                    {profile.company_registration || '—'}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  disabled
                />
                <TextField
                  fullWidth
                  label="Nom Complet"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Entreprise"
                  name="company_name"
                  value={formData.company_name || ''}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Numéro d'Enregistrement"
                  name="company_registration"
                  value={formData.company_registration || ''}
                  onChange={handleChange}
                />
                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<SaveIcon />}
                  sx={{
                    backgroundColor: '#2e7d32',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: '#1b5e20' },
                  }}
                >
                  Enregistrer
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: '1px solid #e0e0e0', marginBottom: '24px' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Secteurs d'Intérêt" />
            <Tab label="Alertes de Recherche" />
            <Tab label="Historique d'Activité" />
          </Tabs>
        </Box>

        {/* Tab 1: Interests */}
        {tabValue === 0 && (
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ padding: '24px' }}>
              <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '16px' }}>
                Secteurs d'Intérêt
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {interests.length === 0 ? (
                  <Typography sx={{ color: '#999', fontStyle: 'italic' }}>Aucun secteur défini</Typography>
                ) : (
                  interests.map((interest, idx) => (
                    <Chip
                      key={idx}
                      label={interest}
                      onDelete={() => removeInterest(idx)}
                      sx={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}
                    />
                  ))
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: '8px' }}>
                <TextField
                  size="small"
                  placeholder="Ajouter un secteur..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <Button
                  variant="contained"
                  onClick={addInterest}
                  sx={{
                    backgroundColor: '#2e7d32',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Ajouter
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Alerts */}
        {tabValue === 1 && (
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ padding: '24px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121' }}>
                  Alertes de Recherche
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowAlertForm(!showAlertForm)}
                  sx={{
                    backgroundColor: '#1565c0',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {showAlertForm ? 'Annuler' : 'Nouvelle Alerte'}
                </Button>
              </Box>

              {showAlertForm && (
                <Box sx={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
                  <FormControl fullWidth size="small" sx={{ marginBottom: '12px' }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={alertData.type}
                      label="Type"
                      onChange={(e) => setAlertData({ ...alertData, type: e.target.value })}
                    >
                      <MenuItem value="tender">Appel d'Offres</MenuItem>
                      <MenuItem value="supplier">Fournisseur</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Mot-clé..."
                    value={alertData.keyword}
                    onChange={(e) => setAlertData({ ...alertData, keyword: e.target.value })}
                    sx={{ marginBottom: '12px' }}
                  />
                  <Button
                    variant="contained"
                    onClick={addAlert}
                    sx={{
                      backgroundColor: '#2e7d32',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Créer Alerte
                  </Button>
                </Box>
              )}

              <Stack spacing={2}>
                {alerts.length === 0 ? (
                  <Typography sx={{ color: '#999', fontStyle: 'italic' }}>Aucune alerte configurée</Typography>
                ) : (
                  alerts.map(alert => (
                    <Paper key={alert.id} sx={{ padding: '12px', backgroundColor: '#f5f5f5' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: '#212121' }}>{alert.keyword}</Typography>
                          <Typography sx={{ fontSize: '12px', color: '#616161' }}>{alert.type === 'tender' ? 'Appel d\'Offres' : 'Fournisseur'} • {alert.created_at}</Typography>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => removeAlert(alert.id)}
                          sx={{ color: '#c62828' }}
                        >
                          Supprimer
                        </Button>
                      </Box>
                    </Paper>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Activity */}
        {tabValue === 2 && (
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ padding: '24px' }}>
              <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HistoryIcon sx={{ color: '#1565c0' }} />
                Historique d'Activité
              </Typography>
              <List>
                {activity.length === 0 ? (
                  <Typography sx={{ color: '#999', fontStyle: 'italic', padding: '16px' }}>Aucune activité disponible</Typography>
                ) : (
                  activity.slice(0, 10).map((item, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon sx={{ minWidth: 40, color: '#1565c0' }}>
                        {item.type === 'login' ? '📥' : item.type === 'update' ? '📝' : item.type === 'tender' ? '📄' : '🎯'}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.description || item.type}
                        secondary={new Date(item.created_at).toLocaleDateString('fr-FR')}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
