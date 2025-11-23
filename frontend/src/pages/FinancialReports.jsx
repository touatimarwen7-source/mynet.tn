import { useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { Container, Box, Card, CardContent, CardHeader, Typography, Grid, Button, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { setPageTitle } from '../utils/pageTitle';

export default function FinancialReports() {
  const theme = institutionalTheme;
  const stats = [
    { label: 'Revenu total', value: '500 000 TND' },
    { label: 'Frais administratifs', value: '50 000 TND' },
    { label: 'Bénéfice net', value: '450 000 TND' },
    { label: 'Créances', value: '75 000 TND' }
  ];

  const reports = [
    { name: 'Rapport des revenus', date: '2024-11-01', format: 'PDF' },
    { name: 'Rapport des dépenses', date: '2024-11-01', format: 'Excel' },
    { name: 'Relevé bancaire', date: '2024-11-22', format: 'PDF' }
  ];

  useEffect(() => {
    setPageTitle('Rapports financiers');
  }, []);

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Rapports financiers
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Box sx={{ backgroundColor: '#FFF', p: 2, borderRadius: '8px', border: '1px solid #E0E0E0' }}>
                <Typography sx={{ color: '#616161', fontSize: '12px' }}>{stat.label}</Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '20px', color: theme.palette.primary.main }}>{stat.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ border: '1px solid #E0E0E0' }}>
          <CardHeader title="Rapports disponibles" />
          <CardContent>
            <Paper sx={{ border: '1px solid #E0E0E0', overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Nom du rapport</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Format</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Télécharger</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{r.format}</TableCell>
                      <TableCell align="center">
                        <Button size="small" startIcon={<DownloadIcon />} sx={{ color: theme.palette.primary.main }}>Télécharger</Button>
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
