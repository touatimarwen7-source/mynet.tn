import { useState, useEffect } from 'react';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { procurementAPI } from '../api';
import { useToastContext } from '../contexts/ToastContext';
import { setPageTitle } from '../utils/pageTitle';

export default function CreateOffer() {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToastContext();

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
  }, [tenderId]);

  const fetchTender = async () => {
    try {
      const response = await procurementAPI.getTender(tenderId);
      setTender(response.data.tender);
      
      const items = response.data.tender.requirements || [];
      setOfferData(prev => ({
        ...prev,
        line_items: items.map((item, idx) => ({
          id: idx,
          description: item.description || item,
          quantity: item.quantity || 1,
          unit: item.unit || 'piece',
          unit_price: '',
          total_price: 0,
          specifications: '',
          partial_quantity: null,
          is_partial: false,
          technical_response: ''
        }))
      }));
      addToast('L\'appel d\'offres a été chargé avec succès', 'success', 2000);
    } catch (err) {
      const errorMessage = 'Erreur lors du chargement de l\'appel d\'offres: ' + err.message;
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
      console.error('Erreur lors de la récupération du catalogue:', err);
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

    if (isDeadlinePassed) {
      setError(`L'envoi a échoué. L'appel d'offres est fermé depuis ${new Date(tender.deadline).toLocaleDateString('fr-FR')}`);
      return;
    }

    if (!offerData.commitment) {
      setError('Vous devez accepter tous les termes et conditions');
      return;
    }

    const invalidItems = offerData.line_items.filter(item => !item.unit_price || item.unit_price === 0);
    if (invalidItems.length > 0) {
      setError('Veuillez remplir les prix de tous les articles');
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
      setSuccess(true);
      addToast('✅ Votre offre a été envoyée avec succès!', 'success', 2000);
      
      setTimeout(() => {
        navigate('/my-offers');
      }, 2500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError('Erreur lors de l\'envoi de l\'offre: ' + errorMsg);
      addToast('Erreur lors de l\'envoi', 'error', 4000);
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
        <Button startIcon={<ArrowBackIcon />} onClick={() => window.history.back()} sx={{ marginBottom: '24px', color: '#1565c0' }}>
          Retour
        </Button>

        {isDeadlinePassed && (
          <Alert severity="error" sx={{ marginBottom: '24px' }}>
            ⏰ Cet appel d'offres est fermé. La date limite était: {new Date(tender.deadline).toLocaleDateString('fr-FR')}
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ marginBottom: '24px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ marginBottom: '24px' }}>✅ Votre offre a été envoyée avec succès!</Alert>}

        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '32px' }}>
            <Typography variant="h2" sx={{ fontSize: '28px', fontWeight: 500, color: '#212121', marginBottom: '8px' }}>
              Soumission d'Offre Sécurisée
            </Typography>
            <Typography sx={{ color: '#616161', marginBottom: '24px' }}>
              Appel d'offres: <strong>{tender.title}</strong>
            </Typography>

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
                          <TableCell sx={{ fontWeight: 600, color: '#1565c0' }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#1565c0' }} align="right">Qty</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#1565c0' }} align="right">Prix Unitaire</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#1565c0' }} align="right">Total</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#1565c0' }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {offerData.line_items.map((item, idx) => (
                          <TableRow key={idx} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            <TableCell sx={{ color: '#212121' }}>{item.description}</TableCell>
                            <TableCell align="right" sx={{ color: '#212121' }}>{item.quantity}</TableCell>
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
                            <TableCell align="right" sx={{ color: '#1565c0', fontWeight: 600 }}>
                              {item.total_price.toFixed(2)} TND
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                onClick={() => handleOpenCatalog(idx)}
                                disabled={submitting || isDeadlinePassed}
                                sx={{ color: '#1565c0', textTransform: 'none' }}
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
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#1565c0' }}>
                      Total: {getTotalBidAmount()} TND
                    </Typography>
                  </Box>
                </Box>
              )}

              {step === 2 && (
                <Box>
                  <Card sx={{ backgroundColor: '#e3f2fd', border: '1px solid #1565c0', marginBottom: '16px' }}>
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
                  sx={{ color: '#1565c0', borderColor: '#1565c0' }}
                >
                  Précédent
                </Button>
                {step < 2 ? (
                  <Button
                    variant="contained"
                    onClick={() => setStep(step + 1)}
                    disabled={submitting || isDeadlinePassed}
                    sx={{ backgroundColor: '#1565c0', '&:hover': { backgroundColor: '#0d47a1' } }}
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
                  sx={{ textAlign: 'left', justifyContent: 'flex-start', color: '#212121' }}
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
