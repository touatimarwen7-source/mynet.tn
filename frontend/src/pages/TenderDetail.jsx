import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { procurementAPI } from '../api';
import TokenManager from '../services/tokenManager';

export default function TenderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tender, setTender] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = TokenManager.getAccessToken();
    if (token) {
      try {
        const userData = TokenManager.getUserFromToken();
        setUser(userData);
      } catch (e) {
      }
    }
  }, []);

  useEffect(() => {
    fetchTender();
  }, [id]);

  const fetchTender = async () => {
    setLoading(true);
    try {
      const tenderRes = await procurementAPI.getTender(id);
      setTender(tenderRes.data.tender);
      
      try {
        const offersRes = await procurementAPI.getOffers(id);
        setOffers(offersRes.data.offers || []);
      } catch (err) {
        // Offers might not be accessible
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement de la marchandise');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
        <Container maxWidth="lg">
          <Box sx={{ marginBottom: '24px' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: theme.palette.primary.main, marginBottom: '16px' }} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <Box>
              <Skeleton variant="rectangular" height={300} sx={{ marginBottom: '16px' }} />
              <Skeleton variant="text" height={24} width="60%" sx={{ marginBottom: '8px' }} />
              <Skeleton variant="text" height={16} width="40%" />
            </Box>
            <Box>
              <Skeleton variant="text" height={28} sx={{ marginBottom: '16px' }} />
              <Skeleton variant="text" height={16} sx={{ marginBottom: '24px' }} />
              <Skeleton variant="rectangular" height={200} />
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ paddingY: '40px' }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tenders')}
          sx={{ marginTop: '20px' }}
        >
          Retour aux appels d'offres
        </Button>
      </Container>
    );
  }

  if (!tender) {
    return (
      <Container maxWidth="md" sx={{ paddingY: '40px' }}>
        <Alert severity="info">Appel d'offres non trouvé</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tenders')}
          sx={{
            marginBottom: '24px',
            color: theme.palette.primary.main,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Retour
        </Button>

        <Card sx={{ marginBottom: '24px', borderRadius: '4px', boxShadow: 'none', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '32px' }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h2" sx={{ fontSize: '28px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '8px' }}>
                  {tender.title}
                </Typography>
                <Typography sx={{ color: '#616161', fontSize: '14px' }}>
                  ID: {tender.id}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Chip
                  label={tender.status}
                  sx={{
                    backgroundColor: tender.status === 'published' ? '#2e7d32' : theme.palette.primary.main,
                    color: '#ffffff',
                    fontWeight: 500,
                  }}
                />
              </Box>

              <Box sx={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
                <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '8px' }}>
                  Description
                </Typography>
                <Typography sx={{ color: '#616161', lineHeight: 1.6 }}>
                  {tender.description}
                </Typography>
              </Box>

              {offers.length > 0 && (
                <Box sx={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
                  <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '16px' }}>
                    Offres ({offers.length})
                  </Typography>
                  <Paper sx={{ overflow: 'auto', boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Fournisseur</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Prix</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {offers.map((offer) => (
                          <TableRow key={offer.id}>
                            <TableCell>{offer.supplier_name}</TableCell>
                            <TableCell>{offer.price} TND</TableCell>
                            <TableCell>{offer.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
