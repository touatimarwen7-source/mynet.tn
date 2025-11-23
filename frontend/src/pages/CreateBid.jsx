import { useState, useEffect } from 'react';
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
  TableHead,
  TableRow,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { procurementAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

// ============ Configuration ============
const STAGES = [
  { name: 'Informations', description: 'Détails du fournisseur' },
  { name: 'Éléments', description: 'Articles et prix' },
  { name: 'Conformité', description: 'Conditions et exigences' },
  { name: 'Documents', description: 'Fichiers et justificatifs' },
  { name: 'Révision', description: 'Vérification finale' },
];

// ============ Step Components ============
const StepOne = ({ formData, setFormData, loading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Alert severity="info" sx={{ backgroundColor: '#E3F2FD', color: '#0056B3' }}>
        📋 Remplissez les informations de votre entreprise fournisseur
      </Alert>

      <TextField
        label="Nom de l'Entreprise"
        name="supplier_name"
        value={formData.supplier_name || ''}
        onChange={handleChange}
        disabled={loading}
        fullWidth
        required
        variant="outlined"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
      />

      <TextField
        label="Personne de Contact"
        name="supplier_contact_person"
        value={formData.supplier_contact_person || ''}
        onChange={handleChange}
        disabled={loading}
        fullWidth
        variant="outlined"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <TextField
          label="Email"
          name="supplier_email"
          type="email"
          value={formData.supplier_email || ''}
          onChange={handleChange}
          disabled={loading}
          fullWidth
          variant="outlined"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
        />
        <TextField
          label="Téléphone"
          name="supplier_phone"
          value={formData.supplier_phone || ''}
          onChange={handleChange}
          disabled={loading}
          fullWidth
          variant="outlined"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
        />
      </Box>

      <TextField
        label="Adresse"
        name="supplier_address"
        value={formData.supplier_address || ''}
        onChange={handleChange}
        disabled={loading}
        fullWidth
        multiline
        rows={2}
        variant="outlined"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <TextField
          label="Numéro d'Enregistrement"
          name="supplier_registration_number"
          value={formData.supplier_registration_number || ''}
          onChange={handleChange}
          disabled={loading}
          fullWidth
          variant="outlined"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
        />
        <FormControl fullWidth>
          <InputLabel>Secteur d'Activité</InputLabel>
          <Select
            name="supplier_industry"
            value={formData.supplier_industry || ''}
            onChange={handleChange}
            disabled={loading}
            label="Secteur d'Activité"
          >
            <MenuItem value="technology">Technologie & IT</MenuItem>
            <MenuItem value="supplies">Fournitures & Consommables</MenuItem>
            <MenuItem value="services">Services</MenuItem>
            <MenuItem value="construction">Construction & Travaux</MenuItem>
            <MenuItem value="other">Autres</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

const StepTwo = ({ formData, setFormData, tenderItems, loading }) => {
  const [newItem, setNewItem] = useState({ item_id: '', quantity: '', unit_price: '' });

  const handleAddItem = () => {
    if (!newItem.item_id || !newItem.quantity || !newItem.unit_price) {
      return;
    }

    const lineItems = formData.line_items || [];
    lineItems.push(newItem);
    setFormData((prev) => ({
      ...prev,
      line_items: lineItems,
      total_amount: lineItems.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.unit_price)), 0),
    }));
    setNewItem({ item_id: '', quantity: '', unit_price: '' });
  };

  const handleRemoveItem = (index) => {
    const lineItems = [...(formData.line_items || [])];
    lineItems.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      line_items: lineItems,
      total_amount: lineItems.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.unit_price)), 0),
    }));
  };

  const items = formData.line_items || [];
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)), 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Alert severity="success" sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
        💰 Remplissez les articles et proposez vos prix
      </Alert>

      <Box sx={{ p: '16px', backgroundColor: '#F9F9F9', borderRadius: '4px' }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '16px' }}>
          Ajouter un Article
        </Typography>
        <Stack spacing={1}>
          <FormControl fullWidth size="small">
            <InputLabel>Article</InputLabel>
            <Select
              value={newItem.item_id}
              onChange={(e) => setNewItem({ ...newItem, item_id: e.target.value })}
              label="Article"
              disabled={loading}
            >
              {(tenderItems || []).map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.description} - Quantité demandée: {item.quantity_required} {item.unit}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Quantité"
            type="number"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            disabled={loading}
            size="small"
            fullWidth
            inputProps={{ step: '0.01' }}
          />

          <TextField
            label="Prix Unitaire"
            type="number"
            value={newItem.unit_price}
            onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
            disabled={loading}
            size="small"
            fullWidth
            inputProps={{ step: '0.01' }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            disabled={loading || !newItem.item_id || !newItem.quantity || !newItem.unit_price}
            sx={{ backgroundColor: '#0056B3', color: '#fff', textTransform: 'none' }}
          >
            Ajouter
          </Button>
        </Stack>
      </Box>

      {items.length > 0 && (
        <Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '12px' }}>
            Articles Sélectionnés ({items.length})
          </Typography>
          <Table sx={{ border: '1px solid #E0E0E0' }}>
            <TableHead sx={{ backgroundColor: '#F9F9F9' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>Article</TableCell>
                <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 600 }}>Quantité</TableCell>
                <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 600 }}>Prix Unitaire</TableCell>
                <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 600 }}>Sous-Total</TableCell>
                <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => {
                const tenderItem = tenderItems?.find((t) => t.id === item.item_id);
                const subTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
                return (
                  <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}>
                    <TableCell sx={{ fontSize: '12px', color: '#212121' }}>
                      {tenderItem?.description || 'N/A'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '12px', color: '#212121' }}>
                      {item.quantity}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '12px', color: '#212121' }}>
                      {parseFloat(item.unit_price).toFixed(2)} TND
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 600, color: '#0056B3' }}>
                      {subTotal.toFixed(2)} TND
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                        disabled={loading}
                      >
                        <DeleteIcon sx={{ fontSize: '18px', color: '#d32f2f' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Paper sx={{ p: '16px', backgroundColor: '#E3F2FD', mt: '12px', textAlign: 'right' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3' }}>
              Montant Total: {totalAmount.toFixed(2)} TND
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

const StepThree = ({ formData, setFormData, loading }) => {
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Alert severity="info" sx={{ backgroundColor: '#E3F2FD', color: '#0056B3' }}>
        ✅ Confirmez votre conformité aux conditions de l'appel d'offres
      </Alert>

      <TextField
        label="Délai de Livraison (jours)"
        name="delivery_time"
        type="number"
        value={formData.delivery_time || ''}
        onChange={handleChange}
        disabled={loading}
        fullWidth
        inputProps={{ min: '1' }}
      />

      <TextField
        label="Lieu de Livraison"
        name="delivery_location"
        value={formData.delivery_location || ''}
        onChange={handleChange}
        disabled={loading}
        fullWidth
        multiline
        rows={2}
      />

      <FormControl fullWidth>
        <InputLabel>Conditions de Paiement</InputLabel>
        <Select
          name="payment_terms"
          value={formData.payment_terms || ''}
          onChange={handleChange}
          disabled={loading}
          label="Conditions de Paiement"
        >
          <MenuItem value="immediate">Immédiat</MenuItem>
          <MenuItem value="30days">30 Jours</MenuItem>
          <MenuItem value="60days">60 Jours</MenuItem>
          <MenuItem value="90days">90 Jours</MenuItem>
          <MenuItem value="on_delivery">À la Livraison</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Période de Garantie (mois)"
        name="warranty_period"
        type="number"
        value={formData.warranty_period || ''}
        onChange={handleChange}
        disabled={loading}
        fullWidth
        inputProps={{ min: '0' }}
      />

      <TextField
        label="Propositions Techniques / Remarques"
        name="technical_proposal"
        value={formData.technical_proposal || ''}
        onChange={handleChange}
        disabled={loading}
        fullWidth
        multiline
        rows={3}
      />

      <Box sx={{ p: '16px', backgroundColor: '#F9F9F9', borderRadius: '4px' }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', mb: '12px' }}>
          Déclarations et Conformité
        </Typography>
        <Stack spacing={1.5}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.compliance_statement || false}
                onChange={handleChange}
                name="compliance_statement"
                disabled={loading}
              />
            }
            label="Je confirme que mon offre est conforme à toutes les conditions requises"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.confidential_info_statement || false}
                onChange={handleChange}
                name="confidential_info_statement"
                disabled={loading}
              />
            }
            label="Je comprends que les informations soumises peuvent être confidentielles"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.eligibility_compliance || false}
                onChange={handleChange}
                name="eligibility_compliance"
                disabled={loading}
              />
            }
            label="Je confirme que mon entreprise répond à tous les critères d'admissibilité"
          />
        </Stack>
      </Box>
    </Box>
  );
};

