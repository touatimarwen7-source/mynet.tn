import { useEffect } from 'react';
import { Container, Box, Table, TableHead, TableBody, TableRow, TableCell, Paper, Button, Chip, Typography, Grid } from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { setPageTitle } from '../utils/pageTitle';

export default function DeliveryManagement() {
  const deliveries = [
    { id: 1, order: 'ORD-001', status: 'En cours de livraison', location: 'Tunis', date: '2024-11-22', eta: '2024-11-23' },
    { id: 2, order: 'ORD-002', status: 'Livrée', location: 'Sousse', date: '2024-11-20', eta: '2024-11-20' },
    { id: 3, order: 'ORD-003', status: 'En attente', location: 'Sfax', date: '2024-11-21', eta: '2024-11-24' }
  ];

  useEffect(() => {
    setPageTitle('Gestion des livraisons');
  }, []);

  const getStatusColor = (status) => {
    const colors = { 'Livrée': '#4caf50', 'En cours de livraison': '#2196f3', 'En attente': '#ff9800' };
    return colors[status] || '#757575';
  };

  return (
    <Box sx={{ backgroundColor: '#F9F9F9', paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Gestion des livraisons
        </Typography>
        <Paper sx={{ border: '1px solid #E0E0E0', borderRadius: '8px', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Commande</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Localisation</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date d'arrivée prévue</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveries.map((del) => (
                <TableRow key={del.id} sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}>
                  <TableCell>{del.order}</TableCell>
                  <TableCell>
                    <Chip label={del.status} size="small" sx={{ backgroundColor: getStatusColor(del.status) + '30', color: getStatusColor(del.status) }} />
                  </TableCell>
                  <TableCell>{del.location}</TableCell>
                  <TableCell>{del.date}</TableCell>
                  <TableCell>{del.eta}</TableCell>
                  <TableCell align="center">
                    <Button size="small" startIcon={<TrackChangesIcon />} sx={{ color: theme.palette.primary.main }}>Suivre</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </Box>
  );
}
