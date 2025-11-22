import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  LinearProgress,
  Chip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import ErrorIcon from '@mui/icons-material/Error';
import { setPageTitle } from '../utils/pageTitle';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 1254,
    activeSessions: 89,
    systemHealth: 99.8,
    pendingAudits: 12
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle('Tableau de Contrôle Admin');
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setStats({
        totalUsers: 1254,
        activeSessions: 89,
        systemHealth: 99.8,
        pendingAudits: 12
      });
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#1565c0' }} />
      </Box>
    );
  }

  const StatCard = ({ label, value, subtitle, icon, progress, status }) => (
    <Card sx={{ border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ padding: '24px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <Box sx={{ fontSize: '40px' }}>{icon}</Box>
          <Typography sx={{ fontSize: '28px', fontWeight: 600, color: status === 'warning' ? '#f57c00' : '#1565c0' }}>
            {value}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#212121' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '12px', color: '#616161', marginTop: '4px' }}>
          {subtitle}
        </Typography>
        {progress !== undefined && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              marginTop: '12px',
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: status === 'warning' ? '#f57c00' : '#2e7d32',
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: '#212121', marginBottom: '8px' }}>
            Tableau de Contrôle Admin
          </Typography>
          <Typography sx={{ color: '#616161' }}>
            Gestion de la plateforme et des utilisateurs
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ marginBottom: '32px' }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<PeopleIcon sx={{ fontSize: 40, color: '#1565c0' }} />}
              label="Utilisateurs Totaux"
              value={stats.totalUsers}
              subtitle="Enregistrés"
              status="active"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<StorageIcon sx={{ fontSize: 40, color: '#1565c0' }} />}
              label="Sessions Actives"
              value={stats.activeSessions}
              subtitle="Connectés maintenant"
              status="active"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<SecurityIcon sx={{ fontSize: 40, color: '#2e7d32' }} />}
              label="Santé Système"
              value={`${stats.systemHealth}%`}
              subtitle="État opérationnel"
              progress={Math.round(stats.systemHealth)}
              status={stats.systemHealth >= 99 ? 'active' : 'warning'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<ErrorIcon sx={{ fontSize: 40, color: stats.pendingAudits > 0 ? '#f57c00' : '#2e7d32' }} />}
              label="Audits en Attente"
              value={stats.pendingAudits}
              subtitle="À traiter"
              status={stats.pendingAudits > 0 ? 'warning' : 'active'}
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ marginBottom: '32px', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '16px' }}>
              Actions Rapides
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  href="/admin/users"
                  sx={{
                    color: '#1565c0',
                    borderColor: '#1565c0',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                  }}
                >
                  Gestion Utilisateurs
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  href="/admin/audit-logs"
                  sx={{
                    color: '#1565c0',
                    borderColor: '#1565c0',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                  }}
                >
                  Journaux d'Audit
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  href="/admin/tenders"
                  sx={{
                    color: '#1565c0',
                    borderColor: '#1565c0',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                  }}
                >
                  Appels d'Offres
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  href="/admin/settings"
                  sx={{
                    color: '#1565c0',
                    borderColor: '#1565c0',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                  }}
                >
                  Configuration
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: 0 }}>
            <Box sx={{ padding: '24px', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121' }}>
                Activités Récentes
              </Typography>
            </Box>
            <Paper sx={{ border: 'none', borderRadius: 0, overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow sx={{ height: '56px' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1565c0', textTransform: 'uppercase', fontSize: '12px' }}>
                      Utilisateur
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1565c0', textTransform: 'uppercase', fontSize: '12px' }}>
                      Action
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1565c0', textTransform: 'uppercase', fontSize: '12px' }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1565c0', textTransform: 'uppercase', fontSize: '12px' }}>
                      Statut
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { user: 'Ahmed Ben Ali', action: 'Créé un appel d\'offres', date: 'Il y a 2 heures', status: 'success' },
                    { user: 'Fatima Khaled', action: 'Soumis une offre', date: 'Il y a 4 heures', status: 'success' },
                    { user: 'Mohamed Salah', action: 'Modifié son profil', date: 'Il y a 1 jour', status: 'info' },
                    { user: 'Leila Hassan', action: 'Nouveau compte créé', date: 'Il y a 2 jours', status: 'success' },
                    { user: 'Admin', action: 'Audit configuré', date: 'Il y a 3 jours', status: 'warning' },
                  ].map((activity, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        height: '56px',
                        borderBottom: '1px solid #e0e0e0',
                        '&:hover': { backgroundColor: '#fafafa' },
                      }}
                    >
                      <TableCell sx={{ color: '#212121', fontSize: '14px', fontWeight: 500 }}>
                        {activity.user}
                      </TableCell>
                      <TableCell sx={{ color: '#616161', fontSize: '14px' }}>
                        {activity.action}
                      </TableCell>
                      <TableCell sx={{ color: '#616161', fontSize: '12px' }}>
                        {activity.date}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={activity.status === 'success' ? 'Succès' : activity.status === 'warning' ? 'Alerte' : 'Info'}
                          sx={{
                            backgroundColor: activity.status === 'success' ? '#e8f5e9' : activity.status === 'warning' ? '#fff3e0' : '#e3f2fd',
                            color: activity.status === 'success' ? '#1b5e20' : activity.status === 'warning' ? '#e65100' : '#0d47a1',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
