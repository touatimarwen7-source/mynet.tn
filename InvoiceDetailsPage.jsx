import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  ButtonGroup,
  Paper,
  Popper,
  Grow,
  MenuList,
  MenuItem,
  ClickAwayListener,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { procurementAPI } from '../api/procurementAPI';
import { useToast } from '../contexts/AppContext';
import { setPageTitle } from '../utils/pageTitle';

const EXPORT_OPTIONS = ['Exporter en PDF', 'Exporter en CSV'];

/**
 * A page that displays the details of a single invoice and allows exporting it.
 */
const InvoiceDetailsPage = () => {
  const { invoiceId } = useParams();
  const { addToast } = useToast();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the export button dropdown
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  useEffect(() => {
    setPageTitle(`Facture #${invoiceId}`);
    const fetchInvoice = async () => {
      try {
        const response = await procurementAPI.getInvoice(invoiceId);
        setInvoice(response.data.invoice);
      } catch (err) {
        setError('Erreur lors du chargement de la facture.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  const handleExport = async (format) => {
    setOpen(false);
    addToast(`Exportation en ${format.toUpperCase()} en cours...`, 'info');
    try {
      await procurementAPI.exportInvoice(invoiceId, format);
    } catch (err) {
      addToast(`Échec de l'exportation en ${format.toUpperCase()}.`, 'error');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  if (!invoice) {
    return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="info">Facture non trouvée.</Alert></Container>;
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" color="primary.main">
            Facture #{invoice.invoiceNumber}
          </Typography>
          <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
            <Button onClick={() => handleExport('pdf')}>Exporter</Button>
            <Button size="small" onClick={() => setOpen((prevOpen) => !prevOpen)}>
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>
          <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
            {({ TransitionProps, placement }) => (
              <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                <Paper>
                  <ClickAwayListener onClickAway={() => setOpen(false)}>
                    <MenuList autoFocusItem>
                      <MenuItem onClick={() => handleExport('pdf')}>Exporter en PDF</MenuItem>
                      <MenuItem onClick={() => handleExport('csv')}>Exporter en CSV</MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </Box>

        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none' }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={6}><Typography><strong>Date de facturation:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</Typography></Grid>
              <Grid item xs={6}><Typography><strong>Date d'échéance:</strong> {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</Typography></Grid>
              <Grid item xs={6}><Typography><strong>Acheteur:</strong> {invoice.buyer.name}</Typography></Grid>
              <Grid item xs={6}><Typography><strong>Fournisseur:</strong> {invoice.supplier.name}</Typography></Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Articles</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Quantité</TableCell>
                  <TableCell align="right">Prix Unitaire</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(item.unitPrice)}</TableCell>
                    <TableCell align="right">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(item.totalPrice)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right"><strong>Total de la Facture</strong></TableCell>
                  <TableCell align="right"><strong>{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(invoice.totalAmount)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default InvoiceDetailsPage;