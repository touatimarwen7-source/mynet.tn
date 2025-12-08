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
  Chip,
  CircularProgress,
  Alert,
  Skeleton,
  Grid,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GavelIcon from '@mui/icons-material/Gavel';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { procurementAPI } from '../api';
import TenderInquiry from './TenderInquiry'; // 1. استيراد المكون الجديد
import TokenManager from '../services/tokenManager';
import { useFetchData } from '../hooks/useFetchData'; // ✅ 1. استيراد الخطاف
import { setPageTitle } from '../utils/pageTitle';

const TenderStatusChip = ({ status }) => {
  const statusInfo = {
    published: { label: 'Publié', color: 'success' },
    draft: { label: 'Brouillon', color: 'default' },
    closed: { label: 'Fermé', color: 'warning' },
    awarded: { label: 'Attribué', color: 'primary' },
  };
  const info = statusInfo[status] || { label: status, color: 'default' };
  return <Chip label={info.label} color={info.color} />;
};

export default function TenderDetail() {
  const theme = institutionalTheme;
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = TokenManager.getUserFromToken();
    setUser(userData);
    setPageTitle("Détails de l'Appel d'Offres");
  }, []);

  // ✅ 2. استخدام الخطاف لجلب بيانات المناقصة والعروض
  const {
    data: tenderData,
    loading: tenderLoading,
    error: tenderError,
  } = useFetchData(`/procurement/tenders/${id}`);
  const {
    data: offersData,
    loading: offersLoading,
    error: offersError,
  } = useFetchData(
    // جلب العروض فقط إذا كان المستخدم هو المشتري صاحب المناقصة
    user?.role === 'buyer' && tenderData?.tender?.user_id === user.id
      ? `/procurement/tenders/${id}/offers`
      : null
  );

  // ✅ 3. دمج حالات التحميل والأخطاء والبيانات
  const tender = tenderData?.tender;
  const offers = offersData?.offers || [];
  const loading = tenderLoading || offersLoading;
  const error = tenderError || offersError;

  const renderActionButtons = () => {
    if (!tender || !user) return null;

    const isOwner = tender?.user_id === user?.id;
    const canSubmitOffer = user.role === 'supplier' && tender.status === 'published';
    const isBeforeDeadline = new Date() < new Date(tender.submission_deadline);

    if (isOwner) {
      return (
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<CompareArrowsIcon />}
            onClick={() => navigate(`/bid-comparison/${id}`)}
            disabled={!offers || offers.length === 0}
          >
            Comparer les Offres ({offers?.length || 0})
          </Button>
          <Button
            variant="outlined"
            startIcon={<GavelIcon />}
            onClick={() => navigate(`/tender-awarding/${id}`)}
            disabled={tender.status !== 'closed'}
          >
            Attribuer le Marché
          </Button>
          {tender.status === 'published' && (
            <Button
              variant="outlined"
              color="warning"
              onClick={async () => {
                if (window.confirm('Voulez-vous vraiment clôturer cet appel d\'offres ?')) {
                  try {
                    await procurementAPI.closeTender(id);
                    window.location.reload();
                  } catch (error) {
                    console.error('Error closing tender:', error);
                  }
                }
              }}
            >
              Clôturer
            </Button>
          )}
        </Stack>
      );
    } else if (canSubmitOffer && isBeforeDeadline) {
      return (
        <Button
          variant="contained"
          startIcon={<NoteAddIcon />}
          onClick={() => navigate(`/tender/${id}/create-offer`)}
        >
          Soumettre une Offre
        </Button>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width="20%" height={40} />
        <Skeleton variant="text" width="60%" height={60} />
        <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Retour au Tableau de Bord
        </Button>
      </Container>
    );
  }

  if (!tender) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Appel d'offres non trouvé.</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', py: 4, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 3, color: theme.palette.primary.main }}
        >
          Retour
        </Button>

        <Paper sx={{ p: 4, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TenderStatusChip status={tender.status} />
              <Typography variant="h4" sx={{ ...theme.typography.h1, mt: 1, mb: 2 }}>
                {tender.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {tender.description}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2} divider={<Divider />}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date Limite de Soumission
                  </Typography>
                  <Typography fontWeight="bold">
                    {format(new Date(tender.submission_deadline), 'd MMMM yyyy, HH:mm', {
                      locale: fr,
                    })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Niveau d'Attribution
                  </Typography>
                  <Typography fontWeight="bold">
                    {tender.award_level === 'lot'
                      ? 'Par Lot'
                      : tender.award_level === 'article'
                        ? 'Par Article'
                        : 'Global'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Catégorie
                  </Typography>
                  <Typography fontWeight="bold">{tender.category || 'Non spécifiée'}</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            {renderActionButtons()}
          </Box>
        </Paper>

        {tender.lots && tender.lots.length > 0 && (
          <Paper sx={{ p: 4, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
              Lots et Articles
            </Typography>
            <Stack spacing={2}>
              {tender.lots.map((lot) => (
                <Paper key={lot.id} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Lot {lot.numero}: {lot.objet}
                  </Typography>
                  {lot.articles && lot.articles.length > 0 && (
                    <Table size="small" sx={{ mt: 1 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Article</TableCell>
                          <TableCell align="right">Quantité</TableCell>
                          <TableCell>Unité</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lot.articles.map((article) => (
                          <TableRow key={article.id}>
                            <TableCell>{article.name}</TableCell>
                            <TableCell align="right">{article.quantity}</TableCell>
                            <TableCell>{article.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Paper>
              ))}
            </Stack>
          </Paper>
        )}

        {user?.role === 'buyer' && offers.length > 0 && (
          <Paper sx={{ p: 4, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
              Offres Reçues ({offers.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fournisseur</TableCell>
                    <TableCell align="right">Montant Total</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date de Soumission</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{offer.supplier_name}</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat('fr-TN', {
                          style: 'currency',
                          currency: 'TND',
                        }).format(offer.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Chip label={offer.status} size="small" />
                      </TableCell>
                      <TableCell>
                        {format(new Date(offer.created_at), 'd MMM yyyy', { locale: fr })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* 2. إضافة قسم الأسئلة والأجوبة */}
        <Paper sx={{ p: 4, mt: 3, border: `1px solid ${theme.palette.divider}` }}>
          <TenderInquiry tenderId={id} />
        </Paper>
      </Container>
    </Box>
  );
}
