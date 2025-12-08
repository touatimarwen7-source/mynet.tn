
import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  TableContainer,
  Stack,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function InvoiceManagement() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setPageTitle('Gestion des Factures - Acheteur');
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await procurementAPI.getReceivedInvoices();
      setInvoices(response.data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (invoiceId, newStatus) => {
    try {
      await procurementAPI.updateInvoiceStatus(invoiceId, newStatus);
      await fetchInvoices();
    } catch (err) {
      console.error('Error updating invoice status:', err);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const downloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      const response = await procurementAPI.getInvoice(invoiceId);
      if (response.data?.document_url) {
        window.open(response.data.document_url, '_blank');
      } else {
        setError('Document de facture non disponible');
      }
    } catch (err) {
      console.error('Error downloading invoice:', err);
      setError('Erreur lors du téléchargement de la facture');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'approved':
        return 'info';
      case 'sent':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'approved':
        return 'Approuvée';
      case 'sent':
        return 'Reçue';
      case 'rejected':
        return 'Rejetée';
      case 'draft':
        return 'Brouillon';
      default:
        return status;
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const paidAmount = filteredInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);
  const pendingAmount = filteredInvoices
    .filter((inv) => inv.status === 'sent' || inv.status === 'approved')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          sx={{
            fontSize: '28px',
            fontWeight: 600,
            color: theme.palette.text.primary,
            marginBottom: '24px',
          }}
        >
          💼 Gestion des Factures
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: '20px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ marginBottom: '30px' }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total des Factures
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, marginTop: '8px' }}>
                  {totalAmount.toLocaleString('fr-TN')} TND
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filteredInvoices.length} facture(s)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Factures Payées
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, marginTop: '8px', color: '#4caf50' }}>
                  {paidAmount.toLocaleString('fr-TN')} TND
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filteredInvoices.filter((inv) => inv.status === 'paid').length} facture(s)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  En Attente de Paiement
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, marginTop: '8px', color: '#ff9800' }}>
                  {pendingAmount.toLocaleString('fr-TN')} TND
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filteredInvoices.filter((inv) => inv.status === 'sent' || inv.status === 'approved').length}{' '}
                  facture(s)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ border: '1px solid #e0e0e0', marginBottom: '20px' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Rechercher"
                  placeholder="N° facture ou fournisseur"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Statut</InputLabel>
                  <Select value={statusFilter} label="Statut" onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="all">Tous</MenuItem>
                    <MenuItem value="sent">Reçue</MenuItem>
                    <MenuItem value="approved">Approuvée</MenuItem>
                    <MenuItem value="paid">Payée</MenuItem>
                    <MenuItem value="rejected">Rejetée</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: '20px',
                fontWeight: 600,
                color: theme.palette.text.primary,
                marginBottom: '20px',
              }}
            >
              📋 Liste des Factures
            </Typography>

            {filteredInvoices.length === 0 ? (
              <Alert severity="info">Aucune facture trouvée</Alert>
            ) : (
              <TableContainer component={Paper} sx={{ border: '1px solid #E0E0E0' }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>N° Facture</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Fournisseur</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Commande</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Montant</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.supplier_name || 'N/A'}</TableCell>
                        <TableCell>{invoice.order_number || 'N/A'}</TableCell>
                        <TableCell>{invoice.total?.toLocaleString('fr-TN')} TND</TableCell>
                        <TableCell>{new Date(invoice.issue_date).toLocaleDateString('fr-TN')}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(invoice.status)}
                            size="small"
                            color={getStatusColor(invoice.status)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              onClick={() => downloadInvoice(invoice.id, invoice.invoice_number)}
                            >
                              Télécharger
                            </Button>
                            {invoice.status === 'sent' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleStatusUpdate(invoice.id, 'approved')}
                              >
                                Approuver
                              </Button>
                            )}
                            {invoice.status === 'approved' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleStatusUpdate(invoice.id, 'paid')}
                              >
                                Marquer Payée
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
