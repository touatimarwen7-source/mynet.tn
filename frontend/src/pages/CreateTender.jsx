import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
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
  Select,
  MenuItem,
  Stack,
  FormControlLabel,
  Checkbox,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { setPageTitle } from '../utils/pageTitle';
import { procurementAPI } from '../api';
import { validateLots, validateBudget, handleAPIError } from '../utils/validationHelpers';
import { autosaveDraft, recoverDraft, clearDraft } from '../utils/draftStorageHelper';
import { UNIT_OPTIONS } from '../utils/unitOptions';

// ============ Configuration ============
const STAGES = [
  { name: 'Informations', description: 'Détails généraux' },
  { name: 'Lots', description: 'Division en lots' },
  { name: 'Exigences', description: 'Critères obligatoires' },
  { name: 'Évaluation', description: 'Critères d\'évaluation' },
  { name: 'Spécifications', description: 'Cahier des charges et documents' },
  { name: 'Finalisation', description: 'Révision finale' },
];

const CATEGORIES = [
  { value: 'technology', label: 'Technologie & IT' },
  { value: 'supplies', label: 'Fournitures & Consommables' },
  { value: 'services', label: 'Services' },
  { value: 'construction', label: 'Construction & Travaux' },
  { value: 'other', label: 'Autres' },
];

const REQUIREMENT_TYPES = [
  { value: 'technical', label: 'Technique' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'administrative', label: 'Administratif' },
  { value: 'legal', label: 'Légal' },
];

const REQUIREMENT_PRIORITIES = [
  { value: 'essential', label: 'Essentielle', color: '#d32f2f' },
  { value: 'important', label: 'Important', color: '#ff9800' },
  { value: 'desirable', label: 'Souhaitable', color: '#4caf50' },
];

// ============ Initial State ============
const getInitialFormData = () => ({
  consultation_number: '',
  reference_id: '',
  title: '',
  description: '',
  category: 'technology',
  quantity_required: '',
  unit: '',
  publication_date: '',
  deadline: '',
  opening_date: '',
  queries_start_date: '',
  queries_end_date: '',
  offer_validity_days: '90',
  alert_type: 'before_48h',
  is_public: true,
  lots: [],
  awardLevel: 'lot', // Global award level: 'lot', 'article', 'tender'
  participation_eligibility: '',
  mandatory_documents: [],
  disqualification_criteria: '',
  submission_method: 'electronic',
  sealed_envelope_requirements: '',
  contact_person: '',
  contact_email: '',
  contact_phone: '',
  technical_specifications: '',
  requirements: [],
  attachments: [],
  specification_documents: [],
  evaluation_criteria: {
    price: 30,
    quality: 40,
    delivery: 20,
    experience: 10,
  },
});

