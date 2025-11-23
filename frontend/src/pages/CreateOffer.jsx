import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Checkbox,
  FormControlLabel,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { FormSkeleton } from '../components/Common/SkeletonLoader';
import { procurementAPI } from '../api';
import { useToast } from '../contexts/AppContext';
import { setPageTitle } from '../utils/pageTitle';
import { autosaveDraft, recoverDraft, clearDraft } from '../utils/draftStorageHelper';

export default function CreateOffer() {
  const theme = institutionalTheme;
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    setPageTitle('Soumission d\'Offre Sécurisée');
  }, []);

  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(0);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [selectedLineItemIndex, setSelectedLineItemIndex] = useState(null);
  const [catalogProducts, setCatalogProducts] = useState([]);

  const isDeadlinePassed = tender && new Date() > new Date(tender.deadline);

  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [offerData, setOfferData] = useState({
    supplier_ref_number: '',
    validity_period_days: 30,
    payment_terms: 'Net30',
    technical_proposal: '',
    line_items: [],
    attachments: [],
    commitment: false
  });

  useEffect(() => {
    fetchTender();
    // Recover draft
    const draft = recoverDraft(`offer_draft_${tenderId}`);
    if (draft) {
      setOfferData(draft);
    }
  }, [tenderId]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      autosaveDraft(`offer_draft_${tenderId}`, offerData);
    }, 30000);
    
    return () => clearInterval(timer);
  }, [offerData, tenderId]);

  const fetchTender = async () => {
    try {
      const response = await procurementAPI.getTender(tenderId);
      setTender(response.data.tender);
      
      // Use Lots/Articles instead of requirements
      const lots = response.data.tender.lots || [];
      const items = [];
      
      if (lots.length > 0) {
        lots.forEach((lot, lotIdx) => {
          if (lot.articles && lot.articles.length > 0) {
            lot.articles.forEach((article, artIdx) => {
              items.push({
                id: `${lotIdx}-${artIdx}`,
                lot_id: lot.numero,
                lot_name: lot.objet,
                description: article.name,
                quantity: parseFloat(article.quantity) || 1,
                unit: article.unit || 'unité',
                unit_price: '',
                total_price: 0,
                specifications: '',
                partial_quantity: null,
                is_partial: false,
                technical_response: ''
              });
            });
          }
        });
      }

      setOfferData(prev => ({
        ...prev,
        line_items: items.length > 0 ? items : []
      }));
      
      if (items.length === 0) {
        addToast('Aucun article trouvé', 'warning', 2000);
      } else {
        addToast('L\'appel d\'offres a été chargé avec succès', 'success', 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      const errorMessage = 'Erreur lors du chargement: ' + errorMsg;
      setError(errorMessage);
      addToast(errorMessage, 'error', 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogProducts = async () => {
    try {
      const response = await procurementAPI.getMyOffers();
      setCatalogProducts(response.data.offers || []);
    } catch (err) {
    }
  };

  const handleOpenCatalog = (itemIndex) => {
    setSelectedLineItemIndex(itemIndex);
    setShowCatalogModal(true);
    fetchCatalogProducts();
  };

  const handleSelectFromCatalog = (product) => {
    const newItems = [...offerData.line_items];
    newItems[selectedLineItemIndex] = {
      ...newItems[selectedLineItemIndex],
      unit_price: product.total_amount || 0,
      specifications: product.description || ''
    };
    newItems[selectedLineItemIndex].total_price = newItems[selectedLineItemIndex].unit_price * newItems[selectedLineItemIndex].quantity;
    setOfferData(prev => ({ ...prev, line_items: newItems }));
    setShowCatalogModal(false);
  };

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...offerData.line_items];
    newItems[index][field] = field === 'unit_price' ? parseFloat(value) || 0 : value;

    if (field === 'unit_price' || field === 'partial_quantity' || field === 'is_partial') {
      const item = newItems[index];
      const quantity = item.is_partial ? (item.partial_quantity || 0) : item.quantity;
      item.total_price = (item.unit_price || 0) * quantity;
    }

    setOfferData(prev => ({ ...prev, line_items: newItems }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setOfferData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setOfferData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getTotalBidAmount = () => {
    return offerData.line_items.reduce((sum, item) => sum + (item.total_price || 0), 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enhanced validation
    if (isDeadlinePassed) {
      setError(`L'envoi a échoué. L'appel d'offres est fermé depuis ${new Date(tender.deadline).toLocaleDateString('fr-FR')}`);
      return;
    }

    if (!offerData.commitment) {
      setError('Vous devez accepter tous les termes et conditions');
      return;
    }

    // Validate all prices are filled and positive
    const invalidItems = offerData.line_items.filter(item => !item.unit_price || parseFloat(item.unit_price) <= 0);
    if (invalidItems.length > 0) {
      setError(`${invalidItems.length} article(s) ont des prix invalides (doit être > 0)`);
      return;
    }

    // Validate files
    const invalidFiles = offerData.attachments.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return !validTypes.includes(file.type) || file.size > maxSize;
    });
    if (invalidFiles.length > 0) {
      setError('Fichiers invalides (PDF/DOC, max 10MB)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('tender_id', tenderId);
      formData.append('supplier_ref_number', offerData.supplier_ref_number);
      formData.append('validity_period_days', offerData.validity_period_days);
      formData.append('payment_terms', offerData.payment_terms);
      formData.append('technical_proposal', offerData.technical_proposal);
      formData.append('line_items', JSON.stringify(offerData.line_items));
      formData.append('total_amount', getTotalBidAmount());

      offerData.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      await procurementAPI.createOffer(formData);
      clearDraft(`offer_draft_${tenderId}`);
      setSuccess(true);
      addToast('✅ Votre offre a été envoyée avec succès!', 'success', 2000);
      
      setTimeout(() => {
        navigate('/my-offers');
      }, 2500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError('Erreur: ' + (errorMsg || 'Erreur lors de l\'envoi'));
      addToast('Erreur lors de l\'envoi', 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (!tender) {
    return (
      <Container maxWidth="lg" sx={{ paddingY: '40px' }}>
        <Alert severity="error">L'appel d'offres n'existe pas</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Button startIcon={<ArrowBackIcon />} onClick={() => window.history.back()} sx={{ marginBottom: '24px', color: theme.palette.primary.main }}>
          Retour
        </Button>

        {isDeadlinePassed && (
          <Alert severity="error" sx={{ marginBottom: '24px' }}>
            ⏰ Cet appel d'offres est fermé. La date limite était: {new Date(tender.deadline).toLocaleDateString('fr-FR')}
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ marginBottom: '24px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ marginBottom: '24px' }}>✅ Votre offre a été envoyée avec succès!</Alert>}

        {tender?.lots && tender.lots.length > 0 && (
          <Paper sx={{ p: '16px', backgroundColor: '#F5F5F5', mb: '24px', borderLeft: '4px solid #0056B3' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0056B3', mb: '12px' }}>
              📦 Lots et Articles
            </Typography>
            <Stack spacing={1.5}>
              {tender.lots.map((lot, idx) => (
                <Box key={idx} sx={{ pl: '8px', borderLeft: '2px dashed #0056B3' }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121' }}>
                    Lot {lot.numero}: {lot.objet}
                  </Typography>
                  {lot.articles && lot.articles.length > 0 && (
                    <Stack spacing={0.5} sx={{ mt: '6px', ml: '8px' }}>
                      {lot.articles.map((article, aIdx) => (
                        <Typography key={aIdx} sx={{ fontSize: '11px', color: '#666666' }}>
                          ├─ {article.name}: {article.quantity} {article.unit}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
            {tender.awardLevel && (
              <Typography sx={{ fontSize: '11px', color: '#0056B3', fontWeight: 600, mt: '12px', pt: '12px', borderTop: '1px solid #ddd' }}>
                🎯 ترسية: {tender.awardLevel === 'lot' ? 'Par Lot' : tender.awardLevel === 'article' ? 'Par Article' : 'Global'}
              </Typography>
            )}
          </Paper>
        )}

        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '32px' }}>
            <Typography variant="h2" sx={{ fontSize: '28px', fontWeight: 500, color: theme.palette.text.primary, marginBottom: '8px' }}>
              Soumission d'Offre Sécurisée
            </Typography>
            <Box sx={{ marginBottom: '24px' }}>
              <Typography sx={{ color: '#0056B3', mb: '12px', fontWeight: 700, fontSize: '14px' }}>
                🔐 ID Référence (Plateforme): <strong>{tender.id || 'N/A'}</strong>
              </Typography>
              <Typography sx={{ color: '#616161', mb: '8px' }}>
                <strong>N° Consultation:</strong> {tender.consultation_number}
              </Typography>
              <Typography sx={{ color: '#616161' }}>
                <strong>Appel d'offres:</strong> {tender.title}
              </Typography>
            </Box>

            <Stepper activeStep={step} sx={{ marginBottom: '32px' }}>
              <Step>
                <StepLabel>Informations de base</StepLabel>
              </Step>
              <Step>
                <StepLabel>Articles & Prix</StepLabel>
              </Step>
              <Step>
                <StepLabel>Révision & Envoi</StepLabel>
              </Step>
            </Stepper>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {step === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <TextField
                    fullWidth
                    label="Numéro de Référence Fournisseur"
                    value={offerData.supplier_ref_number}
                    onChange={(e) => setOfferData({...offerData, supplier_ref_number: e.target.value})}
                    disabled={submitting || isDeadlinePassed}
                  />

                  <TextField
                    fullWidth
                    label="Période de Validité (jours)"
                    type="number"
                    min="1"
                    max="365"
                    value={offerData.validity_period_days}
                    onChange={(e) => setOfferData({...offerData, validity_period_days: parseInt(e.target.value)})}
                    disabled={submitting || isDeadlinePassed}
                  />

                  <FormControl fullWidth disabled={submitting || isDeadlinePassed}>
                    <InputLabel>Conditions de Paiement</InputLabel>
                    <Select
                      value={offerData.payment_terms}
                      onChange={(e) => setOfferData({...offerData, payment_terms: e.target.value})}
                      label="Conditions de Paiement"
                    >
                      <MenuItem value="Net30">Net 30</MenuItem>
                      <MenuItem value="Net60">Net 60</MenuItem>
                      <MenuItem value="PaymentInAdvance">Paiement d'Avance</MenuItem>
                      <MenuItem value="CashOnDelivery">Paiement à la Livraison</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Proposition Technique"
                    multiline
                    rows={4}
                    value={offerData.technical_proposal}
                    onChange={(e) => setOfferData({...offerData, technical_proposal: e.target.value})}
                    disabled={submitting || isDeadlinePassed}
                  />

                  <Box>
                    <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Documents (PDF, DOCX)
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      disabled={submitting || isDeadlinePassed}
                    >
                      Télécharger des Fichiers
                      <input type="file" hidden multiple accept=".pdf,.docx,.doc" onChange={handleFileUpload} />
                    </Button>
                    {offerData.attachments.length > 0 && (
                      <Stack spacing={1} sx={{ marginTop: '12px' }}>
                        {offerData.attachments.map((file, idx) => (
                          <Chip
                            key={idx}
                            label={file.name}
                            onDelete={() => removeAttachment(idx)}
                            icon={<DeleteIcon />}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Box>
              )}

              {step === 1 && (
                <Box>
                  <Paper sx={{ overflow: 'hidden' }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Qty</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Prix Unitaire</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Total</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {offerData.line_items.map((item, idx) => (
                          <TableRow key={idx} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            <TableCell sx={{ color: theme.palette.text.primary }}>{item.description}</TableCell>
                            <TableCell align="right" sx={{ color: theme.palette.text.primary }}>{item.quantity}</TableCell>
                            <TableCell align="right">
                              <TextField
                                size="small"
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => handleLineItemChange(idx, 'unit_price', e.target.value)}
                                disabled={submitting || isDeadlinePassed}
                                sx={{ width: '100px' }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                              {item.total_price.toFixed(2)} TND
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                onClick={() => handleOpenCatalog(idx)}
                                disabled={submitting || isDeadlinePassed}
                                sx={{ color: theme.palette.primary.main, textTransform: 'none' }}
                              >
                                Catalogue
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                  <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', marginTop: '16px', borderRadius: '4px' }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.primary.main }}>
                      Total: {getTotalBidAmount()} TND
                    </Typography>
                  </Box>
                </Box>
              )}

              {step === 2 && (
                <Box>
                  <Card sx={{ backgroundColor: '#e3f2fd', border: '1px solid #0056B3', marginBottom: '16px' }}>
                    <CardContent>
                      <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: '#0d47a1', marginBottom: '8px' }}>
                        Résumé de Votre Offre
                      </Typography>
                      <Stack spacing={1} sx={{ fontSize: '14px' }}>
                        <Typography>📋 <strong>Total:</strong> {getTotalBidAmount()} TND</Typography>
                        <Typography>⏱️ <strong>Validité:</strong> {offerData.validity_period_days} jours</Typography>
                        <Typography>💳 <strong>Paiement:</strong> {offerData.payment_terms}</Typography>
                        <Typography>📎 <strong>Documents:</strong> {offerData.attachments.length} fichier(s)</Typography>
                      </Stack>
                    </CardContent>
                  </Card>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={offerData.commitment}
                        onChange={(e) => setOfferData({...offerData, commitment: e.target.checked})}
                        disabled={submitting || isDeadlinePassed}
                      />
                    }
                    label="J'accepte les termes et conditions et j'engage ma responsabilité"
                  />
                </Box>
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginTop: '24px' }}>
                <Button
                  variant="outlined"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0 || submitting || isDeadlinePassed}
                  sx={{ color: theme.palette.primary.main, borderColor: theme.palette.primary.main }}
                >
                  Précédent
                </Button>
                {step < 2 ? (
                  <Button
                    variant="contained"
                    onClick={() => setStep(step + 1)}
                    disabled={submitting || isDeadlinePassed}
                    sx={{ backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: '#0d47a1' } }}
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={submitting || isDeadlinePassed || !offerData.commitment}
                    sx={{ backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}
                  >
                    {submitting ? <CircularProgress size={20} /> : 'Soumettre l\'Offre'}
                  </Button>
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Dialog open={showCatalogModal} onClose={() => setShowCatalogModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sélectionner du Catalogue</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ marginTop: '16px' }}>
            {catalogProducts.length === 0 ? (
              <Typography sx={{ color: '#999' }}>Aucun produit disponible</Typography>
            ) : (
              catalogProducts.map(product => (
                <Button
                  key={product.id}
                  variant="outlined"
                  onClick={() => handleSelectFromCatalog(product)}
                  sx={{ textAlign: 'left', justifyContent: 'flex-start', color: theme.palette.text.primary }}
                >
                  {product.description} - {product.total_amount} TND
                </Button>
              ))
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
