import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function InvoiceGeneration() {
  const theme = institutionalTheme;
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  useEffect(() => {
    setPageTitle('Factures - Acheteur');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get buyer's purchase orders and invoices from them
      const [posRes, invoicesRes] = await Promise.all([
        procurementAPI.getPurchaseOrders(),
        procurementAPI.getInvoices()
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

  const openApprovalModal = (invoice) => {
    setSelectedInvoice(invoice);
    setApprovalNotes('');
    setOpenApprovalDialog(true);
  };

  const approveInvoice = async () => {
    try {
      await procurementAPI.approveInvoice(selectedInvoice.id, { notes: approvalNotes });
      setOpenApprovalDialog(false);
      fetchData();
    } catch (err) {
      setError('Erreur lors de l\'approbation');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'default',
      'sent': 'info',
      'approved': 'success',
      'paid': 'success',
      'overdue': 'error',
      'pending': 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'draft': 'Brouillon',
      'sent': 'Envoyée',
      'approved': 'Approuvée',
      'paid': 'Payée',
      'overdue': 'En retard',
      'pending': 'En attente'
    };
    return labels[status] || status;
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
            💰 Gestion des Factures - Acheteur
          </Typography>
          <Typography sx={{ color: '#616161', fontSize: '14px' }}>
            Consultez et approuvez les factures de vos fournisseurs
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ marginBottom: '24px' }}>
            {error}
          </Alert>
        )}

        {/* Section: Summary Cards */}
        <Grid container spacing={2} sx={{ marginBottom: '40px' }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center' }}>
              <CardContent>
                <Typography sx={{ color: '#999', fontSize: '12px', fontWeight: 600 }}>
                  COMMANDES TOTALES
                </Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: theme.palette.primary.main }}>
                  {purchaseOrders.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center' }}>
              <CardContent>
                <Typography sx={{ color: '#999', fontSize: '12px', fontWeight: 600 }}>
                  FACTURES TOTALES
                </Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: theme.palette.primary.main }}>
                  {invoices.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center' }}>
              <CardContent>
                <Typography sx={{ color: '#999', fontSize: '12px', fontWeight: 600 }}>
                  EN ATTENTE D'APPROBATION
                </Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#f57c00' }}>
                  {invoices.filter(i => i.status === 'sent').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center' }}>
              <CardContent>
                <Typography sx={{ color: '#999', fontSize: '12px', fontWeight: 600 }}>
                  FACTURES PAYÉES
                </Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#2e7d32' }}>
                  {invoices.filter(i => i.status === 'paid').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Section: Purchase Orders */}
        <Card sx={{ border: '1px solid #e0e0e0', marginBottom: '40px' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Typography variant="h5" sx={{ fontSize: '20px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '20px' }}>
              📦 Vos Commandes (Demandes de Fourniture)
            </Typography>

            {purchaseOrders.length === 0 ? (
              <Alert severity="info">Aucune commande en cours</Alert>
            ) : (
              <TableContainer component={Paper} sx={{ border: '1px solid #E0E0E0' }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>N° Commande</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Fournisseur</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Montant</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Facture(s)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchaseOrders.map((po) => {
                      const poInvoices = invoices.filter(inv => inv.purchase_order_id === po.id);
                      return (
                        <TableRow key={po.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                          <TableCell sx={{ fontWeight: 500 }}>{po.po_number}</TableCell>
                          <TableCell>{po.supplier_name || 'N/A'}</TableCell>
                          <TableCell>{po.total_amount?.toLocaleString('fr-TN')} {po.currency}</TableCell>
                          <TableCell>
                            <Chip
                              label={getPoStatusLabel(po.status)}
                              size="small"
                              color={po.status === 'completed' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {poInvoices.length > 0 ? (
                              <Chip
                                label={`${poInvoices.length} facture${poInvoices.length > 1 ? 's' : ''}`}
                                size="small"
                                variant="outlined"
                                icon={<CheckCircleIcon />}
                              />
                            ) : (
                              <Typography sx={{ fontSize: '12px', color: '#999' }}>Aucune</Typography>
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

        {/* Section: Invoices */}
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <Typography variant="h5" sx={{ fontSize: '20px', fontWeight: 600, color: theme.palette.text.primary }}>
                📄 Factures des Fournisseurs
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#999' }}>
                {invoices.length} facture{invoices.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {invoices.length === 0 ? (
              <Alert severity="info">Aucune facture reçue</Alert>
            ) : (
              <TableContainer component={Paper} sx={{ border: '1px solid #E0E0E0' }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>N° Facture</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Fournisseur</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Montant</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Échéance</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.supplier_name || 'N/A'}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {invoice.total?.toLocaleString('fr-TN')} TND
                        </TableCell>
                        <TableCell>
                          {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-TN') : 'N/A'}
                        </TableCell>
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
                                startIcon={<CheckCircleIcon />}
                                onClick={() => openApprovalModal(invoice)}
                                sx={{ backgroundColor: '#2e7d32', color: '#fff' }}
                              >
                                Approuver
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

      {/* Approval Dialog */}
      <Dialog open={openApprovalDialog} onClose={() => setOpenApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approuver la Facture</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ mb: 2 }}>
            Voulez-vous approuver la facture <strong>{selectedInvoice?.invoice_number}</strong> ?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarques (optionnel)"
            placeholder="Ajoutez des notes pour le fournisseur..."
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApprovalDialog(false)}>Annuler</Button>
          <Button onClick={approveInvoice} variant="contained" sx={{ backgroundColor: theme.palette.primary.main }}>
            Approuver
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