const StepFour = ({ formData, setFormData, loading }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files || []);
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newFiles],
    }));
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index),
    }));
  };

  const docs = formData.attachments || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Alert severity="info" sx={{ backgroundColor: '#E3F2FD', color: '#0056B3' }}>
        📄 Uploadez vos documents justificatifs (factures, certificats, etc.)
      </Alert>

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
          id="file-upload-bid"
        />
        <label htmlFor="file-upload-bid" style={{ cursor: 'pointer' }}>
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

const StepFive = ({ formData, tenderItems, loading }) => {
  const totalAmount = (formData.line_items || []).reduce(
    (sum, item) => sum + parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0),
    0
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Alert severity="success" sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
        ✅ Veuillez vérifier votre offre avant de la soumettre
      </Alert>

      <Paper sx={{ p: '20px', backgroundColor: '#F9F9F9', borderRadius: '4px' }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
          📋 Informations du Fournisseur
        </Typography>
        <Stack spacing={1}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#999999' }}>Entreprise</Typography>
              <Typography sx={{ fontSize: '13px', color: '#212121' }}>{formData.supplier_name || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#999999' }}>Contact</Typography>
              <Typography sx={{ fontSize: '13px', color: '#212121' }}>{formData.supplier_contact_person || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#999999' }}>Email</Typography>
              <Typography sx={{ fontSize: '13px', color: '#212121' }}>{formData.supplier_email || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#999999' }}>Téléphone</Typography>
              <Typography sx={{ fontSize: '13px', color: '#212121' }}>{formData.supplier_phone || 'N/A'}</Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {(formData.line_items || []).length > 0 && (
        <Paper sx={{ p: '20px', backgroundColor: '#F9F9F9', borderRadius: '4px' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
            💰 Articles et Prix
          </Typography>
          <Table sx={{ border: '1px solid #E0E0E0' }}>
            <TableHead sx={{ backgroundColor: '#fff' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '11px', fontWeight: 600 }}>Article</TableCell>
                <TableCell align="right" sx={{ fontSize: '11px', fontWeight: 600 }}>Quantité</TableCell>
                <TableCell align="right" sx={{ fontSize: '11px', fontWeight: 600 }}>Prix Unitaire</TableCell>
                <TableCell align="right" sx={{ fontSize: '11px', fontWeight: 600 }}>Sous-Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(formData.line_items || []).map((item, index) => {
                const tenderItem = tenderItems?.find((t) => t.id === item.item_id);
                const subTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
                return (
                  <TableRow key={index}>
                    <TableCell sx={{ fontSize: '12px', color: '#212121' }}>
                      {tenderItem?.description || 'N/A'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '12px' }}>{item.quantity}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '12px' }}>{parseFloat(item.unit_price).toFixed(2)} TND</TableCell>
                    <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 600, color: '#0056B3' }}>
                      {subTotal.toFixed(2)} TND
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Paper sx={{ p: '12px', backgroundColor: '#E3F2FD', mt: '12px', textAlign: 'right' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3' }}>
              Montant Total: {totalAmount.toFixed(2)} TND
            </Typography>
          </Paper>
        </Paper>
      )}

      <Paper sx={{ p: '20px', backgroundColor: '#F9F9F9', borderRadius: '4px' }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '12px' }}>
          📦 Conditions de Livraison
        </Typography>
        <Stack spacing={1}>
          <Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#999999' }}>Délai de Livraison</Typography>
            <Typography sx={{ fontSize: '13px', color: '#212121' }}>{formData.delivery_time || 'N/A'} jours</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#999999' }}>Lieu de Livraison</Typography>
            <Typography sx={{ fontSize: '13px', color: '#212121' }}>{formData.delivery_location || 'N/A'}</Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

// ============ Main Component ============
export default function CreateBid() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const { tenderId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [tender, setTender] = useState(null);
  const [tenderItems, setTenderItems] = useState([]);
  const [formData, setFormData] = useState({
    tender_id: tenderId,
    supplier_name: '',
    supplier_contact_person: '',
    supplier_email: '',
    supplier_phone: '',
    supplier_address: '',
    supplier_registration_number: '',
    supplier_industry: '',
    line_items: [],
    delivery_time: '',
    delivery_location: '',
    payment_terms: '',
    warranty_period: '',
    technical_proposal: '',
    compliance_statement: false,
    confidential_info_statement: false,
    eligibility_compliance: false,
    attachments: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);

  useEffect(() => {
    setPageTitle('Soumettre une Offre');
    loadTender();
    // Load draft from localStorage
    const saved = localStorage.getItem(`bidDraft_${tenderId}`);
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        setFormData(savedData);
        setCurrentStep(0);
      } catch (e) {
        // Ignore corrupted draft
      }
    }
  }, [tenderId]);

  const loadTender = async () => {
    try {
      const response = await procurementAPI.getTender(tenderId);
      setTender(response.data.tender);
      setTenderItems(response.data.tender.items || []);
    } catch (err) {
      setError('Erreur lors du chargement de l\'appel d\'offres');
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.supplier_name || !formData.supplier_email || !formData.supplier_phone) {
          setError('Veuillez remplir tous les champs obligatoires');
          return false;
        }
        break;
      case 1:
        if (!formData.line_items || formData.line_items.length === 0) {
          setError('Veuillez ajouter au moins un article');
          return false;
        }
        break;
      case 2:
        if (!formData.delivery_time || !formData.delivery_location) {
          setError('Veuillez remplir tous les champs obligatoires');
          return false;
        }
        if (!formData.compliance_statement) {
          setError('Vous devez confirmer votre conformité');
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
    if (validateStep()) {
      // Auto-save draft
      localStorage.setItem(`bidDraft_${tenderId}`, JSON.stringify(formData));
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('tender_id', tenderId);
      submitData.append('supplier_name', formData.supplier_name);
      submitData.append('supplier_contact_person', formData.supplier_contact_person);
      submitData.append('supplier_email', formData.supplier_email);
      submitData.append('supplier_phone', formData.supplier_phone);
      submitData.append('supplier_address', formData.supplier_address);
      submitData.append('supplier_registration_number', formData.supplier_registration_number);
      submitData.append('supplier_industry', formData.supplier_industry);
      submitData.append('line_items', JSON.stringify(formData.line_items));
      submitData.append('delivery_time', formData.delivery_time);
      submitData.append('delivery_location', formData.delivery_location);
      submitData.append('payment_terms', formData.payment_terms);
      submitData.append('warranty_period', formData.warranty_period);
      submitData.append('technical_proposal', formData.technical_proposal);
      submitData.append('compliance_statement', formData.compliance_statement);

      // Add files
      (formData.attachments || []).forEach((file) => {
        submitData.append('attachments', file);
      });

      const response = await procurementAPI.createOffer(submitData);
      localStorage.removeItem(`bidDraft_${tenderId}`);
      setSuccessDialog(true);
      setTimeout(() => {
        navigate(`/tender/${tenderId}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la soumission de l\'offre');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepOne formData={formData} setFormData={setFormData} loading={loading} />;
      case 1:
        return <StepTwo formData={formData} setFormData={setFormData} tenderItems={tenderItems} loading={loading} />;
      case 2:
        return <StepThree formData={formData} setFormData={setFormData} loading={loading} />;
      case 3:
        return <StepFour formData={formData} setFormData={setFormData} loading={loading} />;
      case 4:
        return <StepFive formData={formData} tenderItems={tenderItems} loading={loading} />;
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / STAGES.length) * 100;

  if (!tender) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Card sx={{ border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none' }}>
          <CardContent sx={{ padding: '40px' }}>
            {/* Header */}
            <Box sx={{ marginBottom: '32px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', mb: '16px' }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(`/tender/${tenderId}`)}
                  sx={{ color: theme.palette.primary.main, textTransform: 'none' }}
                >
                  Retour
                </Button>
              </Box>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#999999', textTransform: 'uppercase', mb: '8px' }}>
                Étape {currentStep + 1} sur {STAGES.length}
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '28px', fontWeight: 500, color: theme.palette.primary.main, mb: '8px' }}>
                {STAGES[currentStep].name}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#666666' }}>
                {STAGES[currentStep].description}
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: '32px' }}>
              <Box sx={{ display: 'flex', gap: '8px', mb: '12px' }}>
                {STAGES.map((stage, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: index <= currentStep ? theme.palette.primary.main : '#E0E0E0',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: '4px', borderRadius: '2px' }} />
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: '24px' }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Step Content */}
            <Box sx={{ mb: '32px' }}>
              {renderStepContent()}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0 || loading}
                sx={{ textTransform: 'none', color: '#0056B3' }}
              >
                ← Précédent
              </Button>

              <Box sx={{ display: 'flex', gap: '12px' }}>
                {currentStep === STAGES.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ backgroundColor: '#0056B3', color: '#fff', textTransform: 'none', minWidth: '120px' }}
                  >
                    {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Soumettre'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading}
                    sx={{ backgroundColor: '#0056B3', color: '#fff', textTransform: 'none', minWidth: '120px' }}
                  >
                    Suivant →
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)}>
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          ✅ Offre Soumise avec Succès
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#212121', mt: '12px' }}>
            Votre offre a été reçue avec succès. Vous serez redirigé dans quelques instants.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
