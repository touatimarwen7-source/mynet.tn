import { useEffect, useMemo } from 'react';
import institutionalTheme from '../theme/theme';
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
  Grid,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { setPageTitle } from '../utils/pageTitle';
import { useOptimizedFetch } from '../hooks/useOptimizedFetch';

const STATUS_COLORS = {
  'paid': '#4caf50',
  'pending': '#ff9800',
  'overdue': '#f44336',
  'cancelled': '#616161'
};

export default function InvoiceManagement() {
  const theme = institutionalTheme;
  const { data, loading, error, pagination, goToPage, fetchData } = useOptimizedFetch('/api/procurement/invoices');

  useEffect(() => {
    setPageTitle('Gestion des factures');
  }, []);

  useEffect(() => {
    fetchData('/api/procurement/invoices', { page: pagination.page, limit: 20 });
  }, [pagination.page, fetchData]);

  const invoices = useMemo(() => data?.invoices || [], [data]);

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || '#757575';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-TN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const stats = useMemo(() => {
    return [
      { label: 'إجمالي الفواتير', value: pagination?.total || 0 },
      { label: 'الفواتير المعروضة', value: invoices.length },
      { label: 'المبلغ الإجمالي', value: formatCurrency(invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)) }
    ];
  }, [invoices, pagination]);

  const maxPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <Box sx={{ backgroundColor: institutionalTheme.palette.background.default, paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{
          fontSize: '32px',
          fontWeight: 600,
          color: institutionalTheme.palette.primary.main,
          mb: 3,
          direction: 'rtl'
        }}>
          Gestion des factures
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {stats.map((stat, idx) => (
            <Grid xs={12} sm={6} md={4} key={idx}>
              <Box sx={{
                backgroundColor: '#FFF',
                p: 2,
                borderRadius: '8px',
                border: '1px solid #E0E0E0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Typography sx={{ color: '#616161', fontSize: '12px', mb: 1 }}>
                  {stat.label}
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '20px', color: institutionalTheme.palette.primary.main }}>
                  {stat.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : invoices.length === 0 ? (
          <Alert severity="info">Aucune facture trouvée</Alert>
        ) : (
          <>
            <Paper sx={{ border: '1px solid #E0E0E0', borderRadius: '8px', overflow: 'auto' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }}>N° de facture</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }}>Montant</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }}>Échéance</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow
                      key={inv.id}
                      sx={{ '&:hover': { backgroundColor: institutionalTheme.palette.background.default } }}
                    >
                      <TableCell>{inv.id}</TableCell>
                      <TableCell>{formatCurrency(inv.amount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={inv.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(inv.status) + '30',
                            color: getStatusColor(inv.status),
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(inv.date)}</TableCell>
                      <TableCell>{formatDate(inv.dueDate)}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          sx={{ color: institutionalTheme.palette.primary.main, mr: 1 }}
                        >
                          Afficher
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          sx={{ color: institutionalTheme.palette.primary.main }}
                        >
                          Télécharger
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            {maxPages > 1 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={maxPages}
                  page={pagination.page}
                  onChange={(e, page) => goToPage(page)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
