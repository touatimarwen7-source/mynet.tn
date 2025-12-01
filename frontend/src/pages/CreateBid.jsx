import { useState, useEffect } from 'react'; // ✅ إضافة useEffect
import institutionalTheme from '../theme/theme'; // ✅ تعديل المسار إذا لزم الأمر
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert, // ✅ إزالة Alert
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { setPageTitle } from '../utils/pageTitle';
import { useBidForm } from '../hooks/useBidForm';
import FormStepper from '../components/FormStepper';

// ============ Configuration ============
const STAGES = [
  { name: 'Informations', description: 'Détails du fournisseur' },
  { name: 'Éléments', description: 'Articles et prix' },
  { name: 'Conformité', description: 'Conditions et exigences' },
  { name: 'Révision', description: 'Vérification finale' },
];

// ============ Step Components ============
const StepOne = ({ formData, setFormData, loading, errors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <TextField
        label="Nom de l'Entreprise"
        name="supplier_name"
        value={formData.supplier_name || ''}
        onChange={handleChange}
        disabled={loading}
        fullWidth
        error={!!errors.supplier_name}
        helperText={errors.supplier_name}
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
          error={!!errors.supplier_email}
          helperText={errors.supplier_email}
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
          error={!!errors.supplier_phone}
          helperText={errors.supplier_phone}
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

const StepTwo = ({ formData, setFormData, tenderItems, loading, errors }) => {
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
      {errors.line_items && (
        <Alert severity="error" sx={{ mt: 2 }}>{errors.line_items}</Alert>
      )}

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

const StepThree = ({ formData, setFormData, loading, errors }) => {
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <TextField
        label="Délai de Livraison (jours)"
        name="delivery_time"
        type="number"
        value={formData.delivery_time || ''}
        onChange={handleChange}
        disabled={loading}
        error={!!errors.delivery_time}
        helperText={errors.delivery_time}
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
          error={!!errors.payment_terms}
          helperText={errors.payment_terms}
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
          {errors.compliance_statement && (
            <Typography color="error" variant="caption" sx={{ ml: 2 }}>
              {errors.compliance_statement}
            </Typography>
          )}
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

const StepFour = ({ formData, tenderItems, loading }) => {
  const totalAmount = (formData.line_items || []).reduce(
    (sum, item) => sum + parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0),
    0
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

  const {
    currentStep,
    tenderItems,
    formData,
    formErrors,
    loading,
    successDialog,
    setFormData,
    handleNext,
    handlePrevious,
    handleSubmit,
    setFormErrors,
  } = useBidForm(tenderId);

  useEffect(() => {
    setPageTitle('Soumettre une Offre');
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepOne formData={formData} setFormData={setFormData} loading={loading} errors={formErrors} />;
      case 1:
        return <StepTwo formData={formData} setFormData={setFormData} tenderItems={tenderItems} loading={loading} errors={formErrors} />;
      case 2:
        return <StepThree formData={formData} setFormData={setFormData} loading={loading} errors={formErrors} />;
      case 3:
        return <StepFour formData={formData} tenderItems={tenderItems} loading={loading} />;
      default:
        return null;
    }
  };

    // ✅ 3. استخدام المكون الجديد وتمرير الخصائص اللازمة
    <FormStepper
      title="Soumettre une Offre"
      steps={STAGES}
      activeStep={currentStep}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      loading={loading}
      error={formErrors.general}
      onClearError={() => setFormErrors(prev => ({ ...prev, general: '' }))}
      onBack={() => navigate(`/tender/${tenderId}`)}
    >
      {/* تمرير محتوى الخطوة الحالية كـ children */}
      {renderStepContent()}
    </FormStepper>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)}>
        <DialogTitle sx={{ color: institutionalTheme.palette.primary.main, fontWeight: 600 }}>
          ✅ Offre Soumise avec Succès
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#212121', mt: '12px' }}>
            Votre offre a été reçue avec succès. Vous serez redirigé dans quelques instants.
          </Typography>
        </DialogContent>
      </Dialog>
  );
}
