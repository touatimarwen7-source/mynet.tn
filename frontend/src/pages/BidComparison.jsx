import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  CircularProgress,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function BidComparison() {
  const { tenderId } = useParams();
  const [tender, setTender] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setPageTitle('Comparaison des Offres');
    loadData();
  }, [tenderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const tenderRes = await procurementAPI.getTender(tenderId);
      const offersRes = await procurementAPI.getOffers(tenderId);
      
      setTender(tenderRes.data.tender);
      setOffers(offersRes.data.offers || []);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ paddingY: '40px' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const sortedOffers = [...offers].sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount));

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'info',
      accepted: 'success',
      rejected: 'error',
      shortlisted: 'warning'
    };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Box sx={{ marginBottom: '32px' }}>
          <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: theme.palette.text.primary, marginBottom: '8px' }}>
            📊 Comparaison des Offres
          </Typography>
          {tender && (
            <Typography sx={{ color: '#616161', marginBottom: '16px' }}>
              {tender.title}
            </Typography>
          )}
        </Box>

        {sortedOffers.length === 0 ? (
          <Alert severity="info">Aucune offre reçue pour cet appel d'offres.</Alert>
        ) : (
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ padding: 0 }}>
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Fournisseur</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Montant Total</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Délai de Livraison</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Conditions de Paiement</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedOffers.map((offer, idx) => (
                      <TableRow key={offer.id} sx={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9f9f9' }}>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {offer.supplier_name || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: theme.palette.primary.main }}>
                          {parseFloat(offer.total_amount).toFixed(2)} {offer.currency || 'TND'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {offer.delivery_time || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {offer.payment_terms || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          <Chip
                            label={offer.status || 'submitted'}
                            color={getStatusColor(offer.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {offer.evaluation_score ? `${offer.evaluation_score.toFixed(1)}/100` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        )}

        {tender && (
          <Paper sx={{ marginTop: '32px', padding: '16px', backgroundColor: '#f5f5f5' }}>
            <Typography sx={{ fontWeight: 600, marginBottom: '12px', color: theme.palette.primary.main }}>
              📋 Résumé de l'Appel d'Offres
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
              <strong>Budget:</strong> {tender.budget_min} - {tender.budget_max} {tender.currency}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
              <strong>Deadline:</strong> {new Date(tender.deadline).toLocaleDateString('fr-TN')}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#666' }}>
              <strong>Nombre d'offres:</strong> {sortedOffers.length}
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
