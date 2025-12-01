import React, { useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Autocomplete,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { setPageTitle } from '../utils/pageTitle';

/**
 * A page for suppliers to manage their smart alert and notification preferences.
 */
const NotificationPreferencesPage = () => {
  useEffect(() => {
    setPageTitle('Préférences de Notification');
  }, []);

  const {
    preferences,
    categories,
    loading,
    submitting,
    error,
    handlePreferenceChange,
    handleSubmit,
  } = useNotificationPreferences();

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  if (!preferences) {
    return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="info">Impossible de charger les préférences.</Alert></Container>;
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none' }}>
          <CardContent sx={{ padding: '40px' }}>
            <Typography variant="h4" sx={{ mb: 4, color: 'primary.main' }}>
              Gestion des Préférences de Notification
            </Typography>

            <Stack spacing={4} divider={<Divider />}>
              {/* Category Preferences */}
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>Catégories d'Intérêt</FormLabel>
                <Autocomplete
                  multiple
                  options={categories}
                  getOptionLabel={(option) => option.name}
                  value={categories.filter(cat => preferences.preferredCategories.includes(cat.id))}
                  onChange={(event, newValue) => {
                    handlePreferenceChange('preferredCategories', newValue.map(cat => cat.id));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Sélectionnez vos domaines d'activité"
                      placeholder="Catégories"
                    />
                  )}
                />
              </FormControl>

              {/* Geographic Scope */}
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>Portée Géographique</FormLabel>
                <RadioGroup
                  row
                  name="geographicScope"
                  value={preferences.geographicScope}
                  onChange={(e) => handlePreferenceChange('geographicScope', e.target.value)}
                >
                  <FormControlLabel value="national" control={<Radio />} label="Nationale" />
                  <FormControlLabel value="regional" control={<Radio />} label="Régionale" />
                  <FormControlLabel value="local" control={<Radio />} label="Locale" />
                </RadioGroup>
              </FormControl>

              {/* Channels & Frequency */}
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>Canaux et Fréquence</FormLabel>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <FormGroup>
                      <FormLabel>Canaux de notification</FormLabel>
                      <FormControlLabel
                        control={<Switch checked={preferences.channels.email} onChange={(e) => handlePreferenceChange('channels', { ...preferences.channels, email: e.target.checked })} />}
                        label="Alertes par e-mail"
                      />
                      <FormControlLabel
                        control={<Switch checked={preferences.channels.inApp} onChange={(e) => handlePreferenceChange('channels', { ...preferences.channels, inApp: e.target.checked })} />}
                        label="Notifications in-app"
                      />
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormLabel>Fréquence des alertes par e-mail</FormLabel>
                    <RadioGroup
                      name="frequency"
                      value={preferences.frequency}
                      onChange={(e) => handlePreferenceChange('frequency', e.target.value)}
                    >
                      <FormControlLabel value="instant" control={<Radio />} label="Instantanée" />
                      <FormControlLabel value="daily" control={<Radio />} label="Résumé quotidien" />
                      <FormControlLabel value="weekly" control={<Radio />} label="Résumé hebdomadaire" />
                    </RadioGroup>
                  </Grid>
                </Grid>
              </FormControl>
            </Stack>

            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" size="large" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <CircularProgress size={24} /> : 'Enregistrer les modifications'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default NotificationPreferencesPage;