import { useState } from 'react';
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Chip,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([
    {
      id: 1,
      timestamp: '2025-01-20 14:30:45',
      user: 'admin@mynet.tn',
      action: 'Créer',
      entity: 'Page Statique',
      details: 'Création de la page "Services"',
      ipAddress: '192.168.1.100',
      status: 'succès',
    },
    {
      id: 2,
      timestamp: '2025-01-20 13:15:22',
      user: 'super_admin@mynet.tn',
      action: 'Modifier',
      entity: 'Utilisateur',
      details: 'Modification du rôle: supplier -> buyer',
      ipAddress: '192.168.1.105',
      status: 'succès',
    },
    {
      id: 3,
      timestamp: '2025-01-20 12:45:10',
      user: 'buyer@company.tn',
      action: 'Supprimer',
      entity: 'Appel d\'offres',
      details: 'Suppression de l\'appel d\'offres #2024-001',
      ipAddress: '192.168.1.110',
      status: 'succès',
    },
    {
      id: 4,
      timestamp: '2025-01-20 11:30:05',
      user: 'supplier@techcorp.tn',
      action: 'Télécharger',
      entity: 'Document',
      details: 'Téléchargement du cahier des charges',
      ipAddress: '192.168.1.115',
      status: 'succès',
    },
    {
      id: 5,
      timestamp: '2025-01-20 10:15:33',
      user: 'admin@mynet.tn',
      action: 'Accès',
      entity: 'Dashboard',
      details: 'Accès au tableau de bord administrateur',
      ipAddress: '192.168.1.100',
      status: 'succès',
    },
    {
      id: 6,
      timestamp: '2025-01-20 09:45:12',
      user: 'supplier@techcorp.tn',
      action: 'Soumettre',
      entity: 'Offre',
      details: 'Soumission d\'une offre pour l\'appel #2025-001',
      ipAddress: '192.168.1.120',
      status: 'échec',
    },
  ]);

  const [filter, setFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredLogs = logs.filter(log =>
    (filter === '' || log.user.toLowerCase().includes(filter.toLowerCase()) || log.entity.toLowerCase().includes(filter.toLowerCase())) &&
    (actionFilter === '' || log.action === actionFilter) &&
    (statusFilter === '' || log.status === statusFilter)
  );

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Entity', 'Details', 'IP Address', 'Status'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user,
        log.action,
        log.entity,
        log.details,
        log.ipAddress,
        log.status,
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${new Date().getTime()}.csv`;
    link.click();
  };

  const handleClearFilters = () => {
    setFilter('');
    setActionFilter('');
    setStatusFilter('');
  };

  const getStatusColor = (status) => {
    return status === 'succès' ? '#4caf50' : '#d32f2f';
  };

  const getActionColor = (action) => {
    const colors = {
      'Créer': '#0056B3',
      'Modifier': '#ff9800',
      'Supprimer': '#d32f2f',
      'Télécharger': '#2196f3',
      'Accès': '#4caf50',
      'Soumettre': '#9c27b0',
    };
    return colors[action] || '#666';
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#212121', marginBottom: '12px' }}>
            Journaux d'Audit - Audit Logs
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            Suivi complet de toutes les activités et modifications du système
          </Typography>

          {/* Filters */}
          <Stack direction="row" spacing={2} sx={{ marginBottom: '24px', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Rechercher par utilisateur ou entité..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: '250px' }}
            />
            <TextField
              select
              label="Action"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              size="small"
              sx={{ minWidth: '150px' }}
            >
              <MenuItem value="">Toutes</MenuItem>
              <MenuItem value="Créer">Créer</MenuItem>
              <MenuItem value="Modifier">Modifier</MenuItem>
              <MenuItem value="Supprimer">Supprimer</MenuItem>
              <MenuItem value="Télécharger">Télécharger</MenuItem>
              <MenuItem value="Accès">Accès</MenuItem>
              <MenuItem value="Soumettre">Soumettre</MenuItem>
            </TextField>
            <TextField
              select
              label="Statut"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              sx={{ minWidth: '150px' }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="succès">Succès</MenuItem>
              <MenuItem value="échec">Échec</MenuItem>
            </TextField>
            <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClearFilters}>
              Réinitialiser
            </Button>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport} sx={{ backgroundColor: '#0056B3' }}>
              Exporter
            </Button>
          </Stack>
        </Box>

        {/* Stats */}
        <Stack direction="row" spacing={2} sx={{ marginBottom: '24px' }}>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Total des logs
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0056B3' }}>
                {filteredLogs.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Succès
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#4caf50' }}>
                {filteredLogs.filter(l => l.status === 'succès').length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Erreurs
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#d32f2f' }}>
                {filteredLogs.filter(l => l.status === 'échec').length}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Table */}
        <Paper sx={{ border: '1px solid #e0e0e0', overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Utilisateur</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Entité</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Détails</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell sx={{ fontSize: '13px' }}>{log.timestamp}</TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>{log.user}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      sx={{
                        backgroundColor: `${getActionColor(log.action)}20`,
                        color: getActionColor(log.action),
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>{log.entity}</TableCell>
                  <TableCell sx={{ fontSize: '13px', maxWidth: '250px' }}>{log.details}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.status}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(log.status)}20`,
                        color: getStatusColor(log.status),
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {filteredLogs.length === 0 && (
          <Paper sx={{ padding: '40px', textAlign: 'center', marginTop: '24px', border: '1px solid #e0e0e0' }}>
            <Typography sx={{ color: '#999' }}>
              Aucun log trouvé
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
