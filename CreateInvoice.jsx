import { useEffect } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { setPageTitle } from '../utils/pageTitle';
import { useInvoiceForm } from '../hooks/useInvoiceForm';

const STAGES = [
  'Détails de la Facture',
  'Vérification des Articles',
  'Révision et Envoi',
];

// ============ Step Components ============

const StepOne = ({ formData, setFormData, loading, errors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Stack spacing={3}>
      <TextField
        label="Numéro de Facture"
        name="invoice_number"
        value={formData.invoice_number}
        onChange={handleChange}
        disabled={loading}
        fullWidth
        required
        error={!!errors.invoice_number}
        helperText={errors.invoice_number}
      />
      <Stack direction="row" spacing={2}>
        <TextField
          label="Date de Facturation"
          name="invoice_date"
          type="date"
          value={formData.invoice_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
          required
          error={!!errors.invoice_date}
          helperText={errors.invoice_date}
        />
        <TextField
          label="Date d'Échéance"
          name="due_date"
          type="date"
          value={formData.due_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
          required
          error={!!errors.due_date}
          helperText={errors.due_date}
        />
      </Stack>
    </Stack>
  );
};

const StepTwo = ({ formData, errors }) => {
  const totalAmount = (formData.line_items || []).reduce(
    (sum, item) => sum + (item.quantity * item.unit_price), 0
  );

  return (
    <Stack spacing={2}>
      {errors.line_items && <Alert severity="error">{errors.line_items}</Alert>}
      <Paper sx={{ overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell align="right">Quantité</TableCell>
              <TableCell align="right">Prix Unitaire</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(formData.line_items || []).map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{item.unit_price.toFixed(2)} TND</TableCell>
                <TableCell align="right">{(item.quantity * item.unit_price).toFixed(2)} TND</TableCell>
              </TableRow>
            ))}
            <TableRow>
                <TableCell colSpan={3} align="right"><strong>Total</strong></TableCell>
                <TableCell align="right"><strong>{totalAmount.toFixed(2)} TND</strong></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
};

const StepThree = ({ formData }) => (
    <Stack spacing={2}>
        <Typography variant="h6">Révision de la Facture</Typography>
        <Paper sx={{p: 2}}>
            <Typography><strong>Numéro de facture:</strong> {formData.invoice_number}</Typography>
            <Typography><strong>Date de facturation:</strong> {formData.invoice_date}</Typography>
            <Typography><strong>Date d'échéance:</strong> {formData.due_date}</Typography>
            <Typography sx={{mt: 2}}><strong>Total:</strong> {(formData.line_items || []).reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)} TND</Typography>
        </Paper>
    </Stack>
);

export default function CreateInvoice() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const { purchaseOrderId } = useParams();

  const {
    currentStep,
    purchaseOrder,
    formData,
    formErrors,
    loading,
    submitting,
    success,
    setFormData,
    handleNext,
    handlePrevious,
    handleSubmit,
  } = useInvoiceForm(purchaseOrderId);

  useEffect(() => {
    setPageTitle('Créer une Facture');
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepOne formData={formData} setFormData={setFormData} loading={submitting} errors={formErrors} />;
      case 1:
        return <StepTwo formData={formData} errors={formErrors} />;
      case 2:
        return <StepThree formData={formData} />;
      default:
        return null;
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <Alert severity="success">Votre facture a été créée avec succès.</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none' }}>
          <CardContent sx={{ padding: '40px' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/purchase-orders')} sx={{ mb: 3 }}>
              Retour
            </Button>
            <Typography variant="h4" sx={{ mb: 2, color: theme.palette.primary.main }}>
              Créer une Facture
            </Typography>
            <Typography sx={{ mb: 4 }}>
              Basée sur le bon de commande: <strong>{purchaseOrder?.poNumber || purchaseOrderId}</strong>
            </Typography>

            <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
              {STAGES.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {formErrors.general && <Alert severity="error" sx={{ mb: 3 }}>{formErrors.general}</Alert>}

            <Box sx={{ mb: 4, minHeight: '300px' }}>
              {renderStepContent()}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={currentStep === 0 || submitting}
                onClick={handlePrevious}
              >
                Précédent
              </Button>
              {currentStep === STAGES.length - 1 ? (
                <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <CircularProgress size={24} /> : 'Soumettre la Facture'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext} disabled={submitting}>
                  Suivant
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}