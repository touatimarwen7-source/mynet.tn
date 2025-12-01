import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Paper,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Breadcrumbs,
  Link,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import WarningIcon from '@mui/icons-material/Warning';
import { TableSkeleton } from '../components/SkeletonLoader'; // ✅ استيراد مكون الهيكل
import { procurementAPI } from '../api'; // ✅ استيراد واجهة برمجة التطبيقات
import { setPageTitle } from '../utils/pageTitle'; // ✅ استيراد دالة تحديث عنوان الصفحة

export default function TenderAwarding() {
  const theme = institutionalTheme;
  const { tenderId } = useParams();
  const navigate = useNavigate();
  
  const [tender, setTender] = useState(null);
  const [offers, setOffers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    setPageTitle("Attribution de l'Appel d'Offres - Annonce du Gagnant");
    loadData();
  }, [tenderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const tenderRes = await procurementAPI.getTender(tenderId);
      const offersRes = await procurementAPI.getOffers(tenderId);
      
      const tenderData = tenderRes.data.tender;
      const offersData = offersRes.data.offers || [];
      
      setTender(tenderData);
      setOffers(offersData);
      
      // إذا كان هناك فائز بالفعل، استرجعه
      const winningOffer = offersData.find(o => o.is_winner);
      if (winningOffer) {
        setWinner(winningOffer);
      }
    } catch (err) {
      setError('Erreur lors du chargement des données : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAwardTender = async () => {
    if (!winner) {
      setError("Veuillez sélectionner une offre gagnante.");
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await procurementAPI.selectWinner(winner.id, {
        tender_id: tenderId,
        award_date: new Date().toISOString(),
      });
      
      // تحديث البيانات
      setConfirmDialog(false);
      await loadData();
      
      // عرض رسالة النجاح
      // In a real app, a toast notification would be better.
      alert('✅ Le gagnant a été annoncé avec succès !');
    } catch (err) => {
      setError("Erreur lors de l'annonce du gagnant : " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
        <Container maxWidth="lg">
          <TableSkeleton rows={3} columns={5} />
        </Container>
      </Box>
    );
  }

  const sortedOffers = [...offers].sort((a, b) => 
    (b.evaluation_score || 0) - (a.evaluation_score || 0)
  );

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs sx={{ mb: '24px' }}>
          <Link 
            component="button"
            onClick={() => navigate('/tenders')}
            sx={{ cursor: 'pointer', color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Appels d'offres
          </Link>
          <Link
            component="button"
            onClick={() => navigate(`/tender/${tenderId}`)}
            sx={{ cursor: 'pointer', color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Appel d'offres
          </Link>
          <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
            Annonce du Gagnant
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', mb: '16px' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/tender/${tenderId}`)}
              sx={{ color: theme.palette.primary.main, textTransform: 'none' }}
            >
              Retour
            </Button>
          </Box>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: '32px', 
              fontWeight: 600, 
              color: theme.palette.primary.main, 
              mb: '8px' 
            }}
          >
            🏆 Annonce du Gagnant - Attribution de l'Appel d'Offres
          </Typography>
          {tender && (
            <Box>
              <Typography sx={{ fontSize: '14px', color: '#0056B3', mb: '8px', fontWeight: 700 }}>
                🔐 ID Référence (Plateforme): <strong>{tender.id || 'N/A'}</strong>
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#666666', mb: '4px' }}>
                <strong>N° Consultation:</strong> {tender.consultation_number}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#666666', mb: '8px' }}>
                {tender.title}
              </Typography>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: '24px', backgroundColor: '#FFEBEE', color: '#C62828' }}>
            {error}
          </Alert>
        )}

        {/* Winner Announcement */}
        {winner ? (
          <Stack spacing={3}>
            {/* Winner Card */}
            <Card sx={{ 
              border: '3px solid #4CAF50', 
              backgroundColor: '#E8F5E9',
              borderRadius: '8px'
            }}>
              <CardContent sx={{ padding: '24px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '16px' }}>
                  <CheckCircleIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
                  <Typography sx={{ fontSize: '20px', fontWeight: 600, color: '#2E7D32' }}>
                    ✅ Le gagnant a été sélectionné
                  </Typography>
                </Box>

                <Paper sx={{ p: '16px', backgroundColor: '#fff', border: '1px solid #4CAF50' }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                        Fournisseur Gagnant
                      </Typography>
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3' }}>
                        {winner.supplier_name || 'N/A'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                          Montant Total
                        </Typography>
                        <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#0056B3' }}>
                          {parseFloat(winner.total_amount || 0).toFixed(2)} {winner.currency || 'TND'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                          Score d'Évaluation
                        </Typography>
                        <Chip 
                          label={`${winner.evaluation_score?.toFixed(1) || 0}/100`}
                          color="success"
                          sx={{ fontSize: '14px', fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Paper>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ mt: '24px' }}>
                  <Button
                    variant="contained"
                    startIcon={<VerifiedUserIcon />}
                    onClick={() => setConfirmDialog(true)}
                    disabled={submitting}
                    sx={{
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 600,
                      flex: 1,
                      '&:hover': { backgroundColor: '#388E3C' },
                    }}
                  >
                    {submitting ? 'Annonce en cours...' : '✅ Confirmer et Annoncer le Gagnant'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setWinner(null)}
                    disabled={submitting}
                    sx={{
                      color: theme.palette.primary.main,
                      borderColor: theme.palette.primary.main,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Changer de sélection
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        ) : (
          /* Choose Winner Section */
          <Card sx={{ border: '1px solid #E0E0E0' }}>
            <CardContent sx={{ padding: '24px' }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3', mb: '20px' }}>
                🎯 Sélectionnez l'Offre Gagnante
              </Typography>

              {sortedOffers.length === 0 ? (
                <Alert severity="info">Aucune offre n'a été reçue pour cet appel d'offres.</Alert>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Fournisseur</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Montant</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Livraison</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Score</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedOffers.map((offer, idx) => (
                        <TableRow key={offer.id} sx={{ '&:hover': { backgroundColor: '#E3F2FD' } }}>
                          <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>{offer.supplier_name || 'N/A'}</TableCell>
                          <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: theme.palette.primary.main }}>
                            {parseFloat(offer.total_amount || 0).toFixed(2)} TND
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{offer.delivery_time || 'N/A'}</TableCell>
                          <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                            <Chip
                              label={`${offer.evaluation_score?.toFixed(1) || 0}/100`}
                              color={offer.evaluation_score >= 70 ? 'success' : 'warning'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => setWinner(offer)}
                              disabled={submitting}
                              sx={{
                                backgroundColor: '#4CAF50',
                                color: '#fff',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#388E3C' },
                              }}
                            >
                              Sélectionner
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '18px', fontWeight: 600, color: '#D32F2F', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WarningIcon /> Confirmation de l'Annonce du Gagnant
        </DialogTitle>
        <DialogContent sx={{ pt: '16px' }}>
          <Alert severity="error" sx={{ mb: '16px' }}>
            ⚠️ Cette action est définitive et irréversible.
          </Alert>
          <Stack spacing={2}>
            <Typography sx={{ fontSize: '14px', color: '#212121' }}>
              Voulez-vous annoncer <strong style={{ color: '#0056B3' }}>{winner?.supplier_name}</strong> comme gagnant ?
            </Typography>
            <Paper sx={{ p: '12px', backgroundColor: '#E8F5E9', border: '1px solid #4CAF50' }}>
              <Stack spacing={1}>
                <Typography sx={{ fontSize: '12px', color: '#2E7D32', fontWeight: 600 }}>
                  💰 Montant : {parseFloat(winner?.total_amount || 0).toFixed(2)} TND
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#2E7D32' }}>
                  🚚 Livraison : {winner?.delivery_time || 'N/A'}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#2E7D32' }}>
                  ⭐ Évaluation : {winner?.evaluation_score?.toFixed(1) || 0}/100
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: '16px' }}>
          <Button 
            onClick={() => setConfirmDialog(false)}
            disabled={submitting}
            sx={{ color: theme.palette.primary.main }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleAwardTender}
            disabled={submitting}
            sx={{
              backgroundColor: '#D32F2F',
              '&:hover': { backgroundColor: '#B71C1C' },
              '&:disabled': { backgroundColor: '#BDBDBD' },
            }}
          >
            {submitting ? 'En cours...' : '✓ Confirmer l'Annonce'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}