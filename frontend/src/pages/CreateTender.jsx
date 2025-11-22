import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadIcon from '@mui/icons-material/Upload';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function CreateTender() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState('general');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technology',
    budget_min: '',
    budget_max: '',
    currency: 'TND',
    deadline: '',
    is_public: true,
    requirements: [],
    attachments: [],
    evaluation_criteria: {
      price: 30,
      quality: 40,
      delivery: 20,
      experience: 10
    }
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    setPageTitle('Créer un Appel d\'Offres');
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCriteriaChange = (criterion, value) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      evaluation_criteria: {
        ...prev.evaluation_criteria,
        [criterion]: numValue
      }
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
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

  const validateForm = () => {
    if (!formData.title.trim() || formData.title.length < 5) {
      setError('Le titre doit contenir au moins 5 caractères');
      return false;
    }
    if (!formData.description.trim()) {
      setError('La description est requise');
      return false;
    }
    if (!formData.budget_min || !formData.budget_max) {
      setError('Les budgets minimum et maximum sont requis');
      return false;
    }
    if (parseFloat(formData.budget_min) > parseFloat(formData.budget_max)) {
      setError('Le budget minimum doit être inférieur au budget maximum');
      return false;
    }
    if (!formData.deadline) {
      setError('La date de fermeture est requise');
      return false;
    }
    if (new Date(formData.deadline) <= new Date()) {
      setError('La date de fermeture doit être dans le futur');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max)
      };

      const response = await procurementAPI.createTender(submitData);
      navigate(`/tender/${response.data.tender.id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur lors de la création de l\'appel d\'offres';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const totalCriteria = Object.values(formData.evaluation_criteria).reduce((a, b) => a + b, 0);

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '4px', boxShadow: 'none' }}>
          <CardContent sx={{ padding: '40px' }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: '28px', 
                fontWeight: 500, 
                color: '#0056B3', 
                marginBottom: '8px' 
              }}
            >
              Créer un Appel d'Offres
            </Typography>
            <Typography 
              sx={{ 
                color: '#616161', 
                marginBottom: '32px',
                fontSize: '14px'
              }}
            >
              Remplissez les détails complets de votre appel d'offres. Tous les champs marqués d'une astérisque (*) sont obligatoires.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ marginBottom: '24px', backgroundColor: '#ffebee', color: '#c62828' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Section Générale */}
              <Accordion 
                expanded={expandedSection === 'general'} 
                onChange={() => setExpandedSection(expandedSection === 'general' ? false : 'general')}
                sx={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#212121' }}>
                    📋 Informations Générales
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '24px', backgroundColor: '#fafafa' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Titre *"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ex: Fourniture d'équipements informatiques"
                      required
                      disabled={loading}
                      helperText={`${formData.title.length}/100 caractères`}
                      inputProps={{ maxLength: 100 }}
                    />

                    <TextField
                      fullWidth
                      label="Description *"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Décrivez en détail l'objet de votre appel d'offres, les services attendus, et les conditions de participation..."
                      multiline
                      rows={4}
                      required
                      disabled={loading}
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          name="is_public"
                          checked={formData.is_public}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      }
                      label="Appel d'offres public (visible pour tous les fournisseurs)"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Section Classification */}
              <Accordion 
                expanded={expandedSection === 'classification'} 
                onChange={() => setExpandedSection(expandedSection === 'classification' ? false : 'classification')}
                sx={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#212121' }}>
                    🏷️ Classification
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '24px', backgroundColor: '#fafafa' }}>
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel>Catégorie *</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Catégorie"
                    >
                      <MenuItem value="technology">Technologie & Informatique</MenuItem>
                      <MenuItem value="supplies">Fournitures & Matériaux</MenuItem>
                      <MenuItem value="construction">Construction & Travaux</MenuItem>
                      <MenuItem value="services">Services</MenuItem>
                      <MenuItem value="consulting">Consulting & Expertise</MenuItem>
                      <MenuItem value="maintenance">Maintenance & Support</MenuItem>
                      <MenuItem value="training">Formation & Coaching</MenuItem>
                    </Select>
                  </FormControl>
                </AccordionDetails>
              </Accordion>

              {/* Section Budget */}
              <Accordion 
                expanded={expandedSection === 'budget'} 
                onChange={() => setExpandedSection(expandedSection === 'budget' ? false : 'budget')}
                sx={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#212121' }}>
                    💰 Budget & Devise
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '24px', backgroundColor: '#fafafa' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '16px' }}>
                      <TextField
                        fullWidth
                        label="Budget Minimum (TND) *"
                        name="budget_min"
                        type="number"
                        inputProps={{ step: '0.01', min: '0' }}
                        value={formData.budget_min}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                      <TextField
                        fullWidth
                        label="Budget Maximum (TND) *"
                        name="budget_max"
                        type="number"
                        inputProps={{ step: '0.01', min: '0' }}
                        value={formData.budget_max}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </Box>

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
                </AccordionDetails>
              </Accordion>

              {/* Section Calendrier */}
              <Accordion 
                expanded={expandedSection === 'timeline'} 
                onChange={() => setExpandedSection(expandedSection === 'timeline' ? false : 'timeline')}
                sx={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#212121' }}>
                    📅 Calendrier
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '24px', backgroundColor: '#fafafa' }}>
                  <TextField
                    fullWidth
                    label="Date de Fermeture *"
                    name="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    disabled={loading}
                    helperText="Sélectionnez la date et l'heure limite pour les soumissions"
                  />
                </AccordionDetails>
              </Accordion>

              {/* Section Conditions & Exigences */}
              <Accordion 
                expanded={expandedSection === 'requirements'} 
                onChange={() => setExpandedSection(expandedSection === 'requirements' ? false : 'requirements')}
                sx={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#212121' }}>
                    ✅ Conditions & Exigences
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '24px', backgroundColor: '#fafafa' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <Box sx={{ display: 'flex', gap: '8px' }}>
                      <TextField
                        fullWidth
                        label="Ajouter une exigence"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                        disabled={loading}
                        placeholder="Ex: Expérience minimale de 3 ans"
                      />
                      <Button
                        variant="outlined"
                        onClick={addRequirement}
                        disabled={loading || !newRequirement.trim()}
                        sx={{ color: '#0056B3', borderColor: '#0056B3', minWidth: '44px' }}
                      >
                        <AddIcon />
                      </Button>
                    </Box>

                    {formData.requirements.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {formData.requirements.map((req, index) => (
                          <Chip
                            key={index}
                            label={req}
                            onDelete={() => removeRequirement(index)}
                            sx={{ backgroundColor: '#e3f2fd', color: '#0056B3' }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Section Critères d'Évaluation */}
              <Accordion 
                expanded={expandedSection === 'criteria'} 
                onChange={() => setExpandedSection(expandedSection === 'criteria' ? false : 'criteria')}
                sx={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#212121' }}>
                    📊 Critères d'Évaluation
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '24px', backgroundColor: '#fafafa' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <Typography sx={{ color: '#616161', fontSize: '13px' }}>
                      Réglez le poids de chaque critère d'évaluation (total: {totalCriteria}%)
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '16px' }}>
                      {Object.entries(formData.evaluation_criteria).map(([key, value]) => (
                        <TextField
                          key={key}
                          label={`${key.charAt(0).toUpperCase() + key.slice(1)} (%)`}
                          type="number"
                          inputProps={{ min: '0', max: '100', step: '1' }}
                          value={value}
                          onChange={(e) => handleCriteriaChange(key, e.target.value)}
                          disabled={loading}
                        />
                      ))}
                    </Box>

                    {totalCriteria !== 100 && (
                      <Alert severity="warning" sx={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                        Le total des critères doit égaler 100% (actuellement: {totalCriteria}%)
                      </Alert>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Section Pièces Jointes */}
              <Accordion 
                expanded={expandedSection === 'attachments'} 
                onChange={() => setExpandedSection(expandedSection === 'attachments' ? false : 'attachments')}
                sx={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#212121' }}>
                    📎 Pièces Jointes
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '24px', backgroundColor: '#fafafa' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      disabled={loading}
                      sx={{ color: '#0056B3', borderColor: '#0056B3' }}
                    >
                      Télécharger des fichiers
                      <input
                        type="file"
                        multiple
                        hidden
                        onChange={handleFileUpload}
                      />
                    </Button>

                    {selectedFiles.length > 0 && (
                      <TableContainer component={Paper} sx={{ backgroundColor: '#ffffff' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell sx={{ fontWeight: 600, color: '#212121' }}>Nom du fichier</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: '#212121' }}>Taille</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600, color: '#212121' }}>Action</TableCell>
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
                </AccordionDetails>
              </Accordion>

              {/* Boutons d'action */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginTop: '32px' }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading || totalCriteria !== 100}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
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
                  {loading ? 'Création en cours...' : 'Créer l\'Appel d\'Offres'}
                </Button>
                <Button
                  variant="outlined"
                  type="button"
                  onClick={() => navigate('/tenders')}
                  disabled={loading}
                  startIcon={<CancelIcon />}
                  sx={{
                    flex: 1,
                    color: '#0056B3',
                    borderColor: '#0056B3',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                    fontSize: '14px',
                    '&:hover': { 
                      backgroundColor: '#f0f7ff',
                      borderColor: '#0056B3'
                    }
                  }}
                >
                  Annuler
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
