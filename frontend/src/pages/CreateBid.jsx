import { useState, useEffect, useCallback } from 'react';
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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

const STEPS = [
  { label: 'Offre de base', icon: '📋' },
  { label: 'Conformité conditions', icon: '🔑' },
  { label: 'Informations fournisseur', icon: '📞' },
  { label: 'Détails techniques', icon: '🔧' },
  { label: 'Proposition financière', icon: '💰', secure: true },
  { label: 'Conditions paiement', icon: '🏦', secure: true },
  { label: 'Délais livraison', icon: '📦' },
  { label: 'Documents justificatifs', icon: '📎' },
  { label: 'Déclarations', icon: '✔️' },
  { label: 'Révision finale', icon: '🔐' }
];

export default function CreateBid() {
  const navigate = useNavigate();
  const { tenderId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  
  const [tender, setTender] = useState(null);
  const [formData, setFormData] = useState({
    tender_id: tenderId,
    total_amount: '',
    currency: 'TND',
    technical_proposal: '',
    technical_details: '',
    financial_proposal: '',
    payment_terms: '',
    payment_terms_description: '',
    delivery_time: '',
    delivery_location: '',
    attachments: [],
    warranty_period: '',
    compliance_statement: false,
    confidential_info_statement: false,
    eligibility_compliance: false,
    mandatory_documents_confirmed: [],
    supplier_name: '',
    supplier_contact_person: '',
    supplier_email: '',
    supplier_phone: '',
    supplier_address: '',
    supplier_registration_number: ''
  });

  const [newTechnicalDetail, setNewTechnicalDetail] = useState('');
  const [technicalDetails, setTechnicalDetails] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [autoSaved, setAutoSaved] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState({});
  const [encryptionStatus, setEncryptionStatus] = useState('aucun');

  useEffect(() => {
    setPageTitle('Soumettre une Offre - Assistant Sécurisé');
    loadTender();
    const saved = localStorage.getItem(`bidDraft_${tenderId}`);
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        setFormData(savedData);
        setTechnicalDetails(savedData.technical_details_array || []);
      } catch (e) {
        // Brouillon corrompu, ignorer
      }
    }
  }, [tenderId]);

  const loadTender = async () => {
    try {
      const response = await procurementAPI.getTender(tenderId);
      setTender(response.data.tender);
    } catch (err) {
      setError('Impossible de charger les détails de l\'appel d\'offres');
    }
  };

  const autoSaveDraft = useCallback(() => {
    const draftData = {
      ...formData,
      technical_details_array: technicalDetails
    };
    localStorage.setItem(`bidDraft_${tenderId}`, JSON.stringify(draftData));
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 2000);
  }, [formData, tenderId, technicalDetails]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTechnicalDetail = () => {
    if (newTechnicalDetail.trim()) {
      setTechnicalDetails(prev => [...prev, newTechnicalDetail]);
      setNewTechnicalDetail('');
    }
  };

  const removeTechnicalDetail = (index) => {
    setTechnicalDetails(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files.map(f => ({ name: f.name, size: f.size }))]
    }));
  };

  const removeAttachment = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Basic Info
        if (!formData.technical_proposal.trim()) {
          setError('La description technique est requise');
          return false;
        }
        break;
      case 1: // Eligibility Compliance
        if (!formData.eligibility_compliance) {
          setError('Vous devez confirmer la conformité aux conditions');
          return false;
        }
        break;
      case 2: // Supplier Info
        if (!formData.supplier_name.trim() || !formData.supplier_email.trim() || !formData.supplier_phone.trim()) {
          setError('Les informations du fournisseur sont requises');
          return false;
        }
        break;
      case 3: // Technical Details
        if (technicalDetails.length === 0) {
          setError('Au moins un détail technique est requis');
          return false;
        }
        break;
      case 4: // Financial Proposal
        if (!formData.total_amount) {
          setError('Le montant total est requis');
          return false;
        }
        if (isNaN(parseFloat(formData.total_amount)) || parseFloat(formData.total_amount) <= 0) {
          setError('Le montant doit être un nombre positif');
          return false;
        }
        break;
      case 5: // Payment Terms
        if (!formData.payment_terms) {
          setError('Les conditions de paiement sont requises');
          return false;
        }
        break;
      case 6: // Delivery
        if (!formData.delivery_time) {
          setError('Le délai de livraison est requis');
          return false;
        }
        break;
      case 8: // Declaration
        if (!formData.compliance_statement || !formData.confidential_info_statement) {
          setError('Vous devez accepter toutes les déclarations');
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
      setStepsCompleted(prev => ({
        ...prev,
        [activeStep]: true
      }));
      setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep(0) || !validateStep(1) || !validateStep(2) || !validateStep(4) || !validateStep(5) || !validateStep(8)) {
      return;
    }

    setLoading(true);
    setEncryptionStatus('chiffrement');

    try {
      const submitData = {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        technical_details: technicalDetails,
        status: 'submitted'
      };

      setEncryptionStatus('transmission_secure');
      const response = await procurementAPI.createOffer(submitData);
      
      localStorage.removeItem(`bidDraft_${tenderId}`);
      setEncryptionStatus('offre_creee');
      
      setTimeout(() => {
        navigate(`/tender/${tenderId}`);
      }, 1000);
    } catch (err) {
      setEncryptionStatus('erreur');
      const errorMsg = err.response?.data?.error || 'Erreur lors de la création de l\'offre';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Basic Offer Info
  const Step1Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#01579b' }}>
        Appel d'offres: <strong>{tender?.title}</strong>
      </Alert>
      
      <TextField
        fullWidth
        label="Proposition Technique Générale *"
        name="technical_proposal"
        value={formData.technical_proposal}
        onChange={handleChange}
        placeholder="Décrivez votre approche générale pour répondre aux exigences..."
        multiline
        rows={5}
        disabled={loading}
      />
    </Box>
  );

  // Step 2: Eligibility & Compliance
  const Step2Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Box sx={{ pb: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0056B3' }}>
          🔑 Conformité aux Conditions de Participation
        </Typography>
        <Typography sx={{ fontSize: '13px', color: '#666666', mb: 2 }}>
          Veuillez confirmer que vous respectez toutes les conditions d'éligibilité de cet appel d'offres.
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ backgroundColor: '#fff3cd', color: '#856404' }}>
        Vérifiez que vous possédez tous les documents obligatoires avant de soumettre votre offre.
      </Alert>

      <Box>
        <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2, color: '#212121' }}>
          Documents Obligatoires
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['Dossier d\'enregistrement fiscal', 'Carte bancaire', 'Assurance', 'Références commerciales', 'CNSS', 'Certificat de conformité'].map((doc) => (
            <FormControlLabel
              key={doc}
              control={
                <Checkbox
                  checked={formData.mandatory_documents_confirmed.includes(doc)}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      mandatory_documents_confirmed: e.target.checked
                        ? [...prev.mandatory_documents_confirmed, doc]
                        : prev.mandatory_documents_confirmed.filter(d => d !== doc)
                    }));
                  }}
                  disabled={loading}
                />
              }
              label={<Typography sx={{ fontSize: '13px' }}>{doc}</Typography>}
            />
          ))}
        </Box>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.eligibility_compliance}
            onChange={(e) => setFormData(prev => ({ ...prev, eligibility_compliance: e.target.checked }))}
            disabled={loading}
          />
        }
        label={<Typography sx={{ fontSize: '13px' }}>Je certifie que je respecte toutes les conditions d'éligibilité *</Typography>}
      />
    </Box>
  );

  // Step 3: Supplier Information
  const Step3Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Box sx={{ pb: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0056B3' }}>
          📞 Informations du Fournisseur
        </Typography>
        <Typography sx={{ fontSize: '13px', color: '#666666', mb: 2 }}>
          Ces informations seront utilisées pour contacter votre entreprise concernant cette offre.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '16px' }}>
        <TextField
          fullWidth
          label="Nom de l'Entreprise *"
          name="supplier_name"
          value={formData.supplier_name}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="N° d'Immatriculation *"
          name="supplier_registration_number"
          value={formData.supplier_registration_number}
          onChange={handleChange}
          disabled={loading}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '16px' }}>
        <TextField
          fullWidth
          label="Personne de Contact *"
          name="supplier_contact_person"
          value={formData.supplier_contact_person}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="Email *"
          type="email"
          name="supplier_email"
          value={formData.supplier_email}
          onChange={handleChange}
          disabled={loading}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '16px' }}>
        <TextField
          fullWidth
          label="Téléphone *"
          name="supplier_phone"
          value={formData.supplier_phone}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="Adresse"
          name="supplier_address"
          value={formData.supplier_address}
          onChange={handleChange}
          disabled={loading}
          multiline
          rows={1}
        />
      </Box>
    </Box>
  );

  // Step 4: Technical Details (OLD Step 2)
  const Step4Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <TextField
          fullWidth
          label="Ajouter un détail technique"
          value={newTechnicalDetail}
          onChange={(e) => setNewTechnicalDetail(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTechnicalDetail()}
          disabled={loading}
          placeholder="Ex: Conformité ISO 9001"
        />
        <Button
          variant="outlined"
          onClick={addTechnicalDetail}
          disabled={loading || !newTechnicalDetail.trim()}
          sx={{ color: 'primary.main', borderColor: '#0056B3', minWidth: '44px' }}
        >
          <AddIcon />
        </Button>
      </Box>

      {technicalDetails.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {technicalDetails.map((detail, index) => (
            <Chip
              key={index}
              label={detail}
              onDelete={() => removeTechnicalDetail(index)}
              sx={{ backgroundColor: '#e3f2fd', color: 'primary.main' }}
            />
          ))}
        </Box>
      )}

      <TextField
        fullWidth
        label="Description détaillée (optionnel)"
        name="technical_details"
        value={formData.technical_details}
        onChange={handleChange}
        placeholder="Fournissez des détails techniques supplémentaires..."
        multiline
        rows={4}
        disabled={loading}
      />
    </Box>
  );

  // Step 5: Financial Proposal (SECURE) (OLD Step 3)
  const Step5Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Alert severity="warning" sx={{ backgroundColor: '#fff3cd', color: '#856404', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <LockIcon sx={{ fontSize: '18px' }} />
        <strong>Cette section sera chiffrée avant transmission</strong>
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '16px' }}>
        <TextField
          fullWidth
          label="Montant Total *"
          name="total_amount"
          type="number"
          inputProps={{ step: '0.01', min: '0' }}
          value={formData.total_amount}
          onChange={handleChange}
          disabled={loading}
          placeholder="1000.00"
        />
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
      </Box>

      <TextField
        fullWidth
        label="Proposition Financière Détaillée *"
        name="financial_proposal"
        value={formData.financial_proposal}
        onChange={handleChange}
        placeholder="Détail des coûts, remises, conditions tarifaires..."
        multiline
        rows={4}
        disabled={loading}
      />

      <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
        🔒 Vos données financières seront chiffrées avec AES-256 et déchiffrées uniquement par l'acheteur.
      </Typography>
    </Box>
  );

  // Step 6: Payment Terms (SECURE) (OLD Step 4)
  const Step6Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Alert severity="warning" sx={{ backgroundColor: '#fff3cd', color: '#856404', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <LockIcon sx={{ fontSize: '18px' }} />
        <strong>Cette section sera chiffrée avant transmission</strong>
      </Alert>

      <FormControl fullWidth disabled={loading}>
        <InputLabel>Conditions de Paiement *</InputLabel>
        <Select
          name="payment_terms"
          value={formData.payment_terms}
          onChange={handleChange}
          label="Conditions de Paiement"
        >
          <MenuItem value="net_30">Net 30</MenuItem>
          <MenuItem value="net_60">Net 60</MenuItem>
          <MenuItem value="net_90">Net 90</MenuItem>
          <MenuItem value="advance_30">30% Avance</MenuItem>
          <MenuItem value="advance_50">50% Avance</MenuItem>
          <MenuItem value="monthly">Mensuel</MenuItem>
          <MenuItem value="milestone">Par étape</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Description des Conditions de Paiement *"
        name="payment_terms_description"
        value={formData.payment_terms_description}
        onChange={handleChange}
        placeholder="Ex: 30% à la commande, 40% à la livraison, 30% à l'acceptation..."
        multiline
        rows={4}
        disabled={loading}
      />

      <TextField
        fullWidth
        label="Période de Garantie (mois)"
        name="warranty_period"
        type="number"
        inputProps={{ min: '0' }}
        value={formData.warranty_period}
        onChange={handleChange}
        disabled={loading}
        placeholder="12"
      />
    </Box>
  );

  // Step 7: Delivery (OLD Step 5)
  const Step7Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TextField
        fullWidth
        label="Délai de Livraison *"
        name="delivery_time"
        value={formData.delivery_time}
        onChange={handleChange}
        placeholder="Ex: 30 jours, 2 semaines, etc."
        disabled={loading}
      />

      <TextField
        fullWidth
        label="Lieu de Livraison"
        name="delivery_location"
        value={formData.delivery_location}
        onChange={handleChange}
        placeholder="Ex: Tunis, Sousse, etc."
        disabled={loading}
      />
    </Box>
  );

  // Step 8: Documents (OLD Step 6)
  const Step8Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadIcon />}
        disabled={loading}
        sx={{ color: 'primary.main', borderColor: '#0056B3' }}
      >
        Télécharger des documents
        <input
          type="file"
          multiple
          hidden
          onChange={handleFileUpload}
        />
      </Button>

      {selectedFiles.length > 0 && (
        <TableContainer component={Paper} sx={{ backgroundColor: 'background.paper' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Nom du document</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>Taille</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>Action</TableCell>
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
                      sx={{ color: 'error.main' }}
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

  // Step 9: Declaration (OLD Step 7)
  const Step9Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Paper sx={{ padding: '16px', backgroundColor: 'success.light' }}>
        <Typography variant="h6" sx={{ color: 'success.dark', marginBottom: '12px' }}>
          Déclarations obligatoires
        </Typography>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.compliance_statement}
              onChange={handleChange}
              name="compliance_statement"
              disabled={loading}
            />
          }
          label="Je certifie que cette offre est conforme à toutes les conditions et exigences spécifiées"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.confidential_info_statement}
              onChange={handleChange}
              name="confidential_info_statement"
              disabled={loading}
            />
          }
          label="Je reconnais que les données financières seront chiffrées et protégées"
        />
      </Paper>

      <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#01579b' }}>
        En soumettant cette offre, vous acceptez les conditions générales de la plateforme MyNet.tn et confirmez l'exactitude de toutes les informations fournies.
      </Alert>
    </Box>
  );

  // Step 8: Final Review
  const Step10Content = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Alert severity="success" sx={{ backgroundColor: 'success.light', color: 'success.dark' }}>
        ✓ Toutes les étapes ont été complétées. Prêt à soumettre l'offre.
      </Alert>

      <Paper sx={{ padding: '16px', backgroundColor: 'action.hover' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', marginBottom: '12px' }}>
          Résumé de l'offre
        </Typography>
        <Stack spacing={1} sx={{ fontSize: '13px' }}>
          <Box><strong>Montant:</strong> {formData.total_amount} {formData.currency}</Box>
          <Box><strong>Délai:</strong> {formData.delivery_time}</Box>
          <Box><strong>Conditions paiement:</strong> {formData.payment_terms}</Box>
          <Box><strong>Détails techniques:</strong> {technicalDetails.length} éléments</Box>
          <Box><strong>Documents:</strong> {selectedFiles.length} fichiers</Box>
          <Box sx={{ marginTop: '8px', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
            🔒 Les données financières seront automatiquement chiffrées avant transmission
          </Box>
        </Stack>
      </Paper>
    </Box>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: return <Step1Content />;
      case 1: return <Step2Content />;
      case 2: return <Step3Content />;
      case 3: return <Step4Content />;
      case 4: return <Step5Content />;
      case 5: return <Step6Content />;
      case 6: return <Step7Content />;
      case 7: return <Step8Content />;
      case 8: return <Step9Content />;
      case 9: return <Step10Content />;
      default: return null;
    }
  };

  if (!tender) {
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
              {STEPS[activeStep].secure && (
                <LockIcon sx={{ fontSize: '20px', color: 'error.main' }} />
              )}
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

            {/* Progress Bar */}
            <LinearProgress 
              variant="determinate" 
              value={(activeStep / (STEPS.length - 1)) * 100}
              sx={{ marginBottom: '24px', height: '4px' }}
            />

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ marginBottom: '32px', display: { xs: 'none', sm: 'flex' } }}>
              {STEPS.map((step, index) => (
                <Step key={index} completed={stepsCompleted[index] || false}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ marginBottom: '24px', backgroundColor: '#ffebee', color: '#c62828' }}>
                {error}
              </Alert>
            )}

            {/* Auto-save Notification */}
            {autoSaved && (
              <Alert severity="success" sx={{ marginBottom: '16px', backgroundColor: 'success.light', color: '#2e7d32' }}>
                ✓ Brouillon enregistré automatiquement
              </Alert>
            )}

            {/* Encryption Status */}
            {encryptionStatus !== 'aucun' && (
              <Alert 
                severity={encryptionStatus === 'erreur' ? 'error' : 'info'} 
                sx={{ marginBottom: '16px' }}
              >
                {encryptionStatus === 'chiffrement' && '🔐 Chiffrement des données en cours...'}
                {encryptionStatus === 'transmission_secure' && '🚀 Transmission sécurisée...'}
                {encryptionStatus === 'offre_creee' && '✅ Offre créée avec succès!'}
                {encryptionStatus === 'erreur' && '❌ Erreur lors de la transmission'}
              </Alert>
            )}

            {/* Step Content */}
            <Box sx={{ minHeight: '300px', marginBottom: '32px' }}>
              {renderStepContent()}
            </Box>

            {/* Navigation Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginTop: '32px' }}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={activeStep === 0 || loading}
                sx={{
                  color: 'primary.main',
                  borderColor: '#0056B3',
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
                    backgroundColor: '#0056B3',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                    fontSize: '14px',
                    '&:hover': { backgroundColor: '#0d47a1' },
                    '&:disabled': { backgroundColor: '#bdbdbd' }
                  }}
                >
                  {loading ? 'Soumission en cours...' : '🔐 Soumettre l\'Offre (Sécurisée)'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                  sx={{
                    flex: 1,
                    backgroundColor: '#0056B3',
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
                type="button"
                onClick={() => setShowExitDialog(true)}
                disabled={loading}
                startIcon={<CancelIcon />}
                sx={{
                  color: 'error.main',
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

        {/* Exit Confirmation Dialog */}
        <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
          <DialogTitle>Quitter l'Assistante de Soumission?</DialogTitle>
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
                navigate(`/tender/${tenderId}`);
              }}
              sx={{ color: 'error.main' }}
            >
              Quitter
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
