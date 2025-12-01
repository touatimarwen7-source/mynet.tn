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
} from '@mui/material';
import { procurementAPI } from '../api/procurementAPI';
import { setPageTitle } from '../utils/pageTitle';

/**
 * A page for buyers to see a list of their completed orders that are pending a review.
 */
const ReviewableOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPageTitle('Évaluer les Fournisseurs');
    const fetchOrders = async () => {
      try {
        const response = await procurementAPI.getReviewableOrders();
        setOrders(response.data.orders || []);
      } catch (err) {
        setError('Erreur lors du chargement des commandes à évaluer.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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
          Évaluer les Transactions Complétées
        </Typography>
        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none' }}>
          <CardContent>
            {orders.length === 0 ? (
              <Alert severity="info">Vous n'avez aucune commande en attente d'évaluation.</Alert>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Numéro du BC</TableCell>
                    <TableCell>Fournisseur</TableCell>
                    <TableCell>Date de Complétion</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell><strong>{order.poNumber}</strong></TableCell>
                      <TableCell>{order.supplier.name}</TableCell>
                      <TableCell>{new Date(order.completedAt).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell align="center">
                        <Button variant="contained" size="small" onClick={() => navigate(`/submit-review/${order.id}`)}>
                          Laisser un avis
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ReviewableOrdersPage;