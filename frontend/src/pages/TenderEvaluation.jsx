import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
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
  CircularProgress,
  Alert,
  Slider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function TenderEvaluation() {
  const theme = institutionalTheme;
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scores, setScores] = useState({});
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Evaluation criteria with default weights
  const [criteria] = useState({
    price: { label: 'Prix', weight: 40, description: 'Compétitivité du prix proposé' },
    compliance: { label: 'Conformité', weight: 30, description: 'Respect des conditions requises' },
    delivery: { label: 'Délai de Livraison', weight: 20, description: 'Rapidité de livraison' },
    quality: { label: 'Qualité', weight: 10, description: 'Qualité des produits/services' },
  });

  useEffect(() => {
    setPageTitle('Évaluation des Offres');
    loadData();
  }, [tenderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const tenderRes = await procurementAPI.getTender(tenderId);
      const offersRes = await procurementAPI.getOffers(tenderId);

      setTender(tenderRes.data.tender);
      setOffers(offersRes.data.offers || []);

      // Initialize scores
      const initialScores = {};
      (offersRes.data.offers || []).forEach((offer) => {
        initialScores[offer.id] = {
          price: 0,
          compliance: 0,
          delivery: 0,
          quality: 0,
          notes: '',
        };
      });
      setScores(initialScores);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (offerId, criterion, value) => {
    setScores((prev) => ({
      ...prev,
      [offerId]: {
        ...prev[offerId],
        [criterion]: value,
      },
    }));
  };

  const calculateTotalScore = (offerId) => {
    const offerScores = scores[offerId] || {};
    const total =
      (offerScores.price || 0) * (criteria.price.weight / 100) +
      (offerScores.compliance || 0) * (criteria.compliance.weight / 100) +
      (offerScores.delivery || 0) * (criteria.delivery.weight / 100) +
      (offerScores.quality || 0) * (criteria.quality.weight / 100);
    return total.toFixed(2);
  };

  const getRanking = () => {
    return offers
      .map((offer) => ({
        ...offer,
        score: parseFloat(calculateTotalScore(offer.id)),
      }))
      .sort((a, b) => b.score - a.score);
  };

  const handleSelectWinner = async (offerId) => {
    try {
      setLoading(true);
      await procurementAPI.selectWinner(offerId, {
        scores: scores[offerId],
        tender_id: tenderId,
      });
      navigate(`/tender/${tenderId}`);
    } catch (err) {
      setError('Erreur lors de la sélection du fournisseur');
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

  const ranking = getRanking();

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/tender/${tenderId}`)}
            sx={{ color: theme.palette.primary.main, textTransform: 'none', mb: '16px' }}
          >
            Retour
          </Button>
          <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: theme.palette.primary.main, mb: '8px' }}>
            📊 Évaluation des Offres
          </Typography>
          {tender && (
            <Typography sx={{ fontSize: '14px', color: '#666666' }}>
              {tender.title} - {offers.length} offre(s) reçue(s)
            </Typography>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: '24px' }}>{error}</Alert>}

        {/* Criteria Weights */}
        <Card sx={{ border: '1px solid #E0E0E0', mb: '32px' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
              🎯 Critères d'Évaluation
            </Typography>
            <Stack spacing={2}>
              {Object.entries(criteria).map(([key, criterion]) => (
                <Box key={key} sx={{ p: '16px', backgroundColor: '#F9F9F9', borderRadius: '4px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '8px' }}>
                    <Box>
                      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#212121' }}>
                        {criterion.label}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#666666' }}>
                        {criterion.description}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3' }}>
                      {criterion.weight}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Offers Evaluation */}
        <Card sx={{ border: '1px solid #E0E0E0' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
              💰 Évaluation des Offres
            </Typography>

            {offers.length === 0 ? (
              <Alert severity="info">Aucune offre reçue pour cette marchandise</Alert>
            ) : (
              <Stack spacing={2}>
                {offers.map((offer) => (
                  <Paper key={offer.id} sx={{ p: '16px', border: '1px solid #E0E0E0' }}>
                    <Box sx={{ mb: '16px' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: '12px' }}>
                        <Box>
                          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#212121' }}>
                            {offer.supplier_name || 'N/A'}
                          </Typography>
                          <Typography sx={{ fontSize: '12px', color: '#666666' }}>
                            Offre ID: {offer.id}
                          </Typography>
                          <Typography sx={{ fontSize: '12px', color: '#666666' }}>
                            Montant: {parseFloat(offer.total_amount || 0).toFixed(2)} TND
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#0056B3',
                            p: '8px 12px',
                            backgroundColor: '#E3F2FD',
                            borderRadius: '4px',
                          }}
                        >
                          Score: {calculateTotalScore(offer.id)}/100
                        </Typography>
                      </Box>

                      {/* Scoring Sliders */}
                      <Stack spacing={2}>
                        {Object.entries(criteria).map(([key, criterion]) => (
                          <Box key={key}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '8px' }}>
                              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121' }}>
                                {criterion.label}
                              </Typography>
                              <Typography sx={{ fontSize: '12px', color: '#0056B3', fontWeight: 600 }}>
                                {scores[offer.id]?.[key] || 0}/100
                              </Typography>
                            </Box>
                            <Slider
                              value={scores[offer.id]?.[key] || 0}
                              onChange={(e, value) => handleScoreChange(offer.id, key, value)}
                              min={0}
                              max={100}
                              step={5}
                              disabled={loading}
                              sx={{
                                '& .MuiSlider-track': { backgroundColor: '#0056B3' },
                                '& .MuiSlider-thumb': { backgroundColor: '#0056B3' },
                              }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setFeedbackDialog(true);
                        }}
                        sx={{ textTransform: 'none', color: '#0056B3', borderColor: '#0056B3' }}
                      >
                        Ajouter des commentaires
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleSelectWinner(offer.id)}
                        disabled={loading}
                        sx={{ backgroundColor: '#4caf50', color: '#fff', textTransform: 'none' }}
                      >
                        Sélectionner
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Ranking Summary */}
        {offers.length > 0 && (
          <Card sx={{ border: '1px solid #E0E0E0', mt: '32px' }}>
            <CardContent sx={{ padding: '24px' }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
                🏆 Classement des Offres
              </Typography>

              <Table>
                <TableHead sx={{ backgroundColor: '#F9F9F9' }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>Rang</TableCell>
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>Fournisseur</TableCell>
                    <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 600 }}>Montant</TableCell>
                    <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 600 }}>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ranking.map((offer, index) => (
                    <TableRow key={offer.id} sx={{ backgroundColor: index === 0 ? '#E8F5E9' : 'inherit' }}>
                      <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: index === 0 ? '#2E7D32' : '#212121' }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', color: '#212121' }}>
                        {offer.supplier_name || 'N/A'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '13px', color: '#212121' }}>
                        {parseFloat(offer.total_amount || 0).toFixed(2)} TND
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '13px', fontWeight: 600, color: '#0056B3' }}>
                        {offer.score}/100
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          Commentaires pour {selectedOffer?.supplier_name}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Vos commentaires"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            sx={{ mt: '16px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Annuler</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: theme.palette.primary.main, color: '#fff' }}
            onClick={() => {
              setFeedback('');
              setFeedbackDialog(false);
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
