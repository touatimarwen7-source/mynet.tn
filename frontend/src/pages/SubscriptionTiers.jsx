import { useState } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export default function SubscriptionTiers() {
  const [tiers, setTiers] = useState([
    {
      id: 1,
      name: 'Gratuit',
      price: '0 TND',
      description: 'Pour commencer',
      features: ['5 appels d\'offres', 'Support email', 'Accès basique'],
      subscriberCount: 1250,
      active: true,
    },
    {
      id: 2,
      name: 'Professionnel',
      price: '99 TND/mois',
      description: 'Pour les petites entreprises',
      features: ['Appels d\'offres illimités', 'Support prioritaire', 'Analytics avancées', 'API accès'],
      subscriberCount: 340,
      active: true,
    },
    {
      id: 3,
      name: 'Entreprise',
      price: '499 TND/mois',
      description: 'Pour les grandes organisations',
      features: ['Appels d\'offres illimités', 'Support 24/7', 'Analytics avancées', 'API accès', 'Intégrations personnalisées'],
      subscriberCount: 45,
      active: true,
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedTier, setSelectedTier] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  const handleAddTier = () => {
    setSelectedTier(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      features: [],
      subscriberCount: 0,
      active: true,
    });
    setDialogType('add');
    setOpenDialog(true);
  };

  const handleEditTier = (tier) => {
    setSelectedTier(tier);
    setFormData({ ...tier });
    setDialogType('edit');
    setOpenDialog(true);
  };

  const handleDeleteTier = (tier) => {
    setTiers(tiers.filter(t => t.id !== tier.id));
    setMessage(`Plan ${tier.name} supprimé`);
  };

  const handleSaveTier = () => {
    if (!formData.name || !formData.price || !formData.description) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    if (dialogType === 'edit') {
      setTiers(tiers.map(t =>
        t.id === selectedTier.id ? { ...formData, id: selectedTier.id } : t
      ));
      setMessage(`Plan ${formData.name} mis à jour`);
    } else {
      const newTier = {
        id: Math.max(...tiers.map(t => t.id), 0) + 1,
        ...formData,
        subscriberCount: 0,
      };
      setTiers([...tiers, newTier]);
      setMessage(`Plan ${formData.name} créé`);
    }
    setOpenDialog(false);
  };

  const toggleTierStatus = (tier) => {
    setTiers(tiers.map(t =>
      t.id === tier.id ? { ...t, active: !t.active } : t
    ));
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#212121', marginBottom: '12px' }}>
            Plans d'Abonnement - Subscription Tiers
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            Gérer les plans d'abonnement et les tiers de tarification
          </Typography>

          {message && (
            <Alert severity="success" sx={{ marginBottom: '16px' }}>
              {message}
            </Alert>
          )}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTier}
            sx={{ backgroundColor: '#0056B3' }}
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
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0056B3' }}>
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
                Plans actifs
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#4caf50' }}>
                {tiers.filter(t => t.active).length}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Tiers Grid */}
        <Grid container spacing={3}>
          {tiers.map((tier) => (
            <Grid item xs={12} sm={6} md={4} key={tier.id}>
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
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#212121' }}>
                        {tier.name}
                      </Typography>
                      {!tier.active && (
                        <Chip label="Inactif" size="small" variant="outlined" color="error" />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                      {tier.description}
                    </Typography>
                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0056B3', marginBottom: '8px' }}>
                      {tier.price}
                    </Typography>
                  </Box>

                  {/* Features */}
                  <Box sx={{ marginBottom: '16px', flex: 1 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121', marginBottom: '8px' }}>
                      Fonctionnalités:
                    </Typography>
                    <List sx={{ padding: 0 }}>
                      {tier.features.map((feature, idx) => (
                        <ListItem key={idx} sx={{ padding: '4px 0' }}>
                          <ListItemIcon sx={{ minWidth: '24px' }}>
                            <CheckIcon sx={{ fontSize: '18px', color: '#4caf50' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{ fontSize: '12px' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Subscribers */}
                  <Box sx={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                      Abonnés: <strong>{tier.subscriberCount}</strong>
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Stack direction="row" spacing={1} sx={{ marginTop: 'auto' }}>
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
                      fullWidth
                    >
                      {tier.active ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteTier(tier)}
                      color="error"
                      fullWidth
                    >
                      Supprimer
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Edit/Add Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogType === 'edit' ? 'Modifier Plan' : 'Créer Plan'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ paddingY: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField
                fullWidth
                label="Nom du Plan"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Prix"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="ex: 99 TND/mois"
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Fonctionnalités (une par ligne)"
                value={formData.features?.join('\n') || ''}
                onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n').filter(f => f.trim()) })}
                multiline
                rows={4}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button
              onClick={handleSaveTier}
              variant="contained"
              sx={{ backgroundColor: '#0056B3' }}
            >
              {dialogType === 'edit' ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
