import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  Paper,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import institutionalTheme from '../../../theme/theme';

/**
 * الخطوة الثالثة: إضافة بنود المناقصة
 * @param {object} props
 * @param {object} props.formData - بيانات النموذج الحالية
 * @param {function} props.setFormData - دالة لتحديث بيانات النموذج
 * @param {boolean} props.loading - حالة التحميل
 */
const StepThree = ({ formData, setFormData, loading }) => {
  const lineItems = formData.lineItems || [];

  // دالة لمعالجة التغييرات في حقول البنود
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData(prev => ({ ...prev, lineItems: updatedItems }));
  };

  // دالة لإضافة بند جديد
  const addNewItem = () => {
    const newItem = { id: Date.now(), description: '', quantity: 1, unit: 'Unit' };
    setFormData(prev => ({ ...prev, lineItems: [...(prev.lineItems || []), newItem] }));
  };

  // دالة لحذف بند
  const deleteItem = (index) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, lineItems: updatedItems }));
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        أضف البنود المطلوبة في المناقصة. سيقوم الموردون بتقديم عروضهم بناءً على هذه القائمة.
      </Alert>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>الوصف</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>الكمية</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>الوحدة</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '100px' }}>إجراء</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lineItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <TextField
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="وصف البند"
                    disabled={loading}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    variant="outlined"
                    size="small"
                    type="number"
                    InputProps={{ inputProps: { min: 1 } }}
                    disabled={loading}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled={loading}
                  >
                    <MenuItem value="Unit">Unit</MenuItem>
                    <MenuItem value="Ton">Ton</MenuItem>
                    <MenuItem value="Service Hour">Service Hour</MenuItem>
                    <MenuItem value="Lot">Lot</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => deleteItem(index)} color="error" disabled={loading}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        startIcon={<AddIcon />}
        onClick={addNewItem}
        variant="contained"
        sx={{ mt: 2, backgroundColor: institutionalTheme.palette.primary.main }}
        disabled={loading}
      >
        إضافة بند جديد
      </Button>
    </Box>
  );
};

export default StepThree;