import React from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDirectPurchaseForm } from '../hooks/useDirectPurchaseForm';
import { setPageTitle } from '../utils/pageTitle';

/**
 * A page for buyers to create and send a direct purchase request to a specific supplier.
 */
const DirectPurchasePage = () => {
  React.useEffect(() => {
    setPageTitle('Achat Direct');
  }, []);

  const {
    formData,
    setFormData,
    formErrors,
    suppliers,
    loadingSuppliers,
    submitting,
    fetchSuppliers,
    handleSubmit,
  } = useDirectPurchaseForm();

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...formData.lineItems];
    updatedItems[index][field] = value;
    setFormData({ ...formData, lineItems: updatedItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { id: Date.now(), description: '', quantity: 1, unit: 'Unit' }],
    });
  };

  const removeLineItem = (index) => {
    const updatedItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData({ ...formData, lineItems: updatedItems });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
        <Container maxWidth="md">
          <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <CardContent sx={{ padding: '40px' }}>
              <Typography variant="h4" sx={{ mb: 4, color: 'primary.main' }}>
                Créer une Demande d'Achat Direct
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <Autocomplete
                    options={suppliers}
                    getOptionLabel={(option) => option.name || ''}
                    onInputChange={(event, newInputValue) => {
                      fetchSuppliers(newInputValue);
                    }}
                    onChange={(event, newValue) => {
                      setFormData({ ...formData, supplierId: newValue ? newValue.id : null });
                    }}
                    loading={loadingSuppliers}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Rechercher un fournisseur"
                        error={!!formErrors.supplierId}
                        helperText={formErrors.supplierId}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingSuppliers ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />

                  <TextField
                    label="Titre de la demande"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={!!formErrors.title}
                    helperText={formErrors.title}
                    fullWidth
                  />

                  <Typography variant="h6">Articles Demandés</Typography>
                  {formErrors.lineItems && <Alert severity="error">{formErrors.lineItems}</Alert>}
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Quantité</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.lineItems.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell><TextField fullWidth size="small" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} /></TableCell>
                          <TableCell><TextField type="number" size="small" value={item.quantity} onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)} sx={{ width: '80px' }} /></TableCell>
                          <TableCell align="center"><IconButton onClick={() => removeLineItem(index)} color="error"><DeleteIcon /></IconButton></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button startIcon={<AddIcon />} onClick={addLineItem}>Ajouter un article</Button>

                  <DatePicker
                    label="Date de livraison souhaitée"
                    value={formData.deliveryDeadline}
                    onChange={(newValue) => setFormData({ ...formData, deliveryDeadline: newValue })}
                    renderInput={(params) => <TextField {...params} fullWidth error={!!formErrors.deliveryDeadline} helperText={formErrors.deliveryDeadline} />}
                  />

                  <TextField label="Notes supplémentaires" multiline rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />

                  {formErrors.general && <Alert severity="error">{formErrors.general}</Alert>}

                  <Button type="submit" variant="contained" size="large" disabled={submitting}>
                    {submitting ? <CircularProgress size={24} /> : 'Envoyer la Demande'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default DirectPurchasePage;