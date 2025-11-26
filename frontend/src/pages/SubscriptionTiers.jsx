import { useState } from 'react';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';

function TabPanel({ children, value, index }) {
  const theme = institutionalTheme;
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ paddingTop: '24px' }}>{children}</Box>}
    </div>
  );
}

export default function SubscriptionTiers() {
  const theme = institutionalTheme;
  const [tabValue, setTabValue] = useState(0);

  const [tiers, setTiers] = useState([
    {
      id: 1,
      name: 'Gratuit',
      price: '0 TND',
      description: 'Pour commencer',
      subscriberCount: 1250,
      active: true,
      services: [1, 2], // IDs of included services
    },
    {
      id: 2,
      name: 'Professionnel',
      price: '99 TND/mois',
      description: 'Pour les petites entreprises',
      subscriberCount: 340,
      active: true,
      services: [1, 2, 3, 4, 5],
    },
    {
      id: 3,
      name: 'Entreprise',
      price: '499 TND/mois',
      description: 'Pour les grandes organisations',
      subscriberCount: 45,
      active: true,
      services: [1, 2, 3, 4, 5, 6, 7],
    },
  ]);

  const [services, setServices] = useState([
    { id: 1, name: 'Appels d\'offres généraux', description: 'Créer et gérer les appels d\'offres', enabled: true },
    { id: 2, name: 'Offres directes', description: 'Requêtes d\'approvisionnement direct', enabled: true },
    { id: 3, name: 'Analytics basiques', description: 'Rapports simples', enabled: true },
    { id: 4, name: 'Analytics avancées', description: 'Rapports détaillés et insights', enabled: true },
    { id: 5, name: 'Accès API', description: 'Intégrations externes', enabled: true },
    { id: 6, name: 'Support prioritaire', description: 'Support 24/7 dédié', enabled: true },
    { id: 7, name: 'Intégrations personnalisées', description: 'Configurations sur mesure', enabled: true },
  ]);

  // Dialog states
  const [openTierDialog, setOpenTierDialog] = useState(false);
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [tierDialogType, setTierDialogType] = useState('');
  const [selectedTier, setSelectedTier] = useState(null);
  const [tierFormData, setTierFormData] = useState({});
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceFormData, setServiceFormData] = useState({});
  const [message, setMessage] = useState('');

  // TIER OPERATIONS
  const handleAddTier = () => {
    setSelectedTier(null);
    setTierFormData({ name: '', price: '', description: '', active: true, services: [] });
    setSelectedServices([]);
    setTierDialogType('add');
    setOpenTierDialog(true);
  };

  const handleEditTier = (tier) => {
    setSelectedTier(tier);
    setTierFormData({ ...tier });
    setSelectedServices(tier.services || []);
    setTierDialogType('edit');
    setOpenTierDialog(true);
  };

  const handleSaveTier = () => {
    if (!tierFormData.name || !tierFormData.price || !tierFormData.description) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    if (tierDialogType === 'edit') {
      setTiers(tiers.map(t =>
        t.id === selectedTier.id ? { ...tierFormData, id: selectedTier.id, services: selectedServices } : t
      ));
      setMessage(`Plan ${tierFormData.name} mis à jour avec les services`);
    } else {
      const newTier = {
        id: Math.max(...tiers.map(t => t.id), 0) + 1,
        ...tierFormData,
        subscriberCount: 0,
        services: selectedServices,
      };
      setTiers([...tiers, newTier]);
      setMessage(`Plan ${tierFormData.name} créé avec ${selectedServices.length} services`);
    }
    setOpenTierDialog(false);
  };

  const handleDeleteTier = (tier) => {
    setTiers(tiers.filter(t => t.id !== tier.id));
    setMessage(`Plan ${tier.name} supprimé`);
  };

  const toggleTierStatus = (tier) => {
    setTiers(tiers.map(t =>
      t.id === tier.id ? { ...t, active: !t.active } : t
    ));
  };

  const toggleServiceForTier = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // SERVICE OPERATIONS
  const handleAddService = () => {
    setServiceFormData({ name: '', description: '', enabled: true });
    setOpenServiceDialog(true);
  };

  const handleSaveService = () => {
    if (!serviceFormData.name || !serviceFormData.description) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    const newService = {
      id: Math.max(...services.map(s => s.id), 0) + 1,
      ...serviceFormData,
    };
    setServices([...services, newService]);
    setOpenServiceDialog(false);
    setMessage(`Service ${serviceFormData.name} créé`);
  };

  const handleDeleteService = (service) => {
    setServices(services.filter(s => s.id !== service.id));
    // Remove from all tiers
    setTiers(tiers.map(t => ({
      ...t,
      services: t.services.filter(sId => sId !== service.id)
    })));
    setMessage(`Service ${service.name} supprimé`);
  };

  const toggleServiceStatus = (service) => {
    setServices(services.map(s =>
      s.id === service.id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  // Helper to get service name by ID
  const getServiceName = (serviceId) => {
    return services.find(s => s.id === serviceId)?.name || 'Service Unknown';
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary, marginBottom: '12px' }}>
            Gestion des Plans et Services - Subscription Plans & Services
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            Gérer les plans d'abonnement, les services, et les configurations tarifaires
          </Typography>

          {message && (
            <Alert severity="success" sx={{ marginBottom: '16px' }}>
              {message}
            </Alert>
          )}
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: '1px solid #e0e0e0', marginBottom: '32px' }}>
          <Tabs value={tabValue} onChange={(e, value) => setTabValue(value)}>
            <Tab label="📦 Plans d'Abonnement" />
            <Tab label="⚙️ Services Disponibles" />
            <Tab label="📊 Vue d'Ensemble" />
          </Tabs>
        </Box>

        {/* TAB 1: SUBSCRIPTION PLANS */}
        <TabPanel value={tabValue} index={0}>
          {/* Add Plan Button */}
          <Box sx={{ marginBottom: '24px' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTier}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Créer un Plan
            </Button>
          </Box>

          {/* Stats */}
          <Stack direction="row" spacing={2} sx={{ marginBottom: '32px' }}>
            <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
              <CardContent>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  Total des plans
                </Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: theme.palette.primary.main }}>
                  {tiers.length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
              <CardContent>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  Total des abonnés
                </Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#2e7d32' }}>
                  {tiers.reduce((total, t) => total + t.subscriberCount, 0)}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
              <CardContent>
                <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  Services disponibles
                </Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#f57c00' }}>
                  {services.filter(s => s.enabled).length}/{services.length}
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          {/* Plans Grid */}
          <Grid container spacing={3}>
            {tiers.map((tier) => {
              const tierServices = tier.services.map(id => services.find(s => s.id === id)).filter(Boolean);
              return (
                <Grid xs={12} sm={6} md={4} key={tier.id}>
                  <Card
                    sx={{
                      border: '1px solid #e0e0e0',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: tier.active ? 1 : 0.6,
                      '&:hover': {
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        transform: 'translateY(-4px)',
                        transition: 'all 0.3s ease',
                      }
                    }}
                  >
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Header */}
                      <Box sx={{ marginBottom: '16px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                            {tier.name}
                          </Typography>
                          {!tier.active && (
                            <Chip label="Inactif" size="small" variant="outlined" color="error" />
                          )}
                        </Box>
                        <Typography sx={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                          {tier.description}
                        </Typography>
                        <Typography sx={{ fontSize: '24px', fontWeight: 700, color: theme.palette.primary.main, marginBottom: '8px' }}>
                          {tier.price}
                        </Typography>
                      </Box>

                      {/* Services */}
                      <Box sx={{ marginBottom: '16px', flex: 1 }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '8px' }}>
                          Services ({tier.services.length}):
                        </Typography>
                        <Stack direction="column" spacing={1}>
                          {tierServices.map(service => (
                            <Box
                              key={service.id}
                              sx={{
                                padding: '8px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <CheckIcon sx={{ fontSize: '16px', color: '#4caf50' }} />
                              <Typography sx={{ fontSize: '12px' }}>
                                {service.name}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>

                      {/* Subscribers */}
                      <Box sx={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <Typography sx={{ fontSize: '12px', color: '#666' }}>
                          Abonnés: <strong>{tier.subscriberCount}</strong>
                        </Typography>
                      </Box>

                      {/* Actions */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditTier(tier)}
                          fullWidth
                        >
                          Modifier
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => toggleTierStatus(tier)}
                          color={tier.active ? 'error' : 'success'}
                        >
                          {tier.active ? 'Désactiver' : 'Activer'}
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTier(tier)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </TabPanel>

        {/* TAB 2: SERVICES MANAGEMENT */}
        <TabPanel value={tabValue} index={1}>
          {/* Add Service Button */}
          <Box sx={{ marginBottom: '24px' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddService}
              sx={{ backgroundColor: '#4caf50' }}
            >
              Ajouter un Service
            </Button>
          </Box>

          {/* Services Table */}
          <Paper sx={{ border: '1px solid #e0e0e0', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Nom du Service</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Utilisé dans</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service) => {
                  const usedInTiers = tiers.filter(t => t.services.includes(service.id));
                  return (
                    <TableRow key={service.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{service.name}</TableCell>
                      <TableCell sx={{ fontSize: '13px', color: '#666' }}>{service.description}</TableCell>
                      <TableCell>
                        {usedInTiers.length > 0 ? (
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: '4px' }}>
                            {usedInTiers.map(t => (
                              <Chip
                                key={t.id}
                                label={t.name}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}
                              />
                            ))}
                          </Stack>
                        ) : (
                          <Typography sx={{ fontSize: '12px', color: '#999' }}>Non utilisé</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={service.enabled ? 'Actif' : 'Inactif'}
                          size="small"
                          color={service.enabled ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => toggleServiceStatus(service)}
                            color={service.enabled ? 'error' : 'success'}
                          >
                            {service.enabled ? 'Désactiver' : 'Activer'}
                          </Button>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteService(service)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </TabPanel>

        {/* TAB 3: OVERVIEW */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Plans Summary */}
            <Grid xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: '16px', color: theme.palette.text.primary }}>
                📦 Résumé des Plans
              </Typography>
              <Paper sx={{ border: '1px solid #e0e0e0', overflow: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Prix</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Services</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Abonnés</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tiers.map(tier => (
                      <TableRow key={tier.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{tier.name}</TableCell>
                        <TableCell>{tier.price}</TableCell>
                        <TableCell>{tier.services.length} services</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>{tier.subscriberCount}</TableCell>
                        <TableCell>
                          <Chip
                            label={tier.active ? 'Actif' : 'Inactif'}
                            size="small"
                            color={tier.active ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>

            {/* Services Summary */}
            <Grid xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: '16px', color: theme.palette.text.primary }}>
                ⚙️ Résumé des Services
              </Typography>
              <Paper sx={{ border: '1px solid #e0e0e0', overflow: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Disponible dans</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map(service => {
                      const tierCount = tiers.filter(t => t.services.includes(service.id)).length;
                      return (
                        <TableRow key={service.id}>
                          <TableCell sx={{ fontWeight: 600 }}>{service.name}</TableCell>
                          <TableCell>{tierCount} plan(s)</TableCell>
                          <TableCell>
                            <Chip
                              label={service.enabled ? 'Actif' : 'Inactif'}
                              size="small"
                              color={service.enabled ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TIER DIALOG */}
        <Dialog open={openTierDialog} onClose={() => setOpenTierDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {tierDialogType === 'edit' ? 'Modifier Plan' : 'Créer un Plan'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ paddingY: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField
                fullWidth
                label="Nom du Plan"
                value={tierFormData.name || ''}
                onChange={(e) => setTierFormData({ ...tierFormData, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Prix"
                value={tierFormData.price || ''}
                onChange={(e) => setTierFormData({ ...tierFormData, price: e.target.value })}
                placeholder="ex: 99 TND/mois"
              />
              <TextField
                fullWidth
                label="Description"
                value={tierFormData.description || ''}
                onChange={(e) => setTierFormData({ ...tierFormData, description: e.target.value })}
                multiline
                rows={2}
              />

              {/* Services Selection */}
              <Box>
                <Typography sx={{ fontWeight: 600, marginBottom: '12px', color: theme.palette.text.primary }}>
                  Sélectionner les services inclus:
                </Typography>
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '12px', maxHeight: '250px', overflow: 'auto' }}>
                  {services.map(service => (
                    <FormControlLabel
                      key={service.id}
                      control={
                        <Checkbox
                          checked={selectedServices.includes(service.id)}
                          onChange={() => toggleServiceForTier(service.id)}
                          disabled={!service.enabled}
                        />
                      }
                      label={
                        <Box>
                          <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                            {service.name}
                          </Typography>
                          <Typography sx={{ fontSize: '12px', color: '#666' }}>
                            {service.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ marginBottom: '8px', width: '100%' }}
                    />
                  ))}
                </Box>
                <Typography sx={{ fontSize: '12px', color: theme.palette.primary.main, marginTop: '12px', fontWeight: 600 }}>
                  {selectedServices.length} service(s) sélectionné(s)
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTierDialog(false)}>Annuler</Button>
            <Button
              onClick={handleSaveTier}
              variant="contained"
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              {tierDialogType === 'edit' ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* SERVICE DIALOG */}
        <Dialog open={openServiceDialog} onClose={() => setOpenServiceDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Ajouter un Service</DialogTitle>
          <DialogContent>
            <Box sx={{ paddingY: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField
                fullWidth
                label="Nom du Service"
                value={serviceFormData.name || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Description"
                value={serviceFormData.description || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenServiceDialog(false)}>Annuler</Button>
            <Button
              onClick={handleSaveService}
              variant="contained"
              sx={{ backgroundColor: '#4caf50' }}
            >
              Créer Service
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
