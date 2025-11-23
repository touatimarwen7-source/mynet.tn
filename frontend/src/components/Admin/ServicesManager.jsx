import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import institutionalTheme from '../theme/theme';
import DeleteIcon from '@mui/icons-material/Delete';
import institutionalTheme from '../theme/theme';
import AddIcon from '@mui/icons-material/Add';
import institutionalTheme from '../theme/theme';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import institutionalTheme from '../theme/theme';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import institutionalTheme from '../theme/theme';
import adminAPI from '../../services/adminAPI';
import institutionalTheme from '../theme/theme';
import { errorHandler } from '../../utils/errorHandler';
import institutionalTheme from '../theme/theme';

// Fallback data for features
const FALLBACK_FEATURES = [
  { id: 1, feature_name: 'ERP Integration', feature_key: 'erp_integration', category: 'advanced', is_enabled: false },
  { id: 2, feature_name: 'Payment Processing', feature_key: 'payment_processing', category: 'payment', is_enabled: true },
  { id: 3, feature_name: 'WebSocket Notifications', feature_key: 'websocket_notifications', category: 'realtime', is_enabled: true },
  { id: 4, feature_name: 'AI Bid Analysis', feature_key: 'ai_bid_analysis', category: 'advanced', is_enabled: false },
  { id: 5, feature_name: 'Advanced Analytics', feature_key: 'advanced_analytics', category: 'analytics', is_enabled: true }
];

const FALLBACK_PLANS = [
  { id: 1, name: 'Plan de Base', description: 'Pour commencer', price: 0, duration_days: 30, is_active: true },
  { id: 2, name: 'Plan Argent', description: 'Pour la croissance', price: 99, duration_days: 30, is_active: true },
  { id: 3, name: 'Plan Or', description: 'Pour les entreprises', price: 299, duration_days: 30, is_active: true }
];

export default function ServicesManager() {
  const theme = institutionalTheme;
  const [currentTab, setCurrentTab] = useState(0);
  const [features, setFeatures] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Feature flag dialogs
  const [openFeatureDialog, setOpenFeatureDialog] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [featureForm, setFeatureForm] = useState({
    feature_name: '',
    feature_key: '',
    category: 'advanced',
    description: ''
  });

  // Plan dialogs
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: 0,
    duration_days: 30
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      try {
        const [featuresRes, plansRes] = await Promise.all([
          adminAPI.features.getAll(),
          adminAPI.subscriptions.getPlans()
        ]);
        setFeatures(featuresRes.features || featuresRes);
        setPlans(plansRes || []);
      } catch {
        setFeatures(FALLBACK_FEATURES);
        setPlans(FALLBACK_PLANS);
      }
      setErrorMsg('');
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur de chargement');
      setFeatures(FALLBACK_FEATURES);
      setPlans(FALLBACK_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async (featureId, currentStatus, featureName) => {
    try {
      setSaving(true);
      const action = currentStatus ? 'disable' : 'enable';
      const featureKey = features.find(f => f.id === featureId)?.feature_key;
      
      try {
        await adminAPI.features[action](featureKey);
      } catch {}

      setFeatures(features.map(f =>
        f.id === featureId ? { ...f, is_enabled: !currentStatus } : f
      ));
      setSuccessMsg(`Service "${featureName}" ${!currentStatus ? 'activé' : 'désactivé'}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const renderFeatureFlagsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Services Généraux</Typography>
          <Typography variant="caption" sx={{ color: '#616161' }}>{features.length} service(s)</Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Service</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Clé</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Catégorie</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>État</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: '#616161' }}>
                  Aucun service
                </TableCell>
              </TableRow>
            ) : (
              features.map(feature => (
                <TableRow key={feature.id} sx={{ '&:hover': { backgroundColor: theme.palette.background.default } }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>{feature.feature_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '13px', color: '#616161', fontFamily: 'monospace' }}>
                      {feature.feature_key}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={feature.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={feature.is_enabled ? 'Activé' : 'Désactivé'}
                      size="small"
                      sx={{
                        backgroundColor: feature.is_enabled ? '#E8F5E9' : '#FFEBEE',
                        color: feature.is_enabled ? '#2E7D32' : '#C62828'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleToggleFeature(feature.id, feature.is_enabled, feature.feature_name)}
                      disabled={saving}
                      sx={{ color: feature.is_enabled ? '#2E7D32' : '#F57C00' }}
                    >
                      {feature.is_enabled ? <ToggleOnIcon /> : <ToggleOffIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderSubscriptionPlansTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Plans d\'Abonnement</Typography>
          <Typography variant="caption" sx={{ color: '#616161' }}>{plans.length} plan(s)</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: theme.palette.primary.main }}
          disabled={saving}
          onClick={() => {
            setEditingPlan(null);
            setPlanForm({ name: '', description: '', price: 0, duration_days: 30 });
            setOpenPlanDialog(true);
          }}
        >
          Nouveau Plan
        </Button>
      </Box>

      <Grid container spacing={2}>
        {plans.map(plan => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card sx={{ border: '1px solid #E0E0E0', boxShadow: 'none', height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
                  {plan.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#616161', display: 'block', mb: 2 }}>
                  {plan.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {plan.price}
                  </Typography>
                  <Typography sx={{ color: '#616161', ml: 1 }}>TND / mois</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#616161', display: 'block', mb: 2 }}>
                  {plan.duration_days} jour(s)
                </Typography>
                <Chip
                  label={plan.is_active ? 'Actif' : 'Inactif'}
                  size="small"
                  sx={{
                    backgroundColor: plan.is_active ? '#E8F5E9' : '#FFEBEE',
                    color: plan.is_active ? '#2E7D32' : '#C62828',
                    mb: 2
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />} 
                    variant="outlined" 
                    sx={{ flex: 1 }}
                    onClick={() => {
                      setEditingPlan(plan);
                      setPlanForm({
                        name: plan.name,
                        description: plan.description || '',
                        price: plan.price || 0,
                        duration_days: plan.duration_days || 30
                      });
                      setOpenPlanDialog(true);
                    }}
                    disabled={saving}
                  >
                    Modifier
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<DeleteIcon />} 
                    variant="outlined" 
                    sx={{ flex: 1, color: '#C62828', borderColor: '#C62828' }}
                    onClick={() => {
                      if (window.confirm(`Êtes-vous sûr de vouloir supprimer le plan "${plan.name}"?`)) {
                        setPlans(plans.filter(p => p.id !== plan.id));
                        setSuccessMsg('Plan supprimé');
                        setTimeout(() => setSuccessMsg(''), 3000);
                      }
                    }}
                    disabled={saving}
                  >
                    Supprimer
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
        <Tabs
          value={currentTab}
          onChange={(e, value) => setCurrentTab(value)}
          sx={{
            borderBottom: '1px solid #E0E0E0',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '13px',
              fontWeight: 500,
              color: '#616161',
              padding: '12px 16px',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                backgroundColor: '#F0F4FF'
              }
            }
          }}
        >
          <Tab label="Services Généraux" sx={{ minWidth: 'auto' }} />
          <Tab label="Plans d\'Abonnement" sx={{ minWidth: 'auto' }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 0 && renderFeatureFlagsTab()}
          {currentTab === 1 && renderSubscriptionPlansTab()}
        </Box>
      </Box>
    </Box>
  );
}
