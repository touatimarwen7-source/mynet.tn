import { useState, useEffect, useCallback, lazy } from 'react';
import institutionalTheme from '../theme/theme';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';


const InvoiceManagement = lazy(() => import('./pages/InvoiceManagement'));

const STEPS = [
  { label: 'Informations Facture', icon: '📄' },
  { label: 'Articles Livrés', icon: '📦' },
  { label: 'Détails Financiers', icon: '💰' },
  { label: 'Taxes et Retenues', icon: '📊' },
  { label: 'Conditions de Paiement', icon: '🏦' },
  { label: 'Documents', icon: '📎' },
  { label: 'Informations Bancaires', icon: '🏧' },
  { label: 'Révision et Envoi', icon: '✅' },
];

export default function CreateInvoice() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const { supplyRequestId } = useParams();
  const [activeStep, setActiveStep] = useState(0);

  const [supplyRequest, setSupplyRequest] = useState(null);
  const [formData, setFormData] = useState({
    supply_request_id: supplyRequestId,
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    po_reference: '',
    description_of_work: '',
    items: [],
    subtotal: 0,
    tax_rate: 19,
    tax_amount: 0,
    total_amount: 0,
    currency: 'TND',
    payment_method: 'bank_transfer',
    bank_name: '',
    account_number: '',
    iban: '',
    swift_code: '',
    payment_terms: '',
    notes: '',
    attachments: [],
    delivery_completed: true,
    quality_approved: true,
  });

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: '',
    unit_price: '',
    unit: 'pièce',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState({});

  useEffect(() => {
    setPageTitle('Créer une Facture');
    const saved = localStorage.getItem(`invoiceDraft_${supplyRequestId}`);
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        setFormData(savedData);
        setItems(savedData.items || []);
      } catch (e) {}
    }
  }, [supplyRequestId]);

  const autoSaveDraft = useCallback(() => {
    const draftData = { ...formData, items };
    localStorage.setItem(`invoiceDraft_${supplyRequestId}`, JSON.stringify(draftData));
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 2000);
  }, [formData, supplyRequestId, items]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const calculateTotals = (newItems) => {
    const subtotal = newItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const tax = (subtotal * parseFloat(formData.tax_rate)) / 100;
    return { subtotal, tax, total: subtotal + tax };
  };

  const addItem = () => {
    if (newItem.description && newItem.quantity && newItem.unit_price) {
      const totalPrice = parseFloat(newItem.quantity) * parseFloat(newItem.unit_price);
      const newItemData = { ...newItem, totalPrice, id: Date.now() };
      const updatedItems = [...items, newItemData];
      setItems(updatedItems);

      const totals = calculateTotals(updatedItems);
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
        subtotal: totals.subtotal,
        tax_amount: totals.tax,
        total_amount: totals.total,
      }));

      setNewItem({ description: '', quantity: '', unit_price: '', unit: 'pièce' });
    }
  };

  const removeItem = (id) => {
    const updatedItems = items.filter((i) => i.id !== id);
    setItems(updatedItems);

    const totals = calculateTotals(updatedItems);
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      subtotal: totals.subtotal,
      tax_amount: totals.tax,
      total_amount: totals.total,
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.invoice_number.trim()) {
          setError('Le numéro de facture est requis');
          return false;
        }
        if (!formData.due_date) {
          setError('La date limite de paiement est requise');
          return false;
        }
        break;
      case 1:
        if (items.length === 0) {
          setError('Au moins un article est requis');
          return false;
        }
        break;
      case 4:
        if (!formData.payment_method) {
          setError('La méthode de paiement est requise');
          return false;
        }
        if (formData.payment_method === 'bank_transfer' && !formData.account_number) {
          setError('Le numéro de compte est requis');
          return false;
        }
        break;
      default:
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      autoSaveDraft();
      setStepsCompleted((prev) => ({ ...prev, [activeStep]: true }));
      setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Ajoutez au moins un article');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        items,
        status: 'submitted',
      };

      await procurementAPI.createInvoice(submitData);
      localStorage.removeItem(`invoiceDraft_${supplyRequestId}`);

      setTimeout(() => {
        navigate(`/supply-request/${supplyRequestId}`);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création de la facture');
    } finally {
      setLoading(false);
    }
  };

  // Step 1
  const Step1Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Grid container spacing={2}>
        <Grid xs={12} lg={6}>
          <TextField
            fullWidth
            label="Numéro de Facture *"
            name="invoice_number"
            value={formData.invoice_number}
            onChange={handleChange}
            disabled={loading}
            placeholder="Ex: FAC-2024-001"
          />
        </Grid>
        <Grid xs={12} lg={6}>
          <TextField
            fullWidth
            label="Référence du Bon de Commande"
            name="po_reference"
            value={formData.po_reference}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        <Grid xs={12} lg={6}>
          <TextField
            fullWidth
            label="Date de la Facture *"
            name="invoice_date"
            type="date"
            value={formData.invoice_date}
            onChange={handleChange}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid xs={12} lg={6}>
          <TextField
            fullWidth
            label="Date Limite de Paiement *"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={handleChange}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
      <TextField
        fullWidth
        label="Description du Travail Effectué"
        name="description_of_work"
        value={formData.description_of_work}
        onChange={handleChange}
        placeholder="Détails des services ou produits livres..."
        multiline
        rows={4}
        disabled={loading}
      />
    </Box>
  );

  // Step 2
  const Step2Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Paper sx={{ padding: '16px', backgroundColor: 'action.hover' }}>
        <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
          Ajouter un Article
        </Typography>
        <Grid container spacing={2}>
          <Grid xs={12} lg={6}>
            <TextField
              fullWidth
              label="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              size="small"
              disabled={loading}
            />
          </Grid>
          <Grid xs={12} md={2}>
            <TextField
              fullWidth
              label="Quantité"
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              size="small"
              inputProps={{ step: '0.01', min: '0' }}
              disabled={loading}
            />
          </Grid>
          <Grid xs={12} md={2}>
            <FormControl fullWidth size="small" disabled={loading}>
              <InputLabel>Unité</InputLabel>
              <Select
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                label="Unité"
              >
                <MenuItem value="pièce">Pièce</MenuItem>
                <MenuItem value="kg">KG</MenuItem>
                <MenuItem value="m">Mètre</MenuItem>
                <MenuItem value="L">Litre</MenuItem>
                <MenuItem value="heure">Heure</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={2}>
            <TextField
              fullWidth
              label="Prix Unit."
              type="number"
              value={newItem.unit_price}
              onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
              size="small"
              inputProps={{ step: '0.01', min: '0' }}
              disabled={loading}
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          onClick={addItem}
          disabled={loading || !newItem.description || !newItem.quantity || !newItem.unit_price}
          startIcon={<AddIcon />}
          sx={{
            marginTop: '12px',
            backgroundColor: institutionalTheme.palette.primary.main,
            color: '#ffffff',
            textTransform: 'none',
          }}
        >
          Ajouter
        </Button>
      </Paper>

      {items.length > 0 && (
        <TableContainer component={Paper} sx={{ backgroundColor: 'background.paper' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Quantité
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Prix Unit.
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Total
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell align="right">{parseFloat(item.unit_price).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <strong>{item.totalPrice.toFixed(2)}</strong>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => removeItem(item.id)}
                      disabled={loading}
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  // Step 3
  const Step3Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Paper sx={{ padding: '16px', backgroundColor: 'action.hover' }}>
        <Typography
          variant="h6"
          sx={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'primary.main' }}
        >
          Calcul des Totaux
        </Typography>
        <Stack spacing={1} sx={{ fontSize: '13px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>Sous-total:</strong>
            <strong>
              {formData.subtotal.toFixed(2)} {formData.currency}
            </strong>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>Taxe ({formData.tax_rate}%):</strong>
            <strong>
              {formData.tax_amount.toFixed(2)} {formData.currency}
            </strong>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
            <strong>Total:</strong>
            <strong style={{ color: 'primary.main' }}>
              {formData.total_amount.toFixed(2)} {formData.currency}
            </strong>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid xs={12} lg={6}>
          <TextField
            fullWidth
            label="Taux de Taxe (%)"
            name="tax_rate"
            type="number"
            value={formData.tax_rate}
            onChange={handleChange}
            inputProps={{ step: '0.01', min: '0' }}
            disabled={loading}
          />
        </Grid>
        <Grid xs={12} lg={6}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Devise</InputLabel>
            <Select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              label="Devise"
            >
              <MenuItem value="TND">Dinar Tunisien (TND)</MenuItem>
              <MenuItem value="USD">Dollar Américain (USD)</MenuItem>
              <MenuItem value="EUR">Euro (EUR)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TextField
        fullWidth
        label="Notes Supplémentaires"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Informations supplémentaires..."
        multiline
        rows={3}
        disabled={loading}
      />
    </Box>
  );

  // Step 4
  const Step4Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.delivery_completed}
            onChange={handleChange}
            name="delivery_completed"
            disabled={loading}
          />
        }
        label="La livraison a été complètement effectuée"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.quality_approved}
            onChange={handleChange}
            name="quality_approved"
            disabled={loading}
          />
        }
        label="La qualité a été approuvée par le client"
      />

      <TextField
        fullWidth
        label="Détails de la Retenue (si applicable)"
        name="retention_details"
        value={formData.retention_details || ''}
        onChange={handleChange}
        placeholder="Ex: Retenue de 5% jusqu'à réception finale"
        multiline
        rows={3}
        disabled={loading}
      />
    </Box>
  );

  // Step 5
  const Step5Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <FormControl fullWidth disabled={loading}>
        <InputLabel>Méthode de Paiement</InputLabel>
        <Select
          name="payment_method"
          value={formData.payment_method}
          onChange={handleChange}
          label="Méthode de Paiement"
        >
          <MenuItem value="bank_transfer">Virement Bancaire</MenuItem>
          <MenuItem value="check">Chèque</MenuItem>
          <MenuItem value="cash">Espèces</MenuItem>
          <MenuItem value="card">Carte Bancaire</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Conditions de Paiement"
        name="payment_terms"
        value={formData.payment_terms}
        onChange={handleChange}
        placeholder="Ex: Net 30 jours"
        disabled={loading}
      />
    </Box>
  );

  // Step 6
  const Step6Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadIcon />}
        disabled={loading}
        sx={{ color: 'primary.main', borderColor: institutionalTheme.palette.primary.main }}
      >
        Télécharger des documents
        <input type="file" multiple hidden onChange={handleFileUpload} />
      </Button>

      {selectedFiles.length > 0 && (
        <TableContainer component={Paper} sx={{ backgroundColor: 'background.paper' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600 }}>Nom du document</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Taille
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedFiles.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>{file.name}</TableCell>
                  <TableCell align="right">{(file.size / 1024).toFixed(2)} KB</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => removeAttachment(index)}
                      disabled={loading}
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  // Step 7
  const Step7Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {formData.payment_method === 'bank_transfer' && (
        <Paper sx={{ padding: '16px', backgroundColor: 'action.hover' }}>
          <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            Détails Bancaires
          </Typography>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Nom de la Banque *"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                disabled={loading}
                size="small"
              />
            </Grid>
            <Grid xs={12} lg={6}>
              <TextField
                fullWidth
                label="Numéro de Compte *"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                disabled={loading}
                size="small"
              />
            </Grid>
            <Grid xs={12} lg={6}>
              <TextField
                fullWidth
                label="IBAN"
                name="iban"
                value={formData.iban}
                onChange={handleChange}
                disabled={loading}
                size="small"
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Code SWIFT"
                name="swift_code"
                value={formData.swift_code}
                onChange={handleChange}
                disabled={loading}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );

  // Step 8
  const Step8Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Alert severity="success" sx={{ backgroundColor: '#e8f5e9', color: '#1b5e20' }}>
        ✓ Tous les détails ont été complétés. Prêt à envoyer la facture.
      </Alert>

      <Paper sx={{ padding: '16px', backgroundColor: 'action.hover' }}>
        <Typography
          variant="h6"
          sx={{ color: 'primary.main', marginBottom: '12px', fontSize: '14px' }}
        >
          Résumé de la Facture
        </Typography>
        <Stack spacing={1} sx={{ fontSize: '13px' }}>
          <Box>
            <strong>Numéro de Facture:</strong> {formData.invoice_number}
          </Box>
          <Box>
            <strong>Nombre d'articles:</strong> {items.length}
          </Box>
          <Box>
            <strong>Sous-total:</strong> {formData.subtotal.toFixed(2)} {formData.currency}
          </Box>
          <Box>
            <strong>Taxe:</strong> {formData.tax_amount.toFixed(2)} {formData.currency}
          </Box>
          <Box>
            <strong>Total:</strong> {formData.total_amount.toFixed(2)} {formData.currency}
          </Box>
          <Box>
            <strong>Date limite de paiement:</strong> {formData.due_date}
          </Box>
          <Box>
            <strong>Méthode de paiement:</strong> {formData.payment_method}
          </Box>
        </Stack>
      </Paper>
    </Box>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <Step1Content />;
      case 1:
        return <Step2Content />;
      case 2:
        return <Step3Content />;
      case 3:
        return <Step4Content />;
      case 4:
        return <Step5Content />;
      case 5:
        return <Step6Content />;
      case 6:
        return <Step7Content />;
      case 7:
        return <Step8Content />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '4px', boxShadow: 'none' }}>
          <CardContent sx={{ padding: '40px' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: '28px',
                fontWeight: 500,
                color: 'primary.main',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {STEPS[activeStep].icon} {STEPS[activeStep].label}
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                marginBottom: '32px',
                fontSize: '14px',
              }}
            >
              Étape {activeStep + 1} sur {STEPS.length}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={(activeStep / (STEPS.length - 1)) * 100}
              sx={{ marginBottom: '24px', height: '4px' }}
            />

            <Stepper
              activeStep={activeStep}
              sx={{ marginBottom: '32px', display: { xs: 'none', sm: 'flex' } }}
            >
              {STEPS.map((step, index) => (
                <Step key={index} completed={stepsCompleted[index] || false}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert
                severity="error"
                sx={{ marginBottom: '24px', backgroundColor: '#ffebee', color: '#c62828' }}
              >
                {error}
              </Alert>
            )}

            {autoSaved && (
              <Alert
                severity="success"
                sx={{ marginBottom: '16px', backgroundColor: '#e8f5e9', color: '#2e7d32' }}
              >
                ✓ Brouillon enregistré automatiquement
              </Alert>
            )}

            <Box sx={{ minHeight: '300px', marginBottom: '32px' }}>{renderStepContent()}</Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginTop: '32px' }}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={activeStep === 0 || loading}
                sx={{
                  color: 'primary.main',
                  borderColor: institutionalTheme.palette.primary.main,
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: '44px',
                }}
              >
                Précédent
              </Button>

              {activeStep === STEPS.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                  sx={{
                    flex: 1,
                    backgroundColor: institutionalTheme.palette.primary.main,
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                  }}
                >
                  {loading ? 'Envoi en cours...' : '✅ Envoyer la Facture'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                  sx={{
                    flex: 1,
                    backgroundColor: institutionalTheme.palette.primary.main,
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                  }}
                >
                  Suivant
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={() => setShowExitDialog(true)}
                disabled={loading}
                startIcon={<CancelIcon />}
                sx={{
                  color: '#d32f2f',
                  borderColor: '#d32f2f',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: '44px',
                }}
              >
                Annuler
              </Button>
            </Stack>

            <Button
              variant="text"
              size="small"
              onClick={autoSaveDraft}
              startIcon={<SaveIcon />}
              sx={{
                marginTop: '16px',
                color: 'text.secondary',
                textTransform: 'none',
              }}
            >
              Enregistrer le brouillon
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
          <DialogTitle>Quitter le Formulaire?</DialogTitle>
          <DialogContent>
            <Typography>
              Votre brouillon a été sauvegardé. Vous pouvez le reprendre plus tard.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowExitDialog(false)} sx={{ color: 'primary.main' }}>
              Continuer
            </Button>
            <Button
              onClick={() => {
                setShowExitDialog(false);
                navigate(`/supply-request/${supplyRequestId}`);
              }}
              sx={{ color: '#d32f2f' }}
            >
              Quitter
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}