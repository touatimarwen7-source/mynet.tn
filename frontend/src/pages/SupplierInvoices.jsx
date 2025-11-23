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
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function SupplierInvoices() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setPageTitle('Gestion des Factures - Fournisseur');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get purchase orders for supplier
      const [posRes, invoicesRes] = await Promise.all([
        procurementAPI.getPurchaseOrders(),
        procurementAPI.getMyInvoices()
      ]);

      setPurchaseOrders(posRes.data || []);
      setInvoices(invoicesRes.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      // Error tracked;
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (invoiceId, invoiceNumber) => {
    // Generate PDF download link
    const link = document.createElement('a');
    link.href = `/api/invoices/${invoiceId}/download`;
    link.download = `Facture_${invoiceNumber}.pdf`;
    link.click();
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'default',
      'sent': 'info',
      'paid': 'success',
      'overdue': 'error',
      'pending': 'warning'
    };
    return colors[status] || 'default';
  };

  const getPoStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'approved': 'Approuvée',
      'in_progress': 'En cours',
      'completed': 'Complétée',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '40px' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: '32px',
              fontWeight: 600,
              color: theme.palette.primary.main,
              marginBottom: '8px'
            }}
          >
            📄 Gestion des Factures
          </Typography>
          <Typography sx={{ color: '#616161', fontSize: '14px' }}>
            Créez et gérez vos factures liées à vos commandes
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ marginBottom: '24px' }}>
            {error}
          </Alert>
        )}

        {/* Section: Purchase Orders */}
        <Card sx={{ border: '1px solid #e0e0e0', marginBottom: '40px' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <Typography variant="h5" sx={{ fontSize: '20px', fontWeight: 600, color: theme.palette.text.primary }}>
                📦 Vos Commandes
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#999' }}>
                {purchaseOrders.length} commandé{purchaseOrders.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {purchaseOrders.length === 0 ? (
              <Alert severity="info">Aucune commande reçue pour le moment</Alert>
            ) : (
              <TableContainer component={Paper} sx={{ border: '1px solid #E0E0E0' }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>N° Commande</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Appel d'offres</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Montant</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchaseOrders.map((po) => {
                      const poInvoices = invoices.filter(inv => inv.purchase_order_id === po.id);
                      return (
                        <TableRow key={po.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                          <TableCell sx={{ fontWeight: 500 }}>{po.po_number}</TableCell>
                          <TableCell>{po.tender_title || 'N/A'}</TableCell>
                          <TableCell>{po.total_amount?.toLocaleString('fr-TN')} {po.currency}</TableCell>
                          <TableCell>
                            <Chip
                              label={getPoStatusLabel(po.status)}
                              size="small"
                              color={po.status === 'completed' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {poInvoices.length === 0 ? (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate(`/supply-request/${po.id}/invoice`)}
                                sx={{ backgroundColor: theme.palette.primary.main, color: '#fff' }}
                              >
                                Créer
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon />}
                                onClick={() => navigate(`/supply-request/${po.id}/invoice`)}
                              >
                                Voir
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Section: Your Invoices */}
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <Typography variant="h5" sx={{ fontSize: '20px', fontWeight: 600, color: theme.palette.text.primary }}>
                📋 Vos Factures
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#999' }}>
                {invoices.length} facture{invoices.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {invoices.length === 0 ? (
              <Alert severity="info">Vous n'avez pas encore créé de facture</Alert>
            ) : (
              <TableContainer component={Paper} sx={{ border: '1px solid #E0E0E0' }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>N° Facture</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Commande</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Montant</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.order_number || 'N/A'}</TableCell>
                        <TableCell>{invoice.total?.toLocaleString('fr-TN')} TND</TableCell>
                        <TableCell>{new Date(invoice.issue_date).toLocaleDateString('fr-TN')}</TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status === 'paid' ? 'Payée' : invoice.status === 'sent' ? 'Envoyée' : 'Brouillon'}
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