// ============ Step Components ============
const StepOne = ({ formData, handleChange, loading }) => {
  const theme = institutionalTheme;
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Consultation Number & Reference ID */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '8px' }}>
            N° Consultation *
          </Typography>
          <TextField
            fullWidth
            placeholder="Ex: CONS-2024-001"
            name="consultation_number"
            value={formData.consultation_number}
            onChange={handleChange}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
                backgroundColor: '#FAFAFA',
              },
            }}
          />
        </Box>
        <Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '8px' }}>
            ID Référence *
          </Typography>
          <TextField
            fullWidth
            placeholder="Ex: REF-2024-TNS-001"
            name="reference_id"
            value={formData.reference_id}
            onChange={handleChange}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
                backgroundColor: '#FAFAFA',
              },
            }}
          />
        </Box>
      </Box>

      {/* Title */}
      <Box>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '8px' }}>
          Titre de l'Appel d'Offres *
        </Typography>
        <TextField
          fullWidth
          placeholder="Ex: Fourniture d'équipements informatiques"
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={loading}
          inputProps={{ maxLength: 100 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
              backgroundColor: '#FAFAFA',
            },
          }}
        />
        <Typography sx={{ fontSize: '12px', color: '#999999', mt: '6px' }}>
          {(formData.title || '').length}/100 caractères
        </Typography>
      </Box>

      {/* Description */}
      <Box>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '8px' }}>
          Description Détaillée *
        </Typography>
        <TextField
          fullWidth
          placeholder="Décrivez l'objet de votre appel d'offres en détail..."
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
          multiline
          rows={5}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
              backgroundColor: '#FAFAFA',
            },
          }}
        />
        <Typography sx={{ fontSize: '12px', color: '#999999', mt: '6px' }}>
          Minimum 20 caractères | Actuel: {(formData.description || '').length}
        </Typography>
      </Box>

      {/* Category */}
      <FormControl>
        <InputLabel sx={{ fontSize: '13px' }}>Catégorie *</InputLabel>
        <Select
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={loading}
          label="Catégorie *"
          sx={{ borderRadius: '4px' }}
        >
          {CATEGORIES.map((cat) => (
            <MenuItem key={cat.value} value={cat.value}>
              {cat.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Visibility */}
      <FormControlLabel
        control={
          <Checkbox
            name="is_public"
            checked={formData.is_public}
            onChange={handleChange}
            disabled={loading}
            sx={{ color: theme.palette.primary.main }}
          />
        }
        label="🌐 Appel d'offres public (visible à tous les fournisseurs)"
      />
    </Box>
  );
};

const StepTwo = ({ formData, handleChange, loading }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Publication Date */}
      <Box>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '8px' }}>
          Date de Publication *
        </Typography>
        <TextField
          fullWidth
          type="datetime-local"
          name="publication_date"
          value={formData.publication_date}
          onChange={handleChange}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
              backgroundColor: '#FAFAFA',
            },
          }}
        />
      </Box>

      {/* Deadline */}
      <Box>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '8px' }}>
          Date de Clôture *
        </Typography>
        <TextField
          fullWidth
          type="datetime-local"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
              backgroundColor: '#FAFAFA',
            },
          }}
        />
      </Box>

      {/* Opening Date */}
      <Box>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '8px' }}>
          Date d'Ouverture
        </Typography>
        <TextField
          fullWidth
          type="datetime-local"
          name="opening_date"
          value={formData.opening_date}
          onChange={handleChange}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
              backgroundColor: '#FAFAFA',
            },
          }}
        />
      </Box>
    </Box>
  );
};

