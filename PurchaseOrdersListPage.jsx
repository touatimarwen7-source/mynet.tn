import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { procurementAPI } from '../api/procurementAPI';
import { setPageTitle } from '../utils/pageTitle';

/**
 * A page that lists all purchase orders for the current supplier,
 * allowing them to create invoices for eligible orders.
 */
const PurchaseOrdersListPage = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPageTitle('Mes Bons de Commande');
    const fetchPurchaseOrders = async () => {
      try {
        const response = await procurementAPI.getMyPurchaseOrders();
        setPurchaseOrders(response.data.purchaseOrders || []);
      } catch (err) {
        setError('Erreur lors du chargement des bons de commande.');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchaseOrders();
  }, []);

  const getStatusChip = (status) => {
    const statusMap = {
      'Approved': { label: 'Approuvé', color: 'primary' },
      'Invoiced': { label: 'Facturé', color: 'warning' },
      'Paid': { label: 'Payé', color: 'success' },
      'Cancelled': { label: 'Annulé', color: 'error' },
    };
    const { label, color } = statusMap[status] || { label: status, color: 'default' };
    return <Chip label={label} color={color} size="small" />;
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4, color: 'primary.main' }}>
          Mes Bons de Commande
        </Typography>
        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none' }}>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Numéro du BC</TableCell>
                  <TableCell>Acheteur</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Montant Total</TableCell>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell><strong>{po.purchaseOrderNumber}</strong></TableCell>
                    <TableCell>{po.buyer.name}</TableCell>
                    <TableCell>{new Date(po.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell align="right">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(po.totalPrice)}</TableCell>
                    <TableCell align="center">{getStatusChip(po.status)}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/create-invoice/${po.id}`)}
                        disabled={po.status !== 'Approved'} // Only allow invoicing for approved POs
                      >
                        Créer une facture
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PurchaseOrdersListPage;