import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
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
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Skeleton,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';
import { FRENCH_LABELS, useConsistentTheme, CONSISTENT_SX } from '../utils/consistencyHelper';
import { autosaveDraft, recoverDraft, clearDraft } from '../utils/draftStorageHelper';

// Sub-component for the page header
const BidSubmissionHeader = ({ tender, onBack, sx, theme }) => (
  <Box sx={{ mb: 4 }}>
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={onBack}
      sx={{ color: theme.palette.primary.main, textTransform: 'none', mb: '16px' }}
    >
      {FRENCH_LABELS.retour}
    </Button>
    <Typography 
      variant="h4" 
      sx={{ 
        fontSize: '32px', 
        fontWeight: 600, 
        color: theme.palette.primary.main,
        mb: '8px'
      }}
    >
      📝 {FRENCH_LABELS.soumettre_offre}
    </Typography>
    {tender && (
      <Box>
        <Typography sx={{ fontSize: '14px', color: '#0056B3', mb: '8px', fontWeight: 700 }}>
          🔐 ID Référence (Plateforme): <strong>{tender.id || 'N/A'}</strong>
        </Typography>
        <Typography sx={{ fontSize: '13px', color: '#666666', mb: '4px' }}>
          <strong>N° Consultation:</strong> {tender.consultation_number}
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#666666' }}>
          {tender.title}
        </Typography>
      </Box>
    )}
  </Box>
);

// Sub-component for the line items table
const LineItemsTable = ({ items, onPriceChange, calculateItemTotal, calculateTotalAmount, submitting, sx }) => (
  <Card sx={sx.card}>
    <CardContent>
      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
        📦 {FRENCH_LABELS.lots_et_articles}
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
            <TableRow>
              <TableCell sx={sx.tableHeader}>{FRENCH_LABELS.lot}</TableCell>
              <TableCell sx={sx.tableHeader}>{FRENCH_LABELS.article}</TableCell>
              <TableCell sx={{ ...sx.tableHeader, textAlign: 'center' }}>{FRENCH_LABELS.quantite}</TableCell>
              <TableCell sx={{ ...sx.tableHeader, textAlign: 'center' }}>{FRENCH_LABELS.unite}</TableCell>
              <TableCell sx={{ ...sx.tableHeader, textAlign: 'center' }}>{FRENCH_LABELS.prix_unitaire} (TND)</TableCell>
              <TableCell sx={{ ...sx.tableHeader, textAlign: 'center' }}>{FRENCH_LABELS.total} (TND)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow 
                key={idx} 
                sx={{ 
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#F9F9F9',
                  '&:hover': { backgroundColor: '#E3F2FD' }
                }}
              >
                <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>
                  Lot {item.lot_id}
                  <br />
                  <span style={{ color: '#666666', fontSize: '11px', fontWeight: 'normal' }}>
                    {item.lot_objet}
                  </span>
                </TableCell>
                <TableCell sx={{ fontSize: '12px' }}>{item.article_name}</TableCell>
                <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>{item.quantity}</TableCell>
                <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>{item.unit}</TableCell>
                <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>
                  <TextField
                    type="number"
                    size="small"
                    value={item.unit_price}
                    onChange={(e) => onPriceChange(idx, e.target.value)}
                    disabled={submitting}
                    inputProps={{ step: '0.01', min: '0' }}
                    sx={{ width: '100px' }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#0056B3', textAlign: 'center' }}>
                  {calculateItemTotal(idx)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: '#E3F2FD', borderTop: '2px solid #0056B3' }}>
              <TableCell colSpan={5} sx={{ fontWeight: 600, color: '#0056B3', textAlign: 'right', fontSize: '14px' }}>
                {FRENCH_LABELS.total_general}:
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#0056B3', textAlign: 'center', fontSize: '14px' }}>
                {calculateTotalAmount()} TND
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </CardContent>
  </Card>
);

// Sub-component for the loading skeleton
const BidSubmissionSkeleton = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <Container maxWidth="lg" sx={{ paddingY: '40px' }}>
      <Stack spacing={4}>
        <Box>
          <Skeleton variant="text" width={120} height={40} />
          <Skeleton variant="text" width="60%" height={48} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height={118} />
        <Skeleton variant="rectangular" width="100%" height={200} />
        <Skeleton variant="rectangular" width="100%" height={150} />
        <Skeleton variant="rectangular" width="100%" height={150} />
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rectangular" width="50%" height={44} />
          <Skeleton variant="rectangular" width="50%" height={44} />
        </Stack>
      </Stack>
    </Container>
  </Box>
);

