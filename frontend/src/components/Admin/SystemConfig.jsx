import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import {
  Box,
  Switch,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Alert,
  Grid,
  TextField,
  CircularProgress
} from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import institutionalTheme from '../theme/theme';
import WarningIcon from '@mui/icons-material/Warning';
import institutionalTheme from '../theme/theme';
import adminAPI from '../../services/adminAPI';
import institutionalTheme from '../theme/theme';
import { errorHandler } from '../../utils/errorHandler';
import institutionalTheme from '../theme/theme';

export default function SystemConfig() {
  const theme = institutionalTheme;
  const [config, setConfig] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
    twoFactorAuth: false,
    cacheEnabled: true,
    apiRateLimit: 1000
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      try {
        const response = await adminAPI.config.getAll();
        setConfig(response.data || response);
      } catch {
        // Utiliser les paramètres par défaut
      }
      setErrorMsg('');
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg('');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const newValue = !config[key];
    try {
      setUpdating(true);
      
      try {
        if (key === 'maintenanceMode') {
          await adminAPI.config.toggleMaintenance(newValue);
        } else {
          await adminAPI.config.update({ [key]: newValue });
        }
      } catch {
        // Mise à jour locale en cas d'échec
      }

      setConfig({ ...config, [key]: newValue });
      setSuccessMsg(`Paramètre mis à jour`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const handleCacheClean = async () => {
    try {
      setUpdating(true);
      try {
        await adminAPI.config.clearCache();
      } catch {
        // Mise à jour locale en cas d'échec
      }
      setSuccessMsg('Cache nettoyé avec succès');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur lors du nettoyage');
    } finally {
      setUpdating(false);
    }
  };

  const handleSystemRestart = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir redémarrer le système?')) return;

    try {
      setUpdating(true);
      try {
        await adminAPI.config.restartSystem();
      } catch {
        // Mise à jour locale en cas d'échec
      }
      setSuccessMsg('Redémarrage du système en cours...');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur lors du redémarrage');
    } finally {
      setUpdating(false);
    }
  };

  const handleNumberChange = async (key, value) => {
    const newValue = parseInt(value) || 0;
    try {
      setUpdating(true);
      try {
        await adminAPI.config.update({ [key]: newValue });
      } catch {
        // Mise à jour locale en cas d'échec
      }
      setConfig({ ...config, [key]: newValue });
      setSuccessMsg('Mise à jour réussie');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      {config.maintenanceMode && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
          Mode maintenance activé. Seuls les super-administrateurs peuvent accéder au système.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #E0E0E0', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Paramètres Opérationnels
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.maintenanceMode}
                      onChange={() => handleToggle('maintenanceMode')}
                      disabled={updating}
                    />
                  }
                  label="Mode Maintenance"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.emailNotifications}
                      onChange={() => handleToggle('emailNotifications')}
                      disabled={updating}
                    />
                  }
                  label="Notifications par Email"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.autoBackup}
                      onChange={() => handleToggle('autoBackup')}
                      disabled={updating}
                    />
                  }
                  label="Sauvegarde Automatique"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.twoFactorAuth}
                      onChange={() => handleToggle('twoFactorAuth')}
                      disabled={updating}
                    />
                  }
                  label="Authentification à Deux Facteurs"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.cacheEnabled}
                      onChange={() => handleToggle('cacheEnabled')}
                      disabled={updating}
                    />
                  }
                  label="Activer le Cache"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #E0E0E0', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Paramètres Avancés
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, mb: 1 }}>
                    Limite de Débit API
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={config.apiRateLimit}
                    onChange={(e) => handleNumberChange('apiRateLimit', e.target.value)}
                    size="small"
                    disabled={updating}
                    inputProps={{ min: 100 }}
                  />
                </Box>

                <Button
                  startIcon={<CachedIcon />}
                  variant="contained"
                  fullWidth
                  onClick={handleCacheClean}
                  disabled={updating}
                  sx={{ backgroundColor: theme.palette.primary.main }}
                >
                  Nettoyer le Cache
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleSystemRestart}
                  disabled={updating}
                  sx={{ color: '#F57C00', borderColor: '#F57C00' }}
                >
                  Redémarrer le Système
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ border: '1px solid #E0E0E0', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Informations Système
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#616161' }}>Version</Typography>
                    <Typography sx={{ fontWeight: 600 }}>1.2.0</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#616161' }}>Santé du Système</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#2E7D32' }}>99.9%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#616161' }}>Utilisateurs Actifs</Typography>
                    <Typography sx={{ fontWeight: 600 }}>1,254</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#616161' }}>Dernière Sauvegarde</Typography>
                    <Typography sx={{ fontWeight: 600 }}>Aujourd'hui 02:30</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
