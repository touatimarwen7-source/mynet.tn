/**
 * Admin Portal - Interface d'administration avancée officielle
 * Plateforme de gestion professionnelle mondiale aux spécifications de haute qualité
 * @component
 */

import { useState, useEffect, useMemo } from 'react';
import institutionalTheme from '../../theme/theme';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stack,
  Chip,
  Alert,
  Tabs,
  Tab,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Skeleton,
  CircularProgress,
  Rating,
  Badge,
} from '@mui/material';
import {
  Dashboard,
  People,
  Settings,
  Assessment,
  Security,
  Storage,
  Edit,
  Delete,
  Block,
  Check,
  Download,
  Upload,
  Refresh,
  Add,
  Close,
  TrendingUp,
  Visibility,
  Lock,
  BarChart,
  Warning,
  CheckCircle,
  Info,
  Email,
  Phone,
  MapPin,
  Calendar,
  Percent,
} from '@mui/icons-material';
import EnhancedErrorBoundary from '../../components/EnhancedErrorBoundary';

const THEME = institutionalTheme;

// ============ Composant de carte de statistiques avancées ============
function AdvancedStatCard({ title, value, change, icon: Icon, color, trend, loading }) {
  return (
    <Card
      sx={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': { borderColor: color, boxShadow: `0 4px 12px ${color}15` },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="start">
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, mb: 1 }}>
                {title}
              </Typography>
              {loading ? (
                <Skeleton width={80} height={32} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700, color, mb: 1 }}>
                  {value}
                </Typography>
              )}
            </Box>
            <Avatar
              sx={{
                backgroundColor: `${color}15`,
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon sx={{ color, fontSize: 24 }} />
            </Avatar>
          </Stack>
          {change && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <TrendingUp
                sx={{
                  fontSize: 14,
                  color: change > 0 ? THEME.palette.success.main : THEME.palette.error.main,
                  transform: change < 0 ? 'scaleY(-1)' : 'none',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: change > 0 ? THEME.palette.success.main : THEME.palette.error.main,
                  fontWeight: 600,
                }}
              >
                {Math.abs(change)}% {change > 0 ? 'Croissance' : 'Baisse'} de la période précédente
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============ Tableau de bord avancé ============
function AdvancedDashboard() {
  const [loading] = useState(false);

  const stats = [
    {
      label: 'Utilisateurs actifs totaux',
      value: '3,847',
      change: 18,
      icon: People,
      color: '#0056B3',
    },
    { label: 'Délai imparti', value: '245', change: 24, icon: Assessment, color: '#2e7d32' },
    { label: 'Offres évaluées', value: '892', change: -3, icon: TrendingUp, color: '#f57c00' },
    {
      label: 'Revenus totaux',
      value: '12.5M TND',
      change: 35,
      icon: TrendingUp,
      color: '#7b1fa2',
    },
  ];

  const topUsers = [
    { rank: 1, name: 'Société de succès commercial', role: 'buyer', score: 98, status: 'actif' },
    { rank: 2, name: 'Fatma Fourniture et Commerce', role: 'supplier', score: 95, status: 'actif' },
    { rank: 3, name: 'Ahmed Mohamed Import', role: 'buyer', score: 92, status: 'actif' },
  ];

  return (
    <Grid xs={12} spacing={3} container>
      {/* Statistiques principales */}
      {stats.map((stat, idx) => (
        <Grid xs={12} lg={3} key={idx}>
          <AdvancedStatCard {...stat} loading={loading} />
        </Grid>
      ))}

      {/* Performance du système */}
      <Grid xs={12} md={8}>
        <Card
          sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '12px' }}
        >
          <CardHeader title="Performance du système et des serveurs" action={<Refresh fontSize="small" />} />
          <CardContent>
            <Stack spacing={3}>
              {[
                { label: 'Disponibilité du serveur principal', value: 99.95, status: 'Excellent' },
                { label: 'Vitesse de réponse de l\'API', value: 87, status: 'Très rapide' },
                { label: 'Espace de la base de données', value: 68, status: 'Bon' },
                { label: 'Utilisation de la mémoire', value: 52, status: 'Équilibré' },
              ].map((metric, idx) => (
                <Box key={idx}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {metric.label}
                      </Typography>
                      <Chip label={metric.status} size="small" variant="outlined" />
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: THEME.palette.primary.main }}
                    >
                      {metric.value}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={metric.value}
                    sx={{
                      height: 8,
                      borderRadius: '4px',
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: '4px',
                        backgroundColor:
                          metric.value > 80 ? '#2e7d32' : metric.value > 50 ? '#f57c00' : '#d32f2f',
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Alertes et notifications */}
      <Grid xs={12} md={4}>
        <Card
          sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '12px' }}
        >
          <CardHeader title="Alertes intelligentes" />
          <CardContent>
            <Stack spacing={2}>
              {[
                {
                  icon: Warning,
                  color: '#f57c00',
                  title: 'Alerte de performance',
                  desc: 'Augmentation de 45% des requêtes API',
                },
                {
                  icon: Info,
                  color: '#0288d1',
                  title: 'Info système',
                  desc: 'Sauvegarde réussie',
                },
                {
                  icon: CheckCircle,
                  color: '#2e7d32',
                  title: 'Action terminée',
                  desc: 'Maintenance système terminée',
                },
              ].map((alert, idx) => (
                <Stack
                  key={idx}
                  direction="row"
                  spacing={1.5}
                  sx={{
                    p: 1.5,
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                >
                  <alert.icon sx={{ color: alert.color, mt: 0.5 }} />
                  <Stack flex={1}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {alert.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {alert.desc}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Meilleurs utilisateurs */}
      <Grid xs={12}>
        <Card
          sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '12px' }}
        >
          <CardHeader title="Meilleurs utilisateurs actifs" />
          <CardContent>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Rang</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Nom de l\'entreprise</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Rôle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topUsers.map((user) => (
                    <TableRow key={user.rank} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell>
                        <Badge
                          badgeContent={user.rank}
                          color="primary"
                          overlap="circular"
                          sx={{
                            '& .MuiBadge-badge': {
                              backgroundColor: THEME.palette.primary.main,
                              color: 'white',
                              fontWeight: 700,
                            },
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: `${THEME.palette.primary.main}20`,
                            }}
                          >
                            {user.name[0]}
                          </Avatar>
                        </Badge>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role === 'buyer' ? 'Acheteur' : 'Fournisseur'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Rating value={user.score / 20} readOnly size="small" precision={0.5} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {user.score}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          color="success"
                          icon={<CheckCircle />}
                          variant="filled"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// ============ Gestion avancée des utilisateurs ============
function AdvancedUserManagement() {
  const [users] = useState([
    {
      id: 1,
      email: 'buyer@mynet.tn',
      name: 'Ahmed l\'Acheteur',
      role: 'buyer',
      status: 'actif',
      joinDate: '2025-01-15',
      activities: 145,
    },
    {
      id: 2,
      email: 'supplier@tech.tn',
      name: 'Fatma la Fournisseuse',
      role: 'supplier',
      status: 'actif',
      joinDate: '2025-01-10',
      activities: 238,
    },
    {
      id: 3,
      email: 'assistant@mynet.tn',
      name: 'Mohamed l\'Assistant',
      role: 'admin_assistant',
      status: 'actif',
      joinDate: '2025-01-05',
      activities: 89,
    },
  ]);
  const [searchText, setSearchText] = useState('');

  const filtered = useMemo(() => {
    return users.filter(
      (u) => searchText === '' || u.email.includes(searchText) || u.name.includes(searchText)
    );
  }, [searchText]);

  return (
    <Grid xs={12} spacing={3} container>
      <Grid xs={12}>
        <Card
          sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '12px' }}
        >
          <CardHeader
            title="Gestion avancée des utilisateurs"
            action={
              <Button startIcon={<Add />} variant="contained" size="small">
                Nouvel utilisateur
              </Button>
            }
          />
          <CardContent>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <TextField
                placeholder="Rechercher par email ou nom..."
                size="small"
                fullWidth
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ backgroundColor: '#f9f9f9' }}
              />
            </Stack>

            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Rôle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Activité</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((user) => (
                    <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 32, height: 32 }}>{user.name[0]}</Avatar>
                          <Typography variant="body2">{user.email}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            user.role === 'buyer'
                              ? 'Acheteur'
                              : user.role === 'supplier'
                                ? 'Fournisseur'
                                : 'Assistant Admin'
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <TrendingUp sx={{ fontSize: 16, color: THEME.palette.primary.main }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.activities}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={user.status} size="small" color="success" variant="filled" />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Modifier">
                            <IconButton size="small">
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton size="small" color="error">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// ============ Rapports avancés ============
function AdvancedReports() {
  const reports = [
    { name: 'Rapport de performance complet', date: '2025-01-26', size: '4.2 MB', type: 'PDF', downloads: 24 },
    {
      name: 'Analyse des utilisateurs et de l\'activité',
      date: '2025-01-25',
      size: '2.8 MB',
      type: 'Excel',
      downloads: 18,
    },
    {
      name: 'État des revenus et des ventes',
      date: '2025-01-24',
      size: '5.1 MB',
      type: 'PDF',
      downloads: 31,
    },
  ];

  return (
    <Grid xs={12} spacing={3} container>
      <Grid xs={12}>
        <Card
          sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '12px' }}
        >
          <CardHeader title="Rapports avancés" />
          <CardContent>
            <Stack spacing={2}>
              {reports.map((report, idx) => (
                <Stack
                  key={idx}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 2,
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      borderColor: THEME.palette.primary.main,
                    },
                  }}
                >
                  <Stack flex={1}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {report.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip label={report.type} size="small" variant="outlined" />
                      <Chip label={report.date} size="small" variant="outlined" />
                      <Typography variant="caption" color="textSecondary">
                        {report.size}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="caption" color="textSecondary">
                      {report.downloads} téléchargements
                    </Typography>
                    <Button size="small" startIcon={<Download />} variant="contained">
                      Télécharger
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// ============ Paramètres et sécurité ============
function AdvancedSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
    twoFactorRequired: false,
  });

  return (
    <Grid xs={12} spacing={3} container>
      <Grid xs={12} lg={6}>
        <Card
          sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '12px' }}
        >
          <CardHeader title="Paramètres système" />
          <CardContent>
            <Stack spacing={2}>
              {[
                { label: 'Mode maintenance', key: 'maintenanceMode' },
                { label: 'Notifications par email', key: 'emailNotifications' },
                { label: 'Sauvegarde automatique', key: 'autoBackup' },
                { label: 'Authentification à deux facteurs obligatoire', key: 'twoFactorRequired' },
              ].map((item) => (
                <FormControlLabel
                  key={item.key}
                  control={
                    <Switch
                      checked={settings[item.key]}
                      onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                    />
                  }
                  label={item.label}
                />
              ))}
              <Button variant="contained">Sauvegarder les paramètres</Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12} lg={6}>
        <Card
          sx={{ backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '12px' }}
        >
          <CardHeader title="Sécurité avancée" />
          <CardContent>
            <Stack spacing={2}>
              <Alert severity="success" sx={{ borderRadius: '8px' }}>
                ✓ Cryptage : AES-256 actif
              </Alert>
              <Alert severity="success" sx={{ borderRadius: '8px' }}>
                ✓ Certificats : SSL/TLS valides
              </Alert>
              <Alert severity="success" sx={{ borderRadius: '8px' }}>
                ✓ Sauvegarde : Dernière sauvegarde il y a une heure
              </Alert>
              <Button variant="outlined" fullWidth startIcon={<Lock />}>
                Gérer les clés de sécurité
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// ============ Composant principal ============
function AdminPortalContent() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9F9F9', paddingY: 4 }}>
      <Container maxWidth="xl">
        {/* En-tête professionnel */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #0056B3 0%, #003d82 100%)',
            borderRadius: '12px',
            padding: '32px 24px',
            marginBottom: '24px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Dashboard sx={{ fontSize: 40 }} />
            <Stack>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                Plateforme d'administration officielle professionnelle
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Centre de contrôle centralisé complet avec spécifications professionnelles mondiales
              </Typography>
            </Stack>
          </Stack>
          <Button
            variant="contained"
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            startIcon={<Refresh />}
          >
            Mise à jour instantanée
          </Button>
        </Paper>

        {/* Alertes */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Alert severity="success" sx={{ borderRadius: '8px' }} icon={<CheckCircle />}>
            ✓ Tous les systèmes fonctionnent de manière optimale • Dernière synchronisation : maintenant • Sécurité : entièrement protégée
          </Alert>
        </Stack>

        {/* Onglets */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            sx={{
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '14px' },
              '& .Mui-selected': { color: THEME.palette.primary.main, fontWeight: 700 },
            }}
          >
            <Tab label="📊 Tableau de bord avancé" />
            <Tab label="👥 Gestion des utilisateurs" />
            <Tab label="📈 Rapports et analyses" />
            <Tab label="⚙️ Paramètres et sécurité" />
          </Tabs>

          <Box sx={{ padding: '24px' }}>
            {tab === 0 && <AdvancedDashboard />}
            {tab === 1 && <AdvancedUserManagement />}
            {tab === 2 && <AdvancedReports />}
            {tab === 3 && <AdvancedSettings />}
          </Box>
        </Paper>

        {/* Pied de page professionnel */}
        <Stack sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', color: 'textSecondary', fontWeight: 500 }}
          >
            MyNet.tn © 2025 • Plateforme B2B professionnelle • Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
          </Typography>
          <Typography variant="caption" sx={{ textAlign: 'center', color: 'textSecondary', mt: 1 }}>
            🔒 Toutes les données sont protégées par le cryptage AES-256 • 🛡️ La sécurité est une priorité
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export default function AdminPortal() {
  return (
    <EnhancedErrorBoundary>
      <AdminPortalContent />
    </EnhancedErrorBoundary>
  );
}