const StepThree = ({ formData, setFormData, loading }) => {
  const [newLot, setNewLot] = useState({ numero: '', objet: '', articles: [] });
  const [newArticle, setNewArticle] = useState({ name: '', quantity: '', unit: '' });
  const [editingLotIndex, setEditingLotIndex] = useState(null);
  const [editingArticleIndex, setEditingArticleIndex] = useState(null);
  const theme = institutionalTheme;

  const handleAddArticle = () => {
    // Validate all required article fields
    if (!newArticle.name.trim() || !newArticle.quantity.trim() || !newArticle.unit || newArticle.unit === 'unité') {
      alert('✋ Veuillez remplir: Nom, Quantité et Unité de l\'article');
      return;
    }
    
    const updated = [...(newLot.articles || [])];
    if (editingArticleIndex !== null) {
      updated[editingArticleIndex] = newArticle;
      setEditingArticleIndex(null);
    } else {
      updated.push(newArticle);
    }
    setNewLot({ ...newLot, articles: updated });
    setNewArticle({ name: '', quantity: '', unit: '' });
  };

  const handleRemoveArticle = (index) => {
    setNewLot({
      ...newLot,
      articles: (newLot.articles || []).filter((_, i) => i !== index),
    });
  };

  const handleEditArticle = (index) => {
    setNewArticle((newLot.articles || [])[index]);
    setEditingArticleIndex(index);
  };

  const handleAddLot = () => {
    if (newLot.numero.trim() && newLot.objet.trim() && (newLot.articles || []).length > 0) {
      if (editingLotIndex !== null) {
        const updated = [...formData.lots];
        updated[editingLotIndex] = newLot;
        setFormData((prev) => ({ ...prev, lots: updated }));
        setEditingLotIndex(null);
      } else {
        setFormData((prev) => ({
          ...prev,
          lots: [...(prev.lots || []), newLot],
        }));
      }
      setNewLot({ numero: '', objet: '', articles: [] });
      setNewArticle({ name: '', quantity: '', unit: '' });
    }
  };

  const handleEditLot = (index) => {
    setNewLot(formData.lots[index]);
    setEditingLotIndex(index);
  };

  const handleRemoveLot = (index) => {
    setFormData((prev) => ({
      ...prev,
      lots: (prev.lots || []).filter((_, i) => i !== index),
    }));
  };

  const lots = formData.lots || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Award Level Selection */}
      <Box sx={{ p: '16px', backgroundColor: '#FFF3E0', borderRadius: '4px', borderLeft: '4px solid #FF9800' }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#F57C00', mb: '12px' }}>
          🎯 Niveau de ترسية (Attribution)
        </Typography>
        <Typography sx={{ fontSize: '12px', color: '#666666', mb: '12px' }}>
          Sélectionnez à quel niveau l'attribution sera effectuée :
        </Typography>
        <Stack direction="row" spacing={2}>
          {[
            { value: 'lot', label: 'Par Lot', description: 'Un lot entier à un fournisseur' },
            { value: 'article', label: 'Par Article', description: 'Chaque article à un fournisseur' },
            { value: 'tender', label: 'Global', description: 'Toute l\'appel d\'offres' },
          ].map((option) => (
            <Box
              key={option.value}
              onClick={() => setFormData((prev) => ({ ...prev, awardLevel: option.value }))}
              sx={{
                flex: 1,
                p: '12px',
                border: formData.awardLevel === option.value ? '2px solid #0056B3' : '1px solid #ddd',
                backgroundColor: formData.awardLevel === option.value ? '#E3F2FD' : '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#0056B3' },
              }}
            >
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121' }}>
                {option.label}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#666666' }}>
                {option.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Lot Input */}
      <Box sx={{ p: '16px', backgroundColor: '#E3F2FD', borderRadius: '4px', borderLeft: '4px solid #0056B3' }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
          ➕ Créer un Nouveau Lot
        </Typography>

        <Stack spacing={2}>
          {/* Lot Number */}
          <TextField
            fullWidth
            label="Numéro du Lot *"
            placeholder="Ex: 1, 2, 3..."
            value={newLot.numero}
            onChange={(e) => setNewLot({ ...newLot, numero: e.target.value })}
            disabled={loading}
            size="small"
            helperText="Exemple: Lot 1: Informatique"
          />

          {/* Lot Object/Description */}
          <TextField
            fullWidth
            label="Objet du Lot (Description) *"
            placeholder="Ex: Informatique, Fournitures de Bureau, Services..."
            value={newLot.objet}
            onChange={(e) => setNewLot({ ...newLot, objet: e.target.value })}
            disabled={loading}
            size="small"
            multiline
            rows={2}
          />

          {/* Articles Section - Hierarchical */}
          <Box sx={{ p: '14px', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '2px dashed #0056B3' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '14px' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#0056B3' }}>
                📦 Articles du Lot {newLot.numero || '?'}
              </Typography>
              <Box
                sx={{
                  fontSize: '10px',
                  color: '#fff',
                  backgroundColor: '#0056B3',
                  px: '6px',
                  py: '2px',
                  borderRadius: '12px',
                }}
              >
                {(newLot.articles || []).length}
              </Box>
            </Box>

            <Typography sx={{ fontSize: '11px', color: '#666666', mb: '12px', fontStyle: 'italic' }}>
              📌 Les articles ci-dessous appartiennent au Lot ci-dessus
            </Typography>

            {/* Article Input */}
            <Stack spacing={2} sx={{ mb: '12px' }}>
              <TextField
                fullWidth
                label="Nom de l'Article"
                placeholder="Ex: Imprimante Laser"
                value={newArticle.name}
                onChange={(e) => setNewArticle({ ...newArticle, name: e.target.value })}
                disabled={loading}
                size="small"
              />

              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  label="Quantité"
                  type="number"
                  value={newArticle.quantity}
                  onChange={(e) => setNewArticle({ ...newArticle, quantity: e.target.value })}
                  disabled={loading}
                  size="small"
                  inputProps={{ min: '1' }}
                />

                <Select
                  value={newArticle.unit}
                  onChange={(e) => setNewArticle({ ...newArticle, unit: e.target.value })}
                  disabled={loading}
                  size="small"
                  sx={{ minWidth: '120px' }}
                >
                  {UNIT_OPTIONS.map((group) => [
                    <MenuItem key={`header-${group.group}`} disabled sx={{ fontWeight: 600, color: '#0056B3', fontSize: '12px' }}>
                      ─ {group.group}
                    </MenuItem>,
                    ...group.options.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ pl: '24px', fontSize: '12px' }}>
                        {opt.label}
                      </MenuItem>
                    )),
                  ])}
                </Select>

                <Button
                  variant="contained"
                  onClick={handleAddArticle}
                  disabled={loading}
                  sx={{
                    backgroundColor: '#0056B3',
                    color: '#fff',
                    textTransform: 'none',
                  }}
                >
                  {editingArticleIndex !== null ? '✓ MAJ' : '+ Ajouter'}
                </Button>

                {editingArticleIndex !== null && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setNewArticle({ name: '', quantity: '', unit: '' });
                      setEditingArticleIndex(null);
                    }}
                    disabled={loading}
                    sx={{ color: '#d32f2f', borderColor: '#d32f2f' }}
                  >
                    Annuler
                  </Button>
                )}
              </Stack>
            </Stack>

            {/* Articles List */}
            {(newLot.articles || []).length > 0 && (
              <Stack spacing={1}>
                {newLot.articles.map((article, idx) => (
                  <Paper
                    key={idx}
                    sx={{
                      p: '8px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#F9F9F9',
                      borderLeft: '3px solid #4CAF50',
                    }}
                  >
                    <Typography sx={{ fontSize: '12px', color: '#212121' }}>
                      {article.name} - {article.quantity} {article.unit}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: '4px' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditArticle(idx)}
                        disabled={loading}
                      >
                        <EditIcon sx={{ fontSize: '16px', color: '#0056B3' }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveArticle(idx)}
                        disabled={loading}
                      >
                        <DeleteIcon sx={{ fontSize: '16px', color: '#d32f2f' }} />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleAddLot}
              disabled={loading || (newLot.articles || []).length === 0}
              sx={{
                backgroundColor: '#0056B3',
                color: '#fff',
                flex: 1,
                textTransform: 'none',
              }}
            >
              {editingLotIndex !== null ? '✓ Mettre à Jour' : '✓ Ajouter Lot'}
            </Button>
            {editingLotIndex !== null && (
              <Button
                variant="outlined"
                onClick={() => {
                  setNewLot({ numero: '', objet: '', articles: [] });
                  setEditingLotIndex(null);
                  setNewArticle({ name: '', quantity: '', unit: '' });
                  setEditingArticleIndex(null);
                }}
                disabled={loading}
                sx={{ color: '#d32f2f', borderColor: '#d32f2f' }}
              >
                Annuler
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Lots List */}
      {lots.length > 0 && (
        <Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '12px' }}>
            📋 Lots ({lots.length})
          </Typography>
          <Stack spacing={2}>
            {lots.map((lot, index) => (
              <Paper
                key={index}
                sx={{
                  p: '16px',
                  backgroundColor: '#F9F9F9',
                  borderLeft: '4px solid #0056B3',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '12px' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121' }}>
                      Lot {lot.numero}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#666666' }}>
                      {lot.objet}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: '8px' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditLot(index)}
                      disabled={loading}
                    >
                      <EditIcon sx={{ fontSize: '18px', color: '#0056B3' }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveLot(index)}
                      disabled={loading}
                    >
                      <DeleteIcon sx={{ fontSize: '18px', color: '#d32f2f' }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Articles Display - Hierarchical */}
                {(lot.articles || []).length > 0 && (
                  <Box sx={{ mt: '12px', ml: '16px', pl: '12px', borderLeft: '3px dashed #0056B3' }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#0056B3', mb: '8px' }}>
                      📌 Articles :
                    </Typography>
                    <Stack spacing={1}>
                      {lot.articles.map((article, aIdx) => (
                        <Box
                          key={aIdx}
                          sx={{
                            p: '8px 10px',
                            backgroundColor: '#FAFAFA',
                            borderLeft: '3px solid #4CAF50',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <Typography sx={{ fontSize: '11px', color: '#4CAF50', fontWeight: 600 }}>
                            ├─
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: '11px', fontWeight: 500, color: '#212121' }}>
                              {article.name}
                            </Typography>
                            <Typography sx={{ fontSize: '10px', color: '#999999' }}>
                              Quantité: <strong>{article.quantity} {article.unit}</strong>
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

const StepFour = ({ formData, setFormData, loading }) => {
  const [newReq, setNewReq] = useState('');
  const [reqType, setReqType] = useState('technical');
  const [reqPriority, setReqPriority] = useState('important');
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddRequirement = () => {
    if (newReq.trim()) {
      if (editingIndex !== null) {
        const updated = [...formData.requirements];
        updated[editingIndex] = { text: newReq, type: reqType, priority: reqPriority };
        setFormData((prev) => ({ ...prev, requirements: updated }));
        setEditingIndex(null);
      } else {
        setFormData((prev) => ({
          ...prev,
          requirements: [
            ...(prev.requirements || []),
            { text: newReq, type: reqType, priority: reqPriority },
          ],
        }));
      }
      setNewReq('');
      setReqType('technical');
      setReqPriority('important');
    }
  };

  const handleRemoveRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      requirements: (prev.requirements || []).filter((_, i) => i !== index),
    }));
  };

  const handleEditRequirement = (index) => {
    const req = formData.requirements[index];
    setNewReq(req.text);
    setReqType(req.type);
    setReqPriority(req.priority);
    setEditingIndex(index);
  };

  const requirements = formData.requirements || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Input Area */}
      <Box sx={{ p: '16px', backgroundColor: '#FFF3E0', borderRadius: '4px' }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#F57C00', mb: '16px' }}>
          ➕ Ajouter une Exigence
        </Typography>

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Description de l'exigence"
            value={newReq}
            onChange={(e) => setNewReq(e.target.value)}
            disabled={loading}
            size="small"
            multiline
            rows={2}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={reqType}
                onChange={(e) => setReqType(e.target.value)}
                disabled={loading}
                label="Type"
              >
                {REQUIREMENT_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Priorité</InputLabel>
              <Select
                value={reqPriority}
                onChange={(e) => setReqPriority(e.target.value)}
                disabled={loading}
                label="Priorité"
              >
                {REQUIREMENT_PRIORITIES.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleAddRequirement}
              disabled={loading}
              sx={{
                backgroundColor: '#0056B3',
                color: '#fff',
                flex: 1,
                textTransform: 'none',
              }}
            >
              {editingIndex !== null ? 'Mettre à Jour' : 'Ajouter'}
            </Button>
            {editingIndex !== null && (
              <Button
                variant="outlined"
                onClick={() => {
                  setNewReq('');
                  setReqType('technical');
                  setReqPriority('important');
                  setEditingIndex(null);
                }}
                disabled={loading}
                sx={{ color: '#d32f2f', borderColor: '#d32f2f' }}
              >
                Annuler
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Requirements List */}
      {requirements.length > 0 && (
        <Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '12px' }}>
            Exigences ({requirements.length})
          </Typography>
          <Stack spacing={1}>
            {requirements.map((req, index) => (
              <Paper
                key={index}
                sx={{
                  p: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  backgroundColor: '#F9F9F9',
                  borderLeft: `4px solid ${
                    REQUIREMENT_PRIORITIES.find((p) => p.value === req.priority)?.color || '#999'
                  }`,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '13px', color: '#212121', mb: '8px' }}>
                    {req.text}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '8px' }}>
                    <Chip
                      label={REQUIREMENT_TYPES.find((t) => t.value === req.type)?.label}
                      size="small"
                      sx={{
                        height: '24px',
                        fontSize: '11px',
                        backgroundColor: '#E3F2FD',
                        color: '#0056B3',
                      }}
                    />
                    <Chip
                      label={REQUIREMENT_PRIORITIES.find((p) => p.value === req.priority)?.label}
                      size="small"
                      sx={{
                        height: '24px',
                        fontSize: '11px',
                        backgroundColor: '#F0F0F0',
                        color: '#212121',
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: '8px' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditRequirement(index)}
                    disabled={loading}
                  >
                    <EditIcon sx={{ fontSize: '18px', color: '#0056B3' }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveRequirement(index)}
                    disabled={loading}
                  >
                    <DeleteIcon sx={{ fontSize: '18px', color: '#d32f2f' }} />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

const StepFive = ({ formData, handleChange, totalCriteria, loading }) => {
  const criteria = [
    { key: 'price', label: 'Prix' },
    { key: 'quality', label: 'Qualité' },
    { key: 'delivery', label: 'Délai de Livraison' },
    { key: 'experience', label: 'Expérience' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Alert severity="info" sx={{ backgroundColor: '#E3F2FD', color: '#0056B3' }}>
        ℹ️ Distribuer 100 points entre les critères. Total actuel: <strong>{totalCriteria}%</strong>
      </Alert>

      <Stack spacing={2}>
        {criteria.map((c) => (
          <Box key={c.key}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '8px' }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121' }}>
                {c.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color:
                    formData.evaluation_criteria[c.key] > 0 ? '#0056B3' : '#999999',
                }}
              >
                {formData.evaluation_criteria[c.key]}%
              </Typography>
            </Box>
            <TextField
              fullWidth
              type="number"
              name={`evaluation_criteria.${c.key}`}
              value={formData.evaluation_criteria[c.key]}
              onChange={(e) => {
                const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                handleChange({
                  target: {
                    name: `evaluation_criteria.${c.key}`,
                    value: val,
                  },
                });
              }}
              disabled={loading}
              inputProps={{ min: 0, max: 100 }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  backgroundColor: '#FAFAFA',
                },
              }}
            />
          </Box>
        ))}
      </Stack>

      {totalCriteria === 100 && (
        <Alert severity="success" sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
          ✅ Critères correctement distribués
        </Alert>
      )}

      {totalCriteria !== 100 && totalCriteria > 0 && (
        <Alert severity="warning" sx={{ backgroundColor: '#FFF3CD', color: '#856404' }}>
          ⚠️ Le total doit être exactement 100% (actuel: {totalCriteria}%)
        </Alert>
      )}
    </Box>
  );
};

const StepDocuments = ({ formData, setFormData, loading }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files || []);
    setFormData((prev) => ({
      ...prev,
      specification_documents: [...(prev.specification_documents || []), ...newFiles],
    }));
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      specification_documents: (prev.specification_documents || []).filter((_, i) => i !== index),
    }));
  };

  const docs = formData.specification_documents || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Alert severity="info" sx={{ backgroundColor: '#E3F2FD', color: '#0056B3' }}>
        📄 Uploadez le cahier des charges, les spécifications techniques et tout document pertinent
      </Alert>

      {/* Drag & Drop Area */}
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        sx={{
          border: '2px dashed #0056B3',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: dragOver ? '#E3F2FD' : '#F9F9F9',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': { backgroundColor: '#E3F2FD' },
        }}
      >
        <UploadFileIcon sx={{ fontSize: 48, color: '#0056B3', mb: 2 }} />
        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#212121', mb: 1 }}>
          Glissez-déposez vos fichiers ici
        </Typography>
        <Typography sx={{ fontSize: '12px', color: '#999999' }}>
          ou cliquez pour sélectionner
        </Typography>
        <input
          type="file"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={loading}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
          <Button
            component="span"
            variant="contained"
            sx={{
              backgroundColor: '#0056B3',
              color: '#fff',
              marginTop: '12px',
              textTransform: 'none',
            }}
            disabled={loading}
          >
            ➕ Sélectionner les fichiers
          </Button>
        </label>
      </Box>

      {/* Files List */}
      {docs.length > 0 && (
        <Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '12px' }}>
            Fichiers uploadés ({docs.length})
          </Typography>
          <Stack spacing={1}>
            {docs.map((file, index) => (
              <Paper
                key={index}
                sx={{
                  p: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#F9F9F9',
                  borderLeft: '4px solid #0056B3',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <FileDownloadIcon sx={{ color: '#0056B3' }} />
                  <Box>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121' }}>
                      {file.name || 'Fichier'}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#999999' }}>
                      {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Taille inconnue'}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFile(index)}
                  disabled={loading}
                >
                  <DeleteIcon sx={{ fontSize: '18px', color: '#d32f2f' }} />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

const StepSeven = ({ formData, handleChange, loading }) => {
  const awardLevelLabel = {
    lot: 'Par Lot',
    article: 'Par Article',
    tender: 'Global (Toute l\'appel d\'offres)',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Alert severity="success" sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
        ✅ Vous êtes prêt pour soumettre votre appel d'offres
      </Alert>

      <Paper sx={{ p: '20px', backgroundColor: '#F9F9F9', borderRadius: '4px' }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
          📋 Résumé de l'Appel d'Offres
        </Typography>

        <Stack spacing={2} sx={{ fontSize: '13px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#666666' }}>Titre:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#212121' }}>
              {formData.title || 'Non défini'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#666666' }}>Catégorie:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#212121' }}>
              {CATEGORIES.find((c) => c.value === formData.category)?.label || 'Non définie'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#666666' }}>Budget:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#212121' }}>
              {formData.budget_min} - {formData.budget_max} {formData.currency}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#666666' }}>🎯 Niveau de ترسية:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#0056B3' }}>
              {awardLevelLabel[formData.awardLevel] || 'Non défini'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#666666' }}>Lots:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#212121' }}>
              {(formData.lots || []).length}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#666666' }}>Exigences:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#212121' }}>
              {(formData.requirements || []).length}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#666666' }}>Visibilité:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#212121' }}>
              {formData.is_public ? 'Public' : 'Privé'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Detailed Lots Section */}
      {(formData.lots || []).length > 0 && (
        <Paper sx={{ p: '20px', backgroundColor: '#F9F9F9', borderRadius: '4px' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
            📦 Détail des Lots et Articles
          </Typography>

          <Stack spacing={2}>
            {formData.lots.map((lot, idx) => (
              <Box
                key={idx}
                sx={{
                  p: '12px',
                  backgroundColor: '#fff',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  borderLeft: '4px solid #0056B3',
                }}
              >
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#212121', mb: '8px' }}>
                  Lot {lot.numero}: {lot.objet}
                </Typography>

                {(lot.articles || []).length > 0 && (
                  <Stack spacing={1} sx={{ ml: '12px' }}>
                    {lot.articles.map((article, aIdx) => (
                      <Box
                        key={aIdx}
                        sx={{
                          p: '6px',
                          backgroundColor: '#F9F9F9',
                          borderRadius: '2px',
                          fontSize: '11px',
                          color: '#666666',
                        }}
                      >
                        • <strong>{article.name}</strong> : {article.quantity} {article.unit}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Contact Info */}
      <Box>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '12px' }}>
          Informations de Contact
        </Typography>

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Personne de contact"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
            disabled={loading}
            size="small"
          />

          <TextField
            fullWidth
            label="Adresse e-mail"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            disabled={loading}
            size="small"
            type="email"
          />

          <TextField
            fullWidth
            label="Numéro de téléphone"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            disabled={loading}
            size="small"
          />
        </Stack>
      </Box>
    </Box>
  );
};

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

    if (currentStep === 1) {
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
    // Validation using unified helpers
    if (getTotalCriteria() !== 100) {
      setError('Les critères d\'évaluation doivent totaliser exactement 100%');
      return;
    }

    if (!formData.awardLevel) {
      setError('Niveau de ترسية requis');
      return;
    }

    const lotsCheck = validateLots(formData.lots, formData.awardLevel);
    if (!lotsCheck.valid) {
      setError(lotsCheck.error);
      return;
    }

    // Validate deadline at submission
    const deadlineCheck = validateDeadline(formData.deadline);
    if (!deadlineCheck.valid) {
      setError(deadlineCheck.error);
      return;
    }

    setLoading(true);
    try {
      const response = await procurementAPI.createTender({
        ...formData,
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max),
      });

      clearDraft('tender_draft');
      navigate(`/tender/${response.data.tender.id}`);
    } catch (err) {
      setError(handleAPIError(err));
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
                  color: theme.palette.primary.main,
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
                  backgroundColor: theme.palette.primary.main,
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
                  color: theme.palette.primary.main,
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
                      color: theme.palette.primary.main,
                      borderColor: theme.palette.primary.main,
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
                      backgroundColor: theme.palette.primary.main,
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
                    backgroundColor: theme.palette.primary.main,
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
        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: '#fff' }}>
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
            sx={{ backgroundColor: theme.palette.primary.main, color: '#fff' }}
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
          <Button onClick={() => setShowExit(false)} sx={{ color: theme.palette.primary.main }}>
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

// Import validation helpers at the top:
// import { validateLots, validateBudget, handleAPIError } from '../utils/validationHelpers';