// ✅ New Sub-component for Supplier Info
const SupplierInfoForm = ({ data, onChange, submitting, sx, errors }) => (
  <Card sx={sx.card}>
    <CardContent>
      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
        👤 {FRENCH_LABELS.informations_fournisseur}
      </Typography>
      <Stack spacing={2}>
        <TextField 
          fullWidth 
          label={FRENCH_LABELS.nom_fournisseur} 
          name="supplier_name" 
          value={data.supplier_name} 
          onChange={onChange} 
          disabled={submitting} 
          variant="outlined" 
          size="small" 
          required 
          error={!!errors.supplier_name}
          helperText={errors.supplier_name}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <TextField fullWidth label={FRENCH_LABELS.email_fournisseur} name="supplier_email" type="email" value={data.supplier_email} onChange={onChange} disabled={submitting} variant="outlined" size="small" required 
            error={!!errors.supplier_email}
            helperText={errors.supplier_email}
          />
          <TextField fullWidth label={FRENCH_LABELS.telephone_fournisseur} name="supplier_phone" value={data.supplier_phone} onChange={onChange} disabled={submitting} variant="outlined" size="small" required 
            error={!!errors.supplier_phone}
            helperText={errors.supplier_phone}
          />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// ✅ New Sub-component for Delivery & Payment
const DeliveryPaymentForm = ({ data, onChange, submitting, sx, errors }) => (
  <Card sx={sx.card}>
    <CardContent>
      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
        🚚 {FRENCH_LABELS.livraison_et_paiement}
      </Typography>
      <Stack spacing={2}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <TextField fullWidth label={FRENCH_LABELS.delai_livraison_exemple} name="delivery_time" value={data.delivery_time} onChange={onChange} disabled={submitting} variant="outlined" size="small" required 
            error={!!errors.delivery_time}
            helperText={errors.delivery_time}
          />
          <TextField fullWidth label={FRENCH_LABELS.conditions_paiement_exemple} name="payment_terms" value={data.payment_terms} onChange={onChange} disabled={submitting} variant="outlined" size="small" required 
            error={!!errors.payment_terms}
            helperText={errors.payment_terms}
          />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// ✅ New Sub-component for Notes
const NotesForm = ({ data, onChange, submitting, sx }) => (
  <Card sx={sx.card}>
    <CardContent>
      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
        📝 {FRENCH_LABELS.notes_et_qualite}
      </Typography>
      <TextField fullWidth label={FRENCH_LABELS.notes_qualite_placeholder} name="quality_notes" value={data.quality_notes} onChange={onChange} disabled={submitting} multiline rows={4} variant="outlined" />
    </CardContent>
  </Card>
);

export default function BidSubmission() {
  const { theme, sx } = useConsistentTheme();
  const { tenderId } = useParams();
  const navigate = useNavigate();
  
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({}); // 💡 1. تغيير حالة الخطأ إلى كائن
  const [confirmDialog, setConfirmDialog] = useState(false);

  // Form Data
  const [bidData, setBidData] = useState({
    // ✅ Centralized state for all bid-related data
    supplier_name: '',
    supplier_email: '',
    supplier_phone: '',
    delivery_time: '',
    payment_terms: '',
    quality_notes: '',
    line_items: [], // Array of {article_id, quantity, unit_price}
  });

  useEffect(() => {
    setPageTitle('Soumission d\'Offre');
    // ✅ Recover draft on component mount
    const draft = recoverDraft(`bid_draft_${tenderId}`);
    if (draft) {
      setBidData(draft);
    }
    fetchTender();
  }, [tenderId]);

  const fetchTender = async () => {
    try {
      setLoading(true);
      const res = await procurementAPI.getTender(tenderId);
      const tenderData = res.data.tender;
      setTender(tenderData);

      // Initialize line items from lots/articles
      if (tenderData.lots && tenderData.lots.length > 0) {
        const items = [];
        tenderData.lots.forEach((lot) => {
          if (lot.articles && lot.articles.length > 0) {
            lot.articles.forEach((article) => {
              items.push({
                lot_id: lot.numero,
                lot_objet: lot.objet,
                article_id: article.id || `${lot.numero}-${article.name}`,
                article_name: article.name,
                quantity: article.quantity,
                unit: article.unit,
                unit_price: '',
              });
            });
          }
        });
        setBidData((prev) => ({ ...prev, line_items: items }));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setFormErrors({ general:
        `Impossible de charger les détails de l'appel d'offres. ` +
        `Veuillez vérifier votre connexion ou contacter le support si le problème persiste. ` +
        `Détail: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBidData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (index, value) => {
    const updatedItems = [...bidData.line_items];
    updatedItems[index].unit_price = parseFloat(value) || '';
    setBidData((prev) => ({ ...prev, line_items: updatedItems }));
  };

  const calculateItemTotal = (index) => {
    const item = bidData.line_items[index];
    if (item.unit_price && item.quantity) {
      return (parseFloat(item.unit_price) * parseFloat(item.quantity)).toFixed(2);
    }
    return '0.00';
  };

  const calculateTotalAmount = () => {
    return bidData.line_items
      .reduce((sum, item) => {
        const total = item.unit_price && item.quantity ? parseFloat(item.unit_price) * parseFloat(item.quantity) : 0;
        return sum + total;
      }, 0)
      .toFixed(2);
  };

  // 💡 2. تحديث دالة التحقق من الصحة
  const validateForm = () => {
    const newErrors = {};

    if (!bidData.supplier_name.trim()) {
      newErrors.supplier_name = FRENCH_LABELS.validation_nom_fournisseur_requis;
    }
    if (!bidData.supplier_email.trim()) {
      newErrors.supplier_email = FRENCH_LABELS.validation_email_fournisseur_requis;
    }
    if (!bidData.supplier_phone.trim()) {
      newErrors.supplier_phone = FRENCH_LABELS.validation_telephone_fournisseur_requis;
    }
    if (!bidData.delivery_time.trim()) {
      newErrors.delivery_time = FRENCH_LABELS.validation_delai_livraison_requis;
    }
    if (!bidData.payment_terms.trim()) {
      newErrors.payment_terms = FRENCH_LABELS.validation_conditions_paiement_requises;
    }

    // Check if all prices are filled
    const allPricesFilled = bidData.line_items.every((item) => item.unit_price && item.unit_price > 0);
    if (!allPricesFilled) {
      newErrors.line_items = FRENCH_LABELS.validation_prix_articles_requis;
    }

    setFormErrors(newErrors);
    // The form is valid if the newErrors object is empty
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // إذا كان هناك خطأ عام (مثل خطأ في تحميل البيانات)، اعرضه
      // وإلا، اعرض رسالة للمستخدم لمراجعة الحقول
      setFormErrors(prev => ({ ...prev, general: prev.general || 'Veuillez corriger les erreurs dans le formulaire.' }));
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await procurementAPI.createOffer({
        tender_id: tenderId,
        supplier_name: bidData.supplier_name,
        supplier_email: bidData.supplier_email,
        supplier_phone: bidData.supplier_phone,
        total_amount: calculateTotalAmount(),
        currency: 'TND',
        delivery_time: bidData.delivery_time,
        payment_terms: bidData.payment_terms,
        quality_notes: bidData.quality_notes,
        line_items: bidData.line_items,
      });

      clearDraft(`bid_draft_${tenderId}`); // ✅ Clear draft on successful submission
      setConfirmDialog(false);
      navigate('/my-offers', {
        state: { message: FRENCH_LABELS.offre_soumise_succes },
      });
    } catch (err) {
      setFormErrors({ general: `${FRENCH_LABELS.erreur_soumission_offre}: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <BidSubmissionSkeleton sx={sx} />;
  }

  // ✅ Handle case where tender could not be loaded
  if (!tender && !loading) {
    return (
      <Box sx={{ ...sx.pageContainer, textAlign: 'center', pt: 8 }}>
        <Container maxWidth="sm">
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            😕 Appel d'Offres Introuvable
          </Typography>
          <Typography sx={{ mb: 3, color: 'text.secondary' }}>
            {formErrors.general || "Nous n'avons pas pu charger les détails de cet appel d'offres. Il a peut-être été supprimé ou l'URL est incorrecte."}
          </Typography>
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/tenders')}>
            Retour à la liste des appels d'offres
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ ...sx.pageContainer, backgroundColor: sx.palette.background.default }}>
      <Container maxWidth="lg">
        {/* Header */}
        <BidSubmissionHeader 
          tender={tender} 
          onBack={() => navigate(`/tender/${tenderId}`)}
          sx={sx}
          theme={theme}
        />

        {(formErrors.general || formErrors.line_items) && (
          <Alert severity="error" sx={{ ...sx.errorAlert, mb: 3 }}>
            {formErrors.general || formErrors.line_items}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Tender Summary */}
          <Card sx={sx.card}>
            <CardContent>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
                📊 {FRENCH_LABELS.resume_appel_offres}
              </Typography>
              <Grid container spacing={2} sx={{ width: '100%' }}>
                <Grid item xs={12} lg={3}>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                      {FRENCH_LABELS.categorie}
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3' }}>
                      {tender?.category || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} lg={3}>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                      {FRENCH_LABELS.date_limite}
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0056B3' }}>
                      {tender?.deadline ? new Date(tender.deadline).toLocaleDateString('ar-TN') : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} lg={3}>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666666', mb: '4px', fontWeight: 600 }}>
                      {FRENCH_LABELS.nombre_lots}
                    </Typography>
                    <Chip 
                      label={`${tender?.lots?.length || 0} Lot`}
                      size="small"
                      sx={{ backgroundColor: '#E3F2FD', color: '#0056B3' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Lots & Articles */}
          {bidData.line_items.length > 0 && (
            <LineItemsTable
              items={bidData.line_items}
              onPriceChange={handlePriceChange}
              calculateItemTotal={calculateItemTotal}
              calculateTotalAmount={calculateTotalAmount}
              submitting={submitting}
              sx={sx}
            />
          )}

          {/* Supplier Information */}
          <SupplierInfoForm 
            data={bidData}
            onChange={handleInputChange}
            submitting={submitting}
            sx={sx}
            errors={formErrors}
          />

          {/* Delivery & Payment */}
          <DeliveryPaymentForm
            data={bidData}
            onChange={handleInputChange}
            submitting={submitting}
            sx={sx}
            errors={formErrors}
          />

          {/* Quality Notes */}
          <NotesForm
            data={bidData}
            onChange={handleInputChange}
            submitting={submitting}
            sx={sx}
          />

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => setConfirmDialog(true)}
              disabled={submitting}
              sx={sx.buttons.primary}
            >
              {submitting ? FRENCH_LABELS.soumission_en_cours : `✅ ${FRENCH_LABELS.soumettre_offre}`}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate(`/tender/${tenderId}`)}
              disabled={submitting}
              sx={sx.buttons.secondary}
            >
              {FRENCH_LABELS.annuler}
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '18px', fontWeight: 600, color: '#0056B3' }}>✅ {FRENCH_LABELS.confirmer_soumission_offre}
        </DialogTitle>
        <DialogContent sx={{ pt: '16px' }}>
          <Typography sx={{ fontSize: '14px', color: '#212121', mb: '12px' }}>
            {FRENCH_LABELS.voulez_vous_confirmer_soumission}
          </Typography>
          <Paper sx={{ p: '12px', backgroundColor: '#F9F9F9' }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '12px', color: '#666666' }}>{FRENCH_LABELS.fournisseur}:</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121' }}>
                  {bidData.supplier_name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '12px', color: '#666666' }}>{FRENCH_LABELS.montant_total}:</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#0056B3' }}>
                  {calculateTotalAmount()} TND
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '12px', color: '#666666' }}>{FRENCH_LABELS.livraison}:</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121' }}>
                  {bidData.delivery_time}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '12px', color: '#666666' }}>{FRENCH_LABELS.nombre_articles}:</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121' }}>
                  {bidData.line_items.length}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog(false)}
            disabled={submitting}
          >
            {FRENCH_LABELS.annuler}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={sx.buttons.primary}
          >
            {submitting ? FRENCH_LABELS.en_cours : FRENCH_LABELS.confirmer}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
