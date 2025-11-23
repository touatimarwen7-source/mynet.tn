import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Stack,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../utils/pageTitle';
import { procurementAPI } from '../api';

const steps = ['Sélectionner un fournisseur', 'Détails du produit', 'Budget et notes', 'Confirmation'];

export default function DirectSupplyRequest() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplier_id: '',
    title: '',
    description: '',
    category: '',
    quantity: '',
    unit: 'pièce',
    budget: '',
    notes: '',
  });

  useEffect(() => {
    setPageTitle('Demande de Fourniture Directe');
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await procurementAPI.getSuppliers();
      setSuppliers(response.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    // Validation
    if (activeStep === 0 && !formData.supplier_id) {
      setError('Veuillez sélectionner un fournisseur');
      return;
    }
    if (activeStep === 1 && (!formData.title || !formData.category)) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (activeStep === 2 && !formData.budget) {
      setError('Veuillez entrer un budget');
      return;
    }
    
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      const payload = {
        supplier_id: parseInt(formData.supplier_id),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        quantity: parseInt(formData.quantity) || 1,
        unit: formData.unit,
        budget: parseFloat(formData.budget),
        notes: formData.notes,
        status: 'pending'
      };

      // Call API to create supply request
      const response = await procurementAPI.createSupplyRequest(payload);
      
      setSuccess('Demande de fourniture envoyée avec succès!');
      setTimeout(() => {
        navigate('/my-supply-requests');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['Électronique', 'Fournitures', 'Matériel', 'Services', 'Logistique', 'Autre'];
  const units = ['pièce', 'kg', 'litre', 'mètre', 'paquet', 'boîte'];

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: '20px', color: theme.palette.primary.main }}>
              Étape 1: Sélectionner un fournisseur
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : suppliers.length === 0 ? (
              <Alert severity="info">Aucun fournisseur disponible</Alert>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Fournisseur</InputLabel>
                <Select
                  value={formData.supplier_id}
                  onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                  label="Fournisseur"
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.company_name} (⭐ {supplier.average_rating}/5)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: '20px', color: theme.palette.primary.main }}>
              Étape 2: Détails du produit
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Titre du produit"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    label="Catégorie"
                    required
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantité"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Unité</InputLabel>
                  <Select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    label="Unité"
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: '20px', color: theme.palette.primary.main }}>
              Étape 3: Budget et notes
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Budget (DT)"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  required
                  inputProps={{ step: '0.01' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes supplémentaires"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Spécifications, préférences de livraison, conditions particulières..."
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: '20px', color: theme.palette.primary.main }}>
              Étape 4: Confirmation
            </Typography>
            <Paper sx={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#666' }}>Fournisseur:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {suppliers.find(s => s.id === parseInt(formData.supplier_id))?.company_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#666' }}>Produit:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formData.title}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#666' }}>Catégorie:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formData.category}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#666' }}>Quantité:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formData.quantity} {formData.unit}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#666' }}>Budget:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    {parseFloat(formData.budget).toFixed(3)} DT
                  </Typography>
                </Grid>
                {formData.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: '#666' }}>Description:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formData.description}
                    </Typography>
                  </Grid>
                )}
                {formData.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: '#666' }}>Notes:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formData.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Box sx={{ marginBottom: '30px' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/tenders')}
            sx={{ color: theme.palette.primary.main, marginBottom: '20px' }}
          >
            Retour
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            Demande de Fourniture Directe
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', marginTop: '8px' }}>
            Envoyez une demande directe à un fournisseur sans créer d'appel d'offres
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ marginBottom: '20px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ marginBottom: '20px' }}>{success}</Alert>}

        <Card sx={{ marginBottom: '20px' }}>
          <CardContent>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        <Card sx={{ marginBottom: '20px' }}>
          <CardContent sx={{ minHeight: '400px' }}>
            {renderStepContent()}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button
            disabled={activeStep === 0 || submitting}
            onClick={handleBack}
            sx={{ color: '#999' }}
          >
            Retour
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={submitting}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Envoyer la demande'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Suivant
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
}
