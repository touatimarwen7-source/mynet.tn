import { useState } from 'react';
import institutionalTheme from '../theme/theme';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Grid,
  Stack,
  Paper,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import AuditIcon from '@mui/icons-material/Receipt';
import HealthIcon from '@mui/icons-material/HealthAndSafety';
import StorageIcon from '@mui/icons-material/Storage';
import LayersIcon from '@mui/icons-material/Layers';
import PeopleIcon from '@mui/icons-material/People';
import EmailIcon from '@mui/icons-material/Email';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function SuperAdminMenu() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const adminFunctions = [
    {
      id: 'pages',
      title: 'Gestion des Pages Statiques',
      description: 'Créer, modifier et supprimer les pages statiques du site',
      icon: FileIcon,
      color: theme.palette.primary.main,
      route: '/super-admin',
      category: 'Contenu',
      features: ['Créer page', 'Modifier page', 'Publier/Brouillon', 'Supprimer page'],
    },
    {
      id: 'files',
      title: 'Gestion des Fichiers',
      description: 'Gérer les images, documents et fichiers du système',
      icon: StorageIcon,
      color: '#1976d2',
      route: '/super-admin',
      category: 'Contenu',
      features: ['Télécharger fichier', 'Voir fichier', 'Supprimer fichier', 'Organiser'],
    },
    {
      id: 'documents',
      title: 'Gestion des Documents',
      description: 'Créer et gérer les documents avec versioning automatique',
      icon: FileIcon,
      color: '#0288d1',
      route: '/super-admin',
      category: 'Contenu',
      features: ['Ajouter document', 'Version tracking', 'Historique', 'Restaurer'],
    },
    {
      id: 'email',
      title: 'Notifications par Email',
      description: 'Gérer et suivre toutes les notifications envoyées par email',
      icon: EmailIcon,
      color: '#f57c00',
      route: '/email-notifications',
      category: 'Communication',
      features: ['Envoyer email', 'Suivre ouvertures', 'Retry emails', 'Templates'],
    },
    {
      id: 'users',
      title: 'Gestion des Utilisateurs',
      description: 'Gérer les utilisateurs, rôles et permissions du système',
      icon: PeopleIcon,
      color: '#2e7d32',
      route: '/user-management',
      category: 'Sécurité',
      features: ['Ajouter utilisateur', 'Assigner rôles', 'Permissions', 'Bloquer'],
    },
    {
      id: 'audit',
      title: 'Audit Logs',
      description: 'Consulter l\'historique complet des activités et modifications',
      icon: AuditIcon,
      color: '#d32f2f',
      route: '/super-admin/audit-logs',
      category: 'Sécurité',
      features: ['Voir activités', 'Filtrer date', 'Exporter logs', 'Rechercher'],
    },
    {
      id: 'health',
      title: 'Surveillance du Système',
      description: 'Monitorer la santé et les performances du système',
      icon: HealthIcon,
      color: '#388e3c',
      route: '/super-admin/health',
      category: 'Système',
      features: ['État serveur', 'Performance CPU', 'Utilisation DB', 'Alertes'],
    },
    {
      id: 'backup',
      title: 'Sauvegarde & Restauration',
      description: 'Créer des sauvegardes et restaurer les données',
      icon: SettingsIcon,
      color: '#7b1fa2',
      route: '/super-admin/archive',
      category: 'Système',
      features: ['Créer sauvegarde', 'Restaurer données', 'Historique', 'Export'],
    },
    {
      id: 'subscriptions',
      title: 'Plans d\'Abonnement',
      description: 'Gérer les tiers et les abonnements utilisateurs',
      icon: CreditCardIcon,
      color: '#f57f17',
      route: '/subscription-plans',
      category: 'Monétisation',
      features: ['Créer plan', 'Modifier tarif', 'Gérer features', 'Voir abonnés'],
    },
    {
      id: 'features',
      title: 'Contrôle des Features',
      description: 'Activer/désactiver les fonctionnalités du système',
      icon: LayersIcon,
      color: '#0097a7',
      route: '/super-admin/features',
      category: 'Configuration',
      features: ['Activer feature', 'Désactiver feature', 'Beta testing', 'Rollout'],
    },
    {
      id: 'settings',
      title: 'Paramètres Système',
      description: 'Configurer les paramètres généraux du système',
      icon: SettingsIcon,
      color: '#455a64',
      route: '/super-admin',
      category: 'Configuration',
      features: ['Email settings', 'API config', 'Rate limiting', 'Timeouts'],
    },
    {
      id: 'analytics',
      title: 'Analytics Globales',
      description: 'Voir les statistiques globales du système',
      icon: DashboardIcon,
      color: '#1565c0',
      route: '/super-admin',
      category: 'Analytics',
      features: ['Utilisateurs actifs', 'Transactions', 'Revenue', 'Tendances'],
    },
  ];

  const filteredFunctions = adminFunctions.filter(func =>
    func.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    func.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    func.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedFunctions = {};
  filteredFunctions.forEach(func => {
    if (!groupedFunctions[func.category]) {
      groupedFunctions[func.category] = [];
    }
    groupedFunctions[func.category].push(func);
  });

  const categories = Object.keys(groupedFunctions).sort();

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '40px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <DashboardIcon sx={{ fontSize: '32px', color: theme.palette.primary.main }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              قائمة وظائف Super Admin
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
            جميع أدوات وظائف إدارة النظام الشاملة • All System Management Functions
          </Typography>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="ابحث عن وظيفة... / Search function..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.primary.main }} />
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: '#fff',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          />
        </Box>

        {/* Categories */}
        {categories.length === 0 ? (
          <Paper sx={{ padding: '40px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
            <Typography sx={{ color: '#999' }}>
              لم يتم العثور على وظائف / No functions found
            </Typography>
          </Paper>
        ) : (
          categories.map((category) => (
            <Box key={category} sx={{ marginBottom: '48px' }}>
              {/* Category Header */}
              <Box sx={{
                padding: '12px 16px',
                backgroundColor: '#e3f2fd',
                borderLeft: '4px solid #0056B3',
                marginBottom: '16px',
                borderRadius: '4px',
              }}>
                <Typography sx={{ fontWeight: 700, color: theme.palette.primary.main, fontSize: '14px' }}>
                  {category}
                </Typography>
              </Box>

              {/* Category Cards Grid */}
              <Grid container spacing={2}>
                {groupedFunctions[category].map((func) => {
                  const IconComponent = func.icon;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={func.id}>
                      <Card
                        sx={{
                          border: '1px solid #e0e0e0',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                            transform: 'translateY(-4px)',
                            borderColor: func.color,
                          }
                        }}
                      >
                        <CardActionArea onClick={() => navigate(func.route)} sx={{ flex: 1 }}>
                          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px' }}>
                            {/* Icon and Title */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                              <Box sx={{
                                padding: '10px',
                                backgroundColor: `${func.color}15`,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '44px',
                                height: '44px',
                              }}>
                                <IconComponent sx={{ color: func.color, fontSize: '22px' }} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '15px' }}>
                                  {func.title}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Description */}
                            <Typography sx={{ fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: '1.5', flex: 1 }}>
                              {func.description}
                            </Typography>

                            {/* Features Chips */}
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                              {func.features.slice(0, 2).map((feature, i) => (
                                <Chip
                                  key={i}
                                  label={feature}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: `${func.color}40`,
                                    color: func.color,
                                    fontSize: '11px',
                                    height: '24px',
                                  }}
                                />
                              ))}
                              {func.features.length > 2 && (
                                <Chip
                                  label={`+${func.features.length - 2}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: '#ccc',
                                    color: '#999',
                                    fontSize: '11px',
                                    height: '24px',
                                  }}
                                />
                              )}
                            </Stack>

                            {/* Action Button */}
                            <Button
                              variant="text"
                              endIcon={<ArrowForwardIcon />}
                              onClick={() => navigate(func.route)}
                              sx={{
                                color: func.color,
                                fontSize: '12px',
                                fontWeight: 600,
                                justifyContent: 'flex-end',
                                textTransform: 'none',
                              }}
                            >
                              الدخول
                            </Button>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ))
        )}

        {/* Summary Stats */}
        {filteredFunctions.length > 0 && (
          <Grid container spacing={2} sx={{ marginTop: '48px' }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center' }}>
                <CardContent>
                  <Typography sx={{ fontSize: '32px', fontWeight: 700, color: theme.palette.primary.main }}>
                    {adminFunctions.length}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    إجمالي الوظائف
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center' }}>
                <CardContent>
                  <Typography sx={{ fontSize: '32px', fontWeight: 700, color: '#2e7d32' }}>
                    {categories.length}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    فئات محنظمة
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center' }}>
                <CardContent>
                  <Typography sx={{ fontSize: '32px', fontWeight: 700, color: '#f57c00' }}>
                    ✓
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    مجهزة للإنتاج
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}
