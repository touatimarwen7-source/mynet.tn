import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import axios from 'axios';
import SaveIcon from '@mui/icons-material/Save';
import { setPageTitle } from '../utils/pageTitle';

export default function AccountSettings() {
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
    theme: 'light'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setPageTitle('Paramètres du Compte');
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/user/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSettings(response.data.settings || settings);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await axios.put('/api/user/settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur: ' + error.response?.data?.error });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#1565c0' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="md">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: '#212121', marginBottom: '8px' }}>
          Paramètres du Compte
        </Typography>
        <Typography sx={{ color: '#616161', marginBottom: '32px' }}>
          Gérez vos préférences et notifications
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ marginBottom: '24px' }}>
            {message.text}
          </Alert>
        )}

        {/* Notifications Section */}
        <Card sx={{ marginBottom: '24px', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📬 Notifications
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#212121' }}>Notifications par Email</Typography>
                  <Typography sx={{ fontSize: '12px', color: '#616161', marginTop: '4px' }}>
                    Recevoir les mises à jour importantes par email
                  </Typography>
                </Box>
                <Switch
                  checked={settings.email_notifications}
                  onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
                />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#212121' }}>Notifications par SMS</Typography>
                  <Typography sx={{ fontSize: '12px', color: '#616161', marginTop: '4px' }}>
                    Recevoir les alertes critiques par SMS
                  </Typography>
                </Box>
                <Switch
                  checked={settings.sms_notifications}
                  onChange={(e) => setSettings({...settings, sms_notifications: e.target.checked})}
                />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#212121' }}>Emails Marketing</Typography>
                  <Typography sx={{ fontSize: '12px', color: '#616161', marginTop: '4px' }}>
                    Recevoir les offres spéciales et promotions
                  </Typography>
                </Box>
                <Switch
                  checked={settings.marketing_emails}
                  onChange={(e) => setSettings({...settings, marketing_emails: e.target.checked})}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card sx={{ marginBottom: '24px', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎨 Apparence
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Thème</InputLabel>
              <Select
                value={settings.theme}
                onChange={(e) => setSettings({...settings, theme: e.target.value})}
                label="Thème"
              >
                <MenuItem value="light">Clair</MenuItem>
                <MenuItem value="dark">Sombre</MenuItem>
                <MenuItem value="auto">Automatique</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            backgroundColor: '#2e7d32',
            textTransform: 'none',
            fontWeight: 600,
            minHeight: '44px',
            '&:hover': { backgroundColor: '#1b5e20' },
          }}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder les Paramètres'}
        </Button>
      </Container>
    </Box>
  );
}
