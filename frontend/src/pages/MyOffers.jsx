import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Chip,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { setPageTitle } from '../utils/pageTitle';

export default function MyOffers() {
  const [offers, setOffers] = useState([
    { id: 1, tender: 'Fournitures de bureau', price: 5000, status: 'Acceptée', date: '2024-11-20' },
    { id: 2, tender: 'Équipements informatiques', price: 75000, status: 'En attente', date: '2024-11-21' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPageTitle('Mes offres');
  }, []);

  const getStatusColor = (status) => {
    const colors = { 'Acceptée': '#4caf50', 'Rejetée': '#f44336', 'En attente': '#ff9800' };
    return colors[status] || '#757575';
  };

  return (
    <Box sx={{ backgroundColor: '#F9F9F9', paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Mes offres
        </Typography>
        {loading ? <CircularProgress /> : (
          <Paper sx={{ border: '1px solid #E0E0E0', borderRadius: '8px', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Appel d'offres</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Prix</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id} sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}>
                    <TableCell>{offer.tender}</TableCell>
                    <TableCell>{offer.price.toLocaleString()} TND</TableCell>
                    <TableCell>
                      <Chip label={offer.status} size="small" sx={{ backgroundColor: getStatusColor(offer.status) + '30', color: getStatusColor(offer.status) }} />
                    </TableCell>
                    <TableCell>{offer.date}</TableCell>
                    <TableCell align="center">
                      <Button size="small" startIcon={<EditIcon />} sx={{ color: theme.palette.primary.main, mr: 1 }}>Modifier</Button>
                      <Button size="small" startIcon={<DeleteIcon />} sx={{ color: '#C62828' }}>Supprimer</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
