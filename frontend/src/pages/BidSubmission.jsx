import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function BidSubmission() {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [bidData, setBidData] = useState({
    price: '', delivery_days: '', quality_score: '', compliance: '', documents: []
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPageTitle('Soumission d\'Offre');
    fetchTender();
  }, [tenderId]);

  const fetchTender = async () => {
    try {
      const res = await procurementAPI.getTender(tenderId);
      setTender(res.data.tender);
    } catch (error) {
      setError('Erreur lors du chargement de l\'appel d\'offres');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bidData.price || !bidData.delivery_days) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await procurementAPI.createOffer({ tender_id: tenderId, ...bidData });
      navigate('/my-offers');
    } catch (error) {
      setError('Erreur lors de la soumission: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#1565c0' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="md">
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '32px' }}>
            <Typography variant="h2" sx={{ fontSize: '28px', fontWeight: 500, color: '#212121', marginBottom: '8px' }}>
              📝 Soumission d'Offre
            </Typography>
            <Typography sx={{ color: '#616161', marginBottom: '24px' }}>
              {tender?.title}
            </Typography>

            {error && <Alert severity="error" sx={{ marginBottom: '24px' }}>{error}</Alert>}

            <Card sx={{ backgroundColor: '#f5f5f5', marginBottom: '32px', border: 'none' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161', marginBottom: '4px' }}>
                      Budget Estimé
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#1565c0' }}>
                      {tender?.budget_max?.toLocaleString()} TND
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161', marginBottom: '4px' }}>
                      Catégorie
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#1565c0' }}>
                      {tender?.category}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161', marginBottom: '4px' }}>
                      Date Limite
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#1565c0' }}>
                      {new Date(tender?.deadline).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField
                fullWidth
                label="Prix Proposé (TND)"
                type="number"
                value={bidData.price}
                onChange={(e) => setBidData({...bidData, price: e.target.value})}
                disabled={submitting}
                required
              />

              <TextField
                fullWidth
                label="Délai de Livraison (jours)"
                type="number"
                value={bidData.delivery_days}
                onChange={(e) => setBidData({...bidData, delivery_days: e.target.value})}
                disabled={submitting}
                required
              />

              <TextField
                fullWidth
                label="Score de Qualité (%)"
                type="number"
                min="0"
                max="100"
                value={bidData.quality_score}
                onChange={(e) => setBidData({...bidData, quality_score: e.target.value})}
                disabled={submitting}
              />

              <TextField
                fullWidth
                label="Conformité"
                multiline
                rows={4}
                value={bidData.compliance}
                onChange={(e) => setBidData({...bidData, compliance: e.target.value})}
                disabled={submitting}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginTop: '16px' }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    flex: 1,
                    backgroundColor: '#2e7d32',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                    '&:hover': { backgroundColor: '#1b5e20' },
                  }}
                >
                  {submitting ? 'Soumission en cours...' : 'Soumettre l\'Offre'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/tenders')}
                  disabled={submitting}
                  startIcon={<CancelIcon />}
                  sx={{
                    flex: 1,
                    color: '#1565c0',
                    borderColor: '#1565c0',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                  }}
                >
                  Annuler
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
