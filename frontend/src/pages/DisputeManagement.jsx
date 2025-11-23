import { useEffect } from 'react';
import { Container, Box, Table, TableHead, TableBody, TableRow, TableCell, Paper, Button, Chip, Typography } from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';

export default function DisputeManagement() {
  const disputes = [
    { id: 1, order: 'ORD-001', type: 'Qualité du produit', status: 'En examen', date: '2024-11-20' },
    { id: 2, order: 'ORD-002', type: 'Retard de livraison', status: 'Résolu', date: '2024-11-18' },
    { id: 3, order: 'ORD-003', type: 'Non-réception', status: 'En investigation', date: '2024-11-21' }
  ];

  useEffect(() => {
    setPageTitle('Gestion des litiges');
  }, []);

  const getStatusColor = (status) => {
    const colors = { 'Résolu': '#4caf50', 'En examen': '#ff9800', 'En investigation': '#2196f3', 'En attente': '#f44336' };
    return colors[status] || '#757575';
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Gestion des litiges
        </Typography>
        <Paper sx={{ border: '1px solid #E0E0E0', borderRadius: '8px', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Commande</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {disputes.map((d) => (
                <TableRow key={d.id} sx={{ '&:hover': { backgroundColor: theme.palette.background.default } }}>
                  <TableCell>{d.order}</TableCell>
                  <TableCell>{d.type}</TableCell>
                  <TableCell>
                    <Chip label={d.status} size="small" sx={{ backgroundColor: getStatusColor(d.status) + '30', color: getStatusColor(d.status) }} />
                  </TableCell>
                  <TableCell>{d.date}</TableCell>
                  <TableCell align="center">
                    <Button size="small" sx={{ color: theme.palette.primary.main }}>Détails</Button>
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
