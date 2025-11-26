import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { setPageTitle } from '../utils/pageTitle';
import { procurementAPI } from '../api';
import { validateLots, validateBudget, handleAPIError, validateDeadline } from '../utils/validationHelpers';
import { autosaveDraft, recoverDraft, clearDraft } from '../utils/draftStorageHelper';

// Import Step Components
import StepOne from '../components/TenderSteps/StepOne';
import StepTwo from '../components/TenderSteps/StepTwo';
import StepThree from '../components/TenderSteps/StepThree';
import StepFour from '../components/TenderSteps/StepFour';
import StepFive from '../components/TenderSteps/StepFive';
import StepDocuments from '../components/TenderSteps/StepDocuments';
import StepSeven from '../components/TenderSteps/StepSeven';
import { getInitialFormData } from '../components/TenderSteps/constants';

// ============ Configuration ============
const STAGES = [
  { name: 'Informations', description: 'Détails généraux' },
  { name: 'Lots', description: 'Division en lots' },
  { name: 'Exigences', description: 'Critères obligatoires' },
  { name: 'Évaluation', description: 'Critères d\'évaluation' },
  { name: 'Spécifications', description: 'Cahier des charges et documents' },
  { name: 'Finalisation', description: 'Révision finale' },
];

// ============ Main Component ============
export default function CreateTender() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(getInitialFormData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showExit, setShowExit] = useState(false);

  useEffect(() => {
    setPageTitle('Créer un Appel d\'Offres');
    
    // Load draft using helper
    const draft = recoverDraft('tender_draft');
    if (draft) {
      setFormData(draft);
    }
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      autosaveDraft('tender_draft', formData);
    }, 30000);
    
    return () => clearInterval(timer);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    // Convert to number for numeric fields
    if (name === 'budget_min' || name === 'budget_max' || name === 'offer_validity_days') {
      finalValue = value ? parseFloat(value) : '';
    }

    if (name.includes('.')) {
      const [key, subKey] = name.split('.');
      setFormData((prev) => {
        const updated = {
          ...prev,
          [key]: {
            ...prev[key],
            [subKey]: finalValue,
          },
        };
        // Auto-save after update
        autosaveDraft('tender_draft', updated);
        return updated;
      });
    } else {
      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: finalValue,
        };
        // Auto-save after update
        autosaveDraft('tender_draft', updated);
        return updated;
      });
    }
  };

  const validateStep = () => {
    setError('');

    if (currentStep === 0) {
      if (!formData.title || formData.title.length < 5) {
        setError('Le titre doit contenir au moins 5 caractères');
        return false;
      }
      if (!formData.description || formData.description.length < 20) {
        setError('La description doit contenir au moins 20 caractères');
        return false;
      }
    }

    // Step 1 (index 1): Dates validation - just check dates are provided
    if (currentStep === 1) {
      if (!formData.publication_date) {
        setError('La date de publication est requise');
        return false;
      }
      if (!formData.deadline) {
        setError('La date de clôture est requise');
        return false;
      }
    }

    // Step 2 (index 2): Lots validation - check lots are defined
    if (currentStep === 2) {
      // Use unified validation for Lots
      const lotsCheck = validateLots(formData.lots, formData.awardLevel);
      if (!lotsCheck.valid) {
        setError(lotsCheck.error);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, STAGES.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const getTotalCriteria = () => {
    return Object.values(formData.evaluation_criteria).reduce((a, b) => a + b, 0);
  };

  const handleSubmit = async () => {
    try {
      // ✅ STEP 1: Validate all required fields
      if (!formData.title || formData.title.trim().length < 5) {
        setError('Le titre doit contenir au moins 5 caractères');
        return;
      }

      if (!formData.description || formData.description.trim().length < 20) {
        setError('La description doit contenir au moins 20 caractères');
        return;
      }

      if (!formData.publication_date) {
        setError('La date de publication est requise');
        return;
      }

      if (!formData.deadline) {
        setError('La date de clôture est requise');
        return;
      }

      // ✅ STEP 2: Validate deadline is in future
      const now = new Date();
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= now) {
        setError('La date de clôture doit être dans le futur');
        return;
      }

      // ✅ STEP 3: Validate lots
      if (!formData.lots || formData.lots.length === 0) {
        setError('Au moins un lot est requis');
        return;
      }

      const lotsCheck = validateLots(formData.lots, formData.awardLevel);
      if (!lotsCheck.valid) {
        setError(lotsCheck.error);
        return;
      }

      // ✅ STEP 4: Validate award level
      if (!formData.awardLevel) {
        setError('Niveau d\'attribution requis');
        return;
      }

      // ✅ STEP 5: Validate evaluation criteria
      const criteria = getTotalCriteria();
      if (criteria !== 100) {
        setError(`Les critères d\'évaluation doivent totaliser 100% (actuellement: ${criteria}%)`);
        return;
      }

      setLoading(true);
      setError('');

      // ✅ STEP 6: Prepare tender data with proper formatting
      const tenderData = {
        title: formData.title?.trim() || '',
        description: formData.description?.trim() || '',
        publication_date: formData.publication_date,
        deadline: formData.deadline,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : 0,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : 0,
        currency: formData.currency || 'TND',
        category: formData.category || '',
        awardLevel: formData.awardLevel || 'lot',
        offer_validity_days: formData.offer_validity_days ? parseInt(formData.offer_validity_days) : 30,
        lots: formData.lots || [],
        evaluation_criteria: formData.evaluation_criteria || {},
        requirements: formData.requirements || {},
        documents: formData.documents || [],
        additional_info: formData.additional_info || ''
      };

      console.log('📤 Submitting tender:', { title: tenderData.title, lots: tenderData.lots.length });

      // ✅ STEP 7: Submit to API with error handling
      let response;
      try {
        response = await procurementAPI.createTender(tenderData);
        console.log('✅ API Response received:', response?.status);
      } catch (apiErr) {
        console.error('❌ API Call failed:', apiErr.response?.status, apiErr.message);
        throw apiErr;
      }

      // ✅ STEP 8: Handle success response - check multiple possible structures
      let tenderId = null;
      
      // Try multiple response structures
      if (response?.data?.id) {
        tenderId = response.data.id;
        console.log('✅ Found tender ID in response.data.id');
      } else if (response?.data?.tender?.id) {
        tenderId = response.data.tender.id;
        console.log('✅ Found tender ID in response.data.tender.id');
      } else if (response?.id) {
        tenderId = response.id;
        console.log('✅ Found tender ID in response.id');
      } else if (response?.tender?.id) {
        tenderId = response.tender.id;
        console.log('✅ Found tender ID in response.tender.id');
      }

      // Validate tender ID
      if (!tenderId || typeof tenderId !== 'string' && typeof tenderId !== 'number') {
        console.error('❌ Invalid tender ID:', tenderId);
        console.error('Full response structure:', JSON.stringify(response?.data || response, null, 2));
        setError(`Erreur de créación: ID du tender invalide. Veuillez réessayer ou contacter le support.`);
        return;
      }

      // ✅ STEP 9: Clear draft and navigate
      clearDraft('tender_draft');
      console.log('✅ Redirecting to tender page:', tenderId);
      navigate(`/tender/${tenderId}`);

    } catch (err) {
      console.error('❌ Tender creation error:', {
        status: err.response?.status,
        message: err.message,
        serverError: err.response?.data?.error || err.response?.data?.message,
        fullError: err.response?.data
      });
      
      // ✅ STEP 10: Enhanced error handling with clear messages
      let errorMessage = 'Une erreur est survenue lors de la création de l\'appel d\'offres';
      
      // Handle different error scenarios with clear French messages
      if (err.response?.status === 400) {
        errorMessage = `Données invalides: ${err.response.data?.message || err.response.data?.error || 'Veuillez vérifier vos entrées'}`;
      } else if (err.response?.status === 401) {
        errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Vous n\'avez pas les permissions pour créer un appel d\'offres.';
      } else if (err.response?.status === 409) {
        errorMessage = 'Un appel d\'offres avec ce titre existe déjà.';
      } else if (err.response?.status === 422) {
        errorMessage = `Validation échouée: ${err.response.data?.message || 'Les données fournie ne sont pas valides'}`;
      } else if (err.response?.status === 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard ou contacter le support.';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Erreur réseau. Vérifiez votre connexion Internet.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'La demande a pris trop de temps. Veuillez réessayer.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const totalCriteria = getTotalCriteria();

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepOne formData={formData} handleChange={handleChange} loading={loading} />;
      case 1:
        return <StepTwo formData={formData} handleChange={handleChange} loading={loading} />;
      case 2:
        return <StepThree formData={formData} setFormData={setFormData} loading={loading} />;
      case 3:
        return <StepFour formData={formData} setFormData={setFormData} loading={loading} />;
      case 4:
        return (
          <StepFive
            formData={formData}
            handleChange={handleChange}
            totalCriteria={totalCriteria}
            loading={loading}
          />
        );
      case 5:
        return <StepDocuments formData={formData} setFormData={setFormData} loading={loading} />;
      case 6:
        return <StepSeven formData={formData} handleChange={handleChange} loading={loading} />;
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / STAGES.length) * 100;

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Card sx={{ border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none' }}>
          <CardContent sx={{ padding: '40px' }}>
            {/* Header */}
            <Box sx={{ marginBottom: '32px' }}>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#999999',
                  textTransform: 'uppercase',
                  mb: '8px',
                }}
              >
                Étape {currentStep + 1} sur {STAGES.length}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontSize: '28px',
                  fontWeight: 500,
                  color: institutionalTheme.palette.primary.main,
                  mb: '8px',
                }}
              >
                {STAGES[currentStep].name}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#616161' }}>
                {STAGES[currentStep].description}
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ height: '4px', backgroundColor: '#E0E0E0', borderRadius: '2px', mb: '32px' }}>
              <Box
                sx={{
                  height: '100%',
                  backgroundColor: institutionalTheme.palette.primary.main,
                  width: `${progress}%`,
                  transition: 'width 0.3s ease',
                  borderRadius: '2px',
                }}
              />
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ marginBottom: '24px' }}>
                {error}
              </Alert>
            )}

            {/* Step Content */}
            <Box sx={{ minHeight: '300px', marginBottom: '32px' }}>
              {renderStepContent()}
            </Box>

            {/* Navigation */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={currentStep === 0 || loading}
                sx={{
                  color: institutionalTheme.palette.primary.main,
                  borderColor: '#0056B3',
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: '44px',
                }}
              >
                Précédent
              </Button>

              {currentStep === STAGES.length - 1 ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => setShowPreview(true)}
                    disabled={loading || totalCriteria !== 100}
                    sx={{
                      flex: 1,
                      color: institutionalTheme.palette.primary.main,
                      borderColor: institutionalTheme.palette.primary.main,
                      textTransform: 'none',
                      fontWeight: 600,
                      minHeight: '44px',
                    }}
                  >
                    📋 Aperçu
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading || totalCriteria !== 100}
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                    sx={{
                      flex: 1,
                      backgroundColor: institutionalTheme.palette.primary.main,
                      color: '#ffffff',
                      textTransform: 'none',
                      fontWeight: 600,
                      minHeight: '44px',
                      '&:hover': { backgroundColor: '#0d47a1' },
                      '&:disabled': { backgroundColor: '#bdbdbd' },
                    }}
                  >
                    {loading ? 'Création...' : 'Créer l\'Appel d\'Offres'}
                  </Button>
                </>
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
                onClick={() => setShowExit(true)}
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

            {/* Save Draft Button */}
            <Button
              variant="text"
              size="small"
              onClick={() => {
                localStorage.setItem('tenderDraft', JSON.stringify(formData));
                alert('Brouillon sauvegardé');
              }}
              startIcon={<SaveIcon />}
              sx={{ marginTop: '16px', color: '#616161', textTransform: 'none' }}
            >
              Enregistrer le brouillon
            </Button>
          </CardContent>
        </Card>
      </Container>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: institutionalTheme.palette.primary.main, color: '#fff' }}>
          📋 Aperçu de votre Appel d'Offres
        </DialogTitle>
        <DialogContent sx={{ paddingY: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          <StepSeven formData={formData} handleChange={handleChange} loading={loading} />
        </DialogContent>
        <DialogActions sx={{ padding: '16px', borderTop: '1px solid #E0E0E0' }}>
          <Button onClick={() => setShowPreview(false)} sx={{ color: '#666' }}>
            Revenir
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || totalCriteria !== 100}
            startIcon={loading ? <CircularProgress size={18} /> : <CheckCircleIcon />}
            sx={{ backgroundColor: institutionalTheme.palette.primary.main, color: '#fff' }}
          >
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exit Dialog */}
      <Dialog open={showExit} onClose={() => setShowExit(false)}>
        <DialogTitle>Quitter l'Assistante?</DialogTitle>
        <DialogContent>
          <Typography>
            Votre brouillon a été automatiquement sauvegardé. Vous pouvez le reprendre plus tard.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExit(false)} sx={{ color: institutionalTheme.palette.primary.main }}>
            Continuer
          </Button>
          <Button
            onClick={() => {
              setShowExit(false);
              navigate('/tenders');
            }}
            sx={{ color: '#d32f2f' }}
          >
            Quitter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
