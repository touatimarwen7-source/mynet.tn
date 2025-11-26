import { useState, useEffect, useCallback } from 'react';
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
  Chip,
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
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

const STEPS = [
  { label: 'Informations Générales', icon: '📋' },
  { label: 'Produits/Services', icon: '🛍️' },
  { label: 'Quantités et Prix', icon: '📊' },
  { label: 'Calendrier de Livraison', icon: '📅' },
  { label: 'Conditions d\'Exécution', icon: '⚙️' },
  { label: 'Documents', icon: '📎' },
  { label: 'Adresse de Livraison', icon: '📍' },
  { label: 'Révision et Envoi', icon: '✅' }
];

export default function CreateSupplyRequest() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const { offerId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  
  const [offer, setOffer] = useState(null);
  const [formData, setFormData] = useState({
    offer_id: offerId,
    request_number: '',
    po_reference: '',
    requested_date: new Date().toISOString().split('T')[0],
    items: [],
    delivery_address: '',
    delivery_city: '',
    delivery_zip: '',
    delivery_contact: '',
    delivery_phone: '',
    delivery_email: '',
    special_instructions: '',
    incoterms: 'DAP',
    payment_terms: '',
    quality_standards: '',
    attachments: [],
    total_amount: 0,
    notes: ''
  });

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', quantity: '', unit_price: '', unit: 'pièce' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState({});

  useEffect(() => {
    setPageTitle('Créer une Demande de Fourniture');
    const saved = localStorage.getItem(`supplyRequestDraft_${offerId}`);
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        setFormData(savedData);
        setItems(savedData.items || []);
      } catch (e) {
      }
    }
  }, [offerId]);

  const autoSaveDraft = useCallback(() => {
    const draftData = { ...formData, items };
    localStorage.setItem(`supplyRequestDraft_${offerId}`, JSON.stringify(draftData));
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 2000);
  }, [formData, offerId, items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    if (newItem.description && newItem.quantity && newItem.unit_price) {
      const totalPrice = parseFloat(newItem.quantity) * parseFloat(newItem.unit_price);
      setItems(prev => [...prev, { ...newItem, totalPrice, id: Date.now() }]);
      setFormData(prev => ({
        ...prev,
        total_amount: prev.total_amount + totalPrice
      }));
      setNewItem({ description: '', quantity: '', unit_price: '', unit: 'pièce' });
    }
  };

  const removeItem = (id) => {
    const item = items.find(i => i.id === id);
    setItems(prev => prev.filter(i => i.id !== id));
    setFormData(prev => ({
      ...prev,
      total_amount: prev.total_amount - (item?.totalPrice || 0)
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.po_reference.trim()) {
          setError('La référence du bon de commande est requise');
          return false;
        }
        break;
      case 1:
      case 2:
        if (items.length === 0) {
          setError('Au moins un article est requis');
          return false;
        }
        break;
      case 3:
        if (!formData.delivery_date) {
          setError('La date de livraison est requise');
          return false;
        }
        break;
      case 6:
        if (!formData.delivery_address.trim()) {
          setError('L\'adresse de livraison est requise');
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
      setStepsCompleted(prev => ({ ...prev, [activeStep]: true }));
      setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
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
        total_amount: formData.total_amount,
        status: 'submitted'
      };

      await procurementAPI.createSupplyRequest(submitData);
      localStorage.removeItem(`supplyRequestDraft_${offerId}`);
      
      setTimeout(() => {
        navigate(`/offer/${offerId}`);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  // Step 1
  const Step1Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Référence du Bon de Commande *"
            name="po_reference"
            value={formData.po_reference}
            onChange={handleChange}
            disabled={loading}
            placeholder="Ex: PO-2024-001"
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Date de la Demande *"
            name="requested_date"
            type="date"
            value={formData.requested_date}
            onChange={handleChange}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
      <TextField
        fullWidth
        label="Notes Générales (optionnel)"
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

  // Step 2 & 3: Items
  const StepItemsContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Paper sx={{ padding: '16px', backgroundColor: 'action.hover' }}>
        <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
          Ajouter un Article
        </Typography>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description du produit/service"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              size="small"
              disabled={loading}
            />
          </Grid>
          <Grid xs={12} sm={2}>
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
          <Grid xs={12} sm={2}>
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
          <Grid xs={12} sm={2}>
            <TextField
              fullWidth
              label="Prix Unitaire"
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
                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>Quantité</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>Prix Unit.</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>Total</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.main' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity} {item.unit}</TableCell>
                  <TableCell align="right">{parseFloat(item.unit_price).toFixed(2)}</TableCell>
                  <TableCell align="right"><strong>{item.totalPrice.toFixed(2)}</strong></TableCell>
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
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell colSpan={3} sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {formData.total_amount.toFixed(2)} TND
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  // Step 4
  const Step4Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TextField
        fullWidth
        label="Date Souhaitée de Livraison *"
        name="delivery_date"
        type="date"
        value={formData.delivery_date || ''}
        onChange={handleChange}
        disabled={loading}
        InputLabelProps={{ shrink: true }}
      />
      <FormControl fullWidth disabled={loading}>
        <InputLabel>Incoterms</InputLabel>
        <Select
          name="incoterms"
          value={formData.incoterms}
          onChange={handleChange}
          label="Incoterms"
        >
          <MenuItem value="DAP">DAP - Rendu Point de Destination</MenuItem>
          <MenuItem value="DDP">DDP - Rendu Droits Acquittés</MenuItem>
          <MenuItem value="FOB">FOB - Franco à Bord</MenuItem>
          <MenuItem value="CIF">CIF - Coût, Assurance, Fret</MenuItem>
          <MenuItem value="EXW">EXW - Usine</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  // Step 5
  const Step5Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TextField
        fullWidth
        label="Conditions de Paiement"
        name="payment_terms"
        value={formData.payment_terms}
        onChange={handleChange}
        placeholder="Ex: Net 30"
        disabled={loading}
      />
      <TextField
        fullWidth
        label="Normes de Qualité"
        name="quality_standards"
        value={formData.quality_standards}
        onChange={handleChange}
        placeholder="Ex: ISO 9001"
        disabled={loading}
      />
      <TextField
        fullWidth
        label="Instructions Spéciales"
        name="special_instructions"
        value={formData.special_instructions}
        onChange={handleChange}
        placeholder="Instructions d'exécution spéciales..."
        multiline
        rows={4}
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
                <TableCell align="right" sx={{ fontWeight: 600 }}>Taille</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
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
      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Adresse de Livraison *"
            name="delivery_address"
            value={formData.delivery_address}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Ville *"
            name="delivery_city"
            value={formData.delivery_city}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            fullWidth
            label="Code Postal"
            name="delivery_zip"
            value={formData.delivery_zip}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            fullWidth
            label="Téléphone de Contact"
            name="delivery_phone"
            value={formData.delivery_phone}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <TextField
            fullWidth
            label="Email de Contact"
            name="delivery_email"
            type="email"
            value={formData.delivery_email}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );

  // Step 8
  const Step8Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Alert severity="success" sx={{ backgroundColor: '#e8f5e9', color: '#1b5e20' }}>
        ✓ Tous les détails ont été complétés. Prêt à envoyer la demande de fourniture.
      </Alert>

      <Paper sx={{ padding: '16px', backgroundColor: 'action.hover' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', marginBottom: '12px', fontSize: '14px' }}>
          Résumé de la Demande
        </Typography>
        <Stack spacing={1} sx={{ fontSize: '13px' }}>
          <Box><strong>Référence:</strong> {formData.po_reference}</Box>
          <Box><strong>Nombre d'articles:</strong> {items.length}</Box>
          <Box><strong>Montant total:</strong> {formData.total_amount.toFixed(2)} TND</Box>
          <Box><strong>Date de livraison:</strong> {formData.delivery_date}</Box>
          <Box><strong>Incoterms:</strong> {formData.incoterms}</Box>
          <Box><strong>Adresse:</strong> {formData.delivery_address}, {formData.delivery_city}</Box>
        </Stack>
      </Paper>
    </Box>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: return <Step1Content />;
      case 1:
      case 2: return <StepItemsContent />;
      case 3: return <Step4Content />;
      case 4: return <Step5Content />;
      case 5: return <Step6Content />;
      case 6: return <Step7Content />;
      case 7: return <Step8Content />;
      default: return null;
    }
  };

  if (!offer) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
                gap: '8px'
              }}
            >
              {STEPS[activeStep].icon} {STEPS[activeStep].label}
            </Typography>
            <Typography 
              sx={{ 
                color: 'text.secondary', 
                marginBottom: '32px',
                fontSize: '14px'
              }}
            >
              Étape {activeStep + 1} sur {STEPS.length}
            </Typography>

            <LinearProgress 
              variant="determinate" 
              value={(activeStep / (STEPS.length - 1)) * 100}
              sx={{ marginBottom: '24px', height: '4px' }}
            />

            <Stepper activeStep={activeStep} sx={{ marginBottom: '32px', display: { xs: 'none', sm: 'flex' } }}>
              {STEPS.map((step, index) => (
                <Step key={index} completed={stepsCompleted[index] || false}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ marginBottom: '24px', backgroundColor: '#ffebee', color: '#c62828' }}>
                {error}
              </Alert>
            )}

            {autoSaved && (
              <Alert severity="success" sx={{ marginBottom: '16px', backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                ✓ Brouillon enregistré automatiquement
              </Alert>
            )}

            <Box sx={{ minHeight: '300px', marginBottom: '32px' }}>
              {renderStepContent()}
            </Box>

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
                  {loading ? 'Envoi en cours...' : '✅ Envoyer la Demande'}
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
                textTransform: 'none'
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
                navigate(`/offer/${offerId}`);
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
