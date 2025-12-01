import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { procurementAPI } from '../api/procurementAPI';
import { useToast } from '../contexts/AppContext';
import { setPageTitle } from '../utils/pageTitle';
import debounce from 'lodash.debounce';

/**
 * Admin page for managing all users in the system.
 * Allows searching, filtering, and updating user roles and statuses.
 */
const UserManagementPage = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async (query) => {
    setLoading(true);
    try {
      const response = await procurementAPI.getUsers({ search: query });
      setUsers(response.data.users || []);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs.');
      addToast('Erreur de chargement.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Debounced fetch for search functionality
  const debouncedFetch = useCallback(debounce(fetchUsers, 500), [fetchUsers]);

  useEffect(() => {
    setPageTitle('Gestion des Utilisateurs');
    fetchUsers(searchQuery);
  }, [fetchUsers]);

  useEffect(() => {
    debouncedFetch(searchQuery);
  }, [searchQuery, debouncedFetch]);

  const handleUpdate = async (userId, field, value) => {
    try {
      await procurementAPI.updateUser(userId, { [field]: value });
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, [field]: value } : user
        )
      );
      addToast('Utilisateur mis à jour avec succès.', 'success');
    } catch (err) {
      addToast('Échec de la mise à jour.', 'error');
    }
  };

  if (error && users.length === 0) {
    return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4, color: 'primary.main' }}>
          Gestion des Utilisateurs
        </Typography>

        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none' }}>
          <CardContent>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}

            {!loading && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell align="center">Statut (Actif)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell><strong>{user.name}</strong></TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onChange={(e) => handleUpdate(user.id, 'role', e.target.value)}
                          variant="standard"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="Buyer">Acheteur</MenuItem>
                          <MenuItem value="Supplier">Fournisseur</MenuItem>
                          <MenuItem value="Admin">Admin</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={user.isActive}
                          onChange={(e) => handleUpdate(user.id, 'isActive', e.target.checked)}
                          color="success"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default UserManagementPage;