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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function UserManagement() {
  const [users, setUsers] = useState([
    {
      id: 1,
      email: 'admin@mynet.tn',
      name: 'Admin MyNet',
      role: 'super_admin',
      status: 'actif',
      createdAt: '2025-01-01',
      lastLogin: '2025-01-20',
    },
    {
      id: 2,
      email: 'buyer@company.tn',
      name: 'Ahmed Acheteur',
      role: 'buyer',
      status: 'actif',
      createdAt: '2025-01-05',
      lastLogin: '2025-01-20',
    },
    {
      id: 3,
      email: 'supplier@techcorp.tn',
      name: 'Fatima Fournisseur',
      role: 'supplier',
      status: 'actif',
      createdAt: '2025-01-10',
      lastLogin: '2025-01-19',
    },
    {
      id: 4,
      email: 'inactive@example.tn',
      name: 'Compte Inactif',
      role: 'buyer',
      status: 'inactif',
      createdAt: '2024-12-20',
      lastLogin: '2024-12-25',
    },
    {
      id: 5,
      email: 'blocked@example.tn',
      name: 'Utilisateur Bloqué',
      role: 'supplier',
      status: 'bloqué',
      createdAt: '2025-01-15',
      lastLogin: '2025-01-15',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({});
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState('');

  const filteredUsers = users.filter(user =>
    (filter === '' || user.email.toLowerCase().includes(filter.toLowerCase()) || user.name.toLowerCase().includes(filter.toLowerCase())) &&
    (roleFilter === '' || user.role === roleFilter) &&
    (statusFilter === '' || user.status === statusFilter)
  );

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({ ...user });
    setDialogType('edit');
    setOpenDialog(true);
  };

  const handleBlockUser = (user) => {
    setUsers(users.map(u =>
      u.id === user.id
        ? { ...u, status: u.status === 'bloqué' ? 'actif' : 'bloqué' }
        : u
    ));
    setMessage(`Utilisateur ${user.status === 'bloqué' ? 'débloqué' : 'bloqué'} avec succès`);
  };

  const handleDeleteUser = (user) => {
    setUsers(users.filter(u => u.id !== user.id));
    setMessage(`Utilisateur ${user.name} supprimé`);
  };

  const handleSaveUser = () => {
    if (!formData.email || !formData.name || !formData.role) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    setUsers(users.map(u =>
      u.id === selectedUser.id
        ? { ...formData }
        : u
    ));
    setOpenDialog(false);
    setMessage(`Utilisateur ${formData.name} mis à jour avec succès`);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({ email: '', name: '', role: 'buyer', status: 'actif' });
    setDialogType('add');
    setOpenDialog(true);
  };

  const handleSaveNewUser = () => {
    if (!formData.email || !formData.name || !formData.role) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      ...formData,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Jamais',
    };

    setUsers([...users, newUser]);
    setOpenDialog(false);
    setMessage(`Utilisateur ${formData.name} créé avec succès`);
  };

  const getStatusColor = (status) => {
    const colors = {
      'actif': '#4caf50',
      'inactif': '#ff9800',
      'bloqué': '#d32f2f',
    };
    return colors[status] || '#666';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'buyer': 'Acheteur',
      'supplier': 'Fournisseur',
    };
    return labels[role] || role;
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary, marginBottom: '12px' }}>
            Gestion des Utilisateurs
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            Gérer les utilisateurs, rôles et permissions du système
          </Typography>

          {message && (
            <Alert severity="success" sx={{ marginBottom: '16px' }}>
              {message}
            </Alert>
          )}

          {/* Filters & Action */}
          <Stack direction="row" spacing={2} sx={{ marginBottom: '24px', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Rechercher par email ou nom..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: '250px' }}
            />
            <TextField
              select
              label="Rôle"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              size="small"
              sx={{ minWidth: '150px' }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="super_admin">Super Admin</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="buyer">Acheteur</MenuItem>
              <MenuItem value="supplier">Fournisseur</MenuItem>
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
              <MenuItem value="actif">Actif</MenuItem>
              <MenuItem value="inactif">Inactif</MenuItem>
              <MenuItem value="bloqué">Bloqué</MenuItem>
            </TextField>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Ajouter Utilisateur
            </Button>
          </Stack>
        </Box>

        {/* Stats */}
        <Stack direction="row" spacing={2} sx={{ marginBottom: '24px' }}>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Total des utilisateurs
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: theme.palette.primary.main }}>
                {users.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Actifs
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#4caf50' }}>
                {users.filter(u => u.status === 'actif').length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Bloqués
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#d32f2f' }}>
                {users.filter(u => u.status === 'bloqué').length}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Table */}
        <Paper sx={{ border: '1px solid #e0e0e0', overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Rôle</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Dernier accès</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell sx={{ fontSize: '13px' }}>{user.email}</TableCell>
                  <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>{user.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(user.status)}20`,
                        color: getStatusColor(user.status),
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>{user.lastLogin}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditUser(user)}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={user.status === 'bloqué' ? <CheckCircleIcon /> : <BlockIcon />}
                        onClick={() => handleBlockUser(user)}
                        color={user.status === 'bloqué' ? 'success' : 'error'}
                      >
                        {user.status === 'bloqué' ? 'Débloquer' : 'Bloquer'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteUser(user)}
                        color="error"
                      >
                        Supprimer
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Edit/Add Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogType === 'edit' ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ paddingY: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <TextField
                fullWidth
                label="Nom"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                fullWidth
                select
                label="Rôle"
                value={formData.role || 'buyer'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="buyer">Acheteur</MenuItem>
                <MenuItem value="supplier">Fournisseur</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </TextField>
              <TextField
                fullWidth
                select
                label="Statut"
                value={formData.status || 'actif'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="actif">Actif</MenuItem>
                <MenuItem value="inactif">Inactif</MenuItem>
                <MenuItem value="bloqué">Bloqué</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button
              onClick={dialogType === 'edit' ? handleSaveUser : handleSaveNewUser}
              variant="contained"
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              {dialogType === 'edit' ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
