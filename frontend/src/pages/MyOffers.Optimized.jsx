import { useEffect, useMemo, useCallback } from 'react';
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
  Alert,
  CircularProgress,
  Pagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { setPageTitle } from '../utils/pageTitle';
import { useOptimizedFetch } from '../hooks/useOptimizedFetch';

const STATUS_COLORS = {
  'submitted': '#4caf50',
  'rejected': '#f44336',
  'pending': '#ff9800',
  'opened': '#2196f3',
  'accepted': '#388e3c',
  'closed': '#616161'
};

const OfferTableRow = ({ offer, onEdit, onDelete, formatCurrency, formatDate, getStatusColor }) => (
  <TableRow sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
    <TableCell>{offer.offer_number}</TableCell>
    <TableCell>{formatCurrency(offer.total_amount, offer.currency)}</TableCell>
    <TableCell>
      <Chip
        label={offer.status}
        size="small"
        sx={{
          backgroundColor: getStatusColor(offer.status) + '30',
          color: getStatusColor(offer.status),
          fontWeight: 500
        }}
      />
    </TableCell>
    <TableCell>{formatDate(offer.submitted_at)}</TableCell>
    <TableCell align="center">
      <Button
        size="small"
        startIcon={<EditIcon />}
        sx={{ color: institutionalTheme.palette.primary.main, mr: 1 }}
        onClick={() => onEdit(offer)}
      >
        Modifier
      </Button>
      <Button
        size="small"
        startIcon={<DeleteIcon />}
        sx={{ color: '#C62828' }}
        onClick={() => onDelete(offer)}
      >
        Supprimer
      </Button>
    </TableCell>
  </TableRow>
);

export default function MyOffersOptimized() {
  const theme = institutionalTheme;
  const { data, loading, error, pagination, goToPage, fetchData } = useOptimizedFetch('/api/procurement/my-offers');

  useEffect(() => {
    setPageTitle('Mes offres');
  }, []);

  useEffect(() => {
    fetchData('/api/procurement/my-offers', { page: pagination.page, limit: 20 });
  }, [pagination.page]);

  const offers = useMemo(() => data?.offers || [], [data?.offers]);

  const getStatusColor = useCallback((status) => {
    return STATUS_COLORS[status] || '#757575';
  }, []);

  const formatCurrency = useCallback((amount, currency = 'TND') => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('fr-TN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }, []);

  const maxPages = useMemo(() => 
    Math.ceil(pagination.total / pagination.limit),
    [pagination.total, pagination.limit]
  );

  const handleEdit = useCallback((offer) => {
    // Handle edit logic
  }, []);

  const handleDelete = useCallback((offer) => {
    // Handle delete logic
  }, []);

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{
          fontSize: '32px',
          fontWeight: 600,
          color: theme.palette.primary.main,
          mb: 3,
          direction: 'rtl'
        }}>
          Mes offres
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : offers.length === 0 ? (
          <Alert severity="info">Aucune offre trouvée</Alert>
        ) : (
          <>
            <Paper sx={{ border: '1px solid #E0E0E0', borderRadius: '8px', overflow: 'auto' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>N° d'offre</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Montant</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offers.map((offer) => (
                    <OfferTableRow
                      key={offer.id}
                      offer={offer}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      getStatusColor={getStatusColor}
                    />
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
