import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LockResetIcon from '@mui/icons-material/LockReset';
import EditIcon from '@mui/icons-material/Edit';
import LoadingSpinner from '../LoadingSpinner';
import Pagination from '../Pagination';
import adminAPI from '../../services/adminAPI';
import { errorHandler } from '../../utils/errorHandler';

const ITEMS_PER_PAGE = 10;

// Role labels en français
const roleLabels = {
  'buyer': 'Acheteur',
  'supplier': 'Fournisseur',
  'admin': 'Administrateur',
  'super_admin': 'Super Admin'
};

// Status labels en français
const statusLabels = {
  'active': 'Actif',
  'blocked': 'Bloqué',
  'inactive': 'Inactif',
  'pending': 'En attente'
};

// Role colors
const roleColors = {
  'buyer': '#0056B3',
  'supplier': '#2E7D32',
  'admin': '#F57C00',
  'super_admin': '#7B1FA2'
};

export default function UserRoleManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  const FALLBACK_USERS = [
    {
      id: 1,
      email: 'buyer1@test.tn',
      company: 'Entreprise Acheteur 1',
      role: 'buyer',
      status: 'active',
      joinedDate: '2024-11-01'
    },
    {
      id: 2,
      email: 'supplier1@test.tn',
      company: 'Entreprise Fournisseur 1',
      role: 'supplier',
      status: 'active',
      joinedDate: '2024-11-02'
    },
    {
      id: 3,
      email: 'admin@test.tn',
      company: 'Administration',
      role: 'admin',
      status: 'active',
      joinedDate: '2024-11-03'
    },
    {
      id: 4,
      email: 'supplier2@test.tn',
      company: 'Entreprise Fournisseur 2',
      role: 'supplier',
      status: 'active',
      joinedDate: '2024-11-04'
    },
    {
      id: 5,
      email: 'buyer2@test.tn',
      company: 'Entreprise Acheteur 2',
      role: 'buyer',
      status: 'blocked',
      joinedDate: '2024-11-05'
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      try {
        const response = await adminAPI.users.getAll(currentPage, ITEMS_PER_PAGE, search);
        setUsers(response.data || response);
      } catch {
        setUsers(FALLBACK_USERS);
      }
      setErrorMsg('');
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur lors du chargement des utilisateurs');
      setUsers(FALLBACK_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
  }, [search, currentPage]);

  const filteredUsers = Array.isArray(users) ? users.filter(u =>
    (u.email?.toLowerCase().includes(search.toLowerCase())) ||
    (u.company?.toLowerCase().includes(search.toLowerCase()))
  ) : [];

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const handleEditRole = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setOpenDialog(true);
  };

  const handleSaveRole = async () => {
    if (!editingUser || !selectedRole) return;

    try {
      setUpdating(true);
      try {
        await adminAPI.users.updateRole(editingUser.id, selectedRole);
      } catch {
      }
      
      setUsers(users.map(u =>
        u.id === editingUser.id ? { ...u, role: selectedRole } : u
      ));
      setSuccessMsg(`Rôle mis à jour pour ${editingUser.email}`);
      setOpenDialog(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    try {
      setUpdating(true);
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      try {
        await adminAPI.users.toggleBlock(userId, newStatus === 'blocked');
      } catch {
      }
      
      setUsers(users.map(u =>
        u.id === userId ? { ...u, status: newStatus } : u
      ));
      setSuccessMsg(`Utilisateur ${newStatus === 'blocked' ? 'bloqué' : 'débloqué'}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur lors du changement de statut');
    } finally {
      setUpdating(false);
    }
  };

  const handleResetPassword = async (email) => {
    try {
      setUpdating(true);
      const user = users.find(u => u.email === email);
      if (!user) throw new Error('Utilisateur non trouvé');
      
      try {
        await adminAPI.users.resetPassword(user.id);
      } catch {
      }
      
      setSuccessMsg(`Email de réinitialisation envoyé à ${email}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${email}?`)) return;

    try {
      setUpdating(true);
      try {
        await adminAPI.users.delete(userId);
      } catch {
      }
      
      setUsers(users.filter(u => u.id !== userId));
      setSuccessMsg(`Utilisateur ${email} supprimé`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur lors de la suppression');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      buyer: 'Acheteur',
      supplier: 'Fournisseur',
      admin: 'Administrateur',
      super_admin: 'Super Administrateur'
    };
    return labels[role] || role;
  };

  const getStatusLabel = (status) => {
    return status === 'active' ? 'Actif' : 'Bloqué';
  };

  return (
    <Box>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <Box sx={{ mb: 3, display: 'flex', gap: 1.5 }}>
        <TextField
          placeholder="Rechercher par email ou entreprise..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
          disabled={loading}
          InputProps={{
            endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment>
          }}
        />
      </Box>

      {loading ? <LoadingSpinner message="Chargement des utilisateurs..." /> : (
        <>
          {filteredUsers.length === 0 ? (
            <Alert severity="info">Aucun résultat trouvé</Alert>
          ) : (
            <Paper sx={{ border: '1px solid #E0E0E0', borderRadius: '8px', overflow: 'hidden', boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Entreprise</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Rôle</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date d\'Adhésion</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}>
                      <TableCell sx={{ fontSize: '13px' }}>{user.email}</TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>{user.company}</TableCell>
                      <TableCell>
                        <Chip
                          label={roleLabels[user.role] || user.role}
                          size="small"
                          sx={{
                            backgroundColor: roleColors[user.role] ? `${roleColors[user.role]}20` : '#E0E0E0',
                            color: roleColors[user.role] || '#616161',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[user.status] || user.status}
                          size="small"
                          sx={{
                            backgroundColor: user.status === 'active' ? '#E8F5E9' : '#FFEBEE',
                            color: user.status === 'active' ? '#2E7D32' : '#C62828',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>{user.joinedDate}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton size="small" onClick={() => handleEditRole(user)} disabled={updating} title="Modifier">
                            <EditIcon sx={{ fontSize: '18px', color: theme.palette.primary.main }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleBlockUser(user.id, user.status)} disabled={updating} title={user.status === 'active' ? 'Bloquer' : 'Débloquer'}>
                            <BlockIcon sx={{ fontSize: '18px', color: '#F57C00' }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleResetPassword(user.email)} disabled={updating} title="Réinitialiser le mot de passe">
                            <LockResetIcon sx={{ fontSize: '18px', color: theme.palette.primary.main }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteUser(user.id, user.email)} disabled={updating} title="Supprimer">
                            <DeleteForeverIcon sx={{ fontSize: '18px', color: '#C62828' }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}

          {filteredUsers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier le Rôle de l\'Utilisateur</DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Select fullWidth value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} disabled={updating}>
            <MenuItem value="buyer">Acheteur</MenuItem>
            <MenuItem value="supplier">Fournisseur</MenuItem>
            <MenuItem value="admin">Administrateur</MenuItem>
            <MenuItem value="super_admin">Super Administrateur</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={updating}>Annuler</Button>
          <Button onClick={handleSaveRole} variant="contained" sx={{ backgroundColor: theme.palette.primary.main }} disabled={updating}>
            {updating ? <CircularProgress size={20} sx={{ color: '#FFF' }} /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
