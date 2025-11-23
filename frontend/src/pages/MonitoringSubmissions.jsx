import { useEffect } from 'react';
import { Container, Box, Table, TableHead, TableBody, TableRow, TableCell, Paper, Button, Chip, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { setPageTitle } from '../utils/pageTitle';

export default function MonitoringSubmissions() {
  const submissions = [
    { id: 1, user: 'supplier1@test.tn', offer: 'Offre #1', status: 'Acceptée', date: '2024-11-20' },
    { id: 2, user: 'supplier2@test.tn', offer: 'Offre #2', status: 'En examen', date: '2024-11-21' },
    { id: 3, user: 'supplier3@test.tn', offer: 'Offre #3', status: 'Rejetée', date: '2024-11-19' }
  ];

  useEffect(() => {
    setPageTitle('Surveillance des soumissions');
  }, []);

  const getStatusColor = (status) => {
    const colors = { 'Acceptée': '#4caf50', 'En examen': '#2196f3', 'Rejetée': '#f44336' };
    return colors[status] || '#999';
  };

  return (
    <Box sx={{ backgroundColor: '#F9F9F9', paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Surveillance des soumissions
        </Typography>
        <Paper sx={{ border: '1px solid #E0E0E0', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Utilisateur</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Offre</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.user}</TableCell>
                  <TableCell>{sub.offer}</TableCell>
                  <TableCell>
                    <Chip label={sub.status} size="small" sx={{ backgroundColor: getStatusColor(sub.status) + '30', color: getStatusColor(sub.status) }} />
                  </TableCell>
                  <TableCell>{sub.date}</TableCell>
                  <TableCell align="center">
                    <Button size="small" startIcon={<VisibilityIcon />} sx={{ color: theme.palette.primary.main }}>Afficher</Button>
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
