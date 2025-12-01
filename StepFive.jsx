import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Grid,
  Alert,
  Chip,
  Autocomplete,
  LinearProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import institutionalTheme from '../../../theme/theme';

// قوائم محددة مسبقًا لتحسين تجربة المستخدم
const PREDEFINED_CRITERIA = [
  { name: 'الامتثال الفني', weight: 40 },
  { name: 'السعر', weight: 30 },
  { name: 'مدة التسليم', weight: 15 },
  { name: 'الضمان والدعم', weight: 15 },
];

const PREDEFINED_DOCUMENTS = [
  'السجل التجاري',
  'شهادة التعريف البنكي (RIB)',
  'شهادة الوضع الضريبي',
  'شهادة ISO 9001',
  'خطاب ضمان بنكي',
];

/**
 * الخطوة الخامسة: متطلبات التقييم والوثائق
 * @param {object} props
 * @param {object} props.formData - بيانات النموذج الحالية
 * @param {function} props.setFormData - دالة لتحديث بيانات النموذج
 * @param {boolean} props.loading - حالة التحميل
 */
const StepFive = ({ formData, setFormData, loading }) => {
  const evaluationCriteria = formData.evaluationCriteria || [];
  const requiredDocuments = formData.requiredDocuments || [];

  const [newCriterionName, setNewCriterionName] = useState('');

  // حساب المجموع الكلي للأوزان
  const totalWeight = evaluationCriteria.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);

  // تهيئة المعايير بقيم محددة مسبقًا إذا كانت فارغة
  useEffect(() => {
    if (!formData.evaluationCriteria) {
      setFormData(prev => ({ ...prev, evaluationCriteria: PREDEFINED_CRITERIA }));
    }
  }, []);

  const handleCriterionChange = (index, field, value) => {
    const updatedCriteria = [...evaluationCriteria];
    updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
    setFormData(prev => ({ ...prev, evaluationCriteria: updatedCriteria }));
  };

  const addCriterion = () => {
    if (newCriterionName.trim()) {
      const newCriterion = { name: newCriterionName, weight: 0 };
      setFormData(prev => ({ ...prev, evaluationCriteria: [...(prev.evaluationCriteria || []), newCriterion] }));
      setNewCriterionName('');
    }
  };

  const deleteCriterion = (index) => {
    const updatedCriteria = evaluationCriteria.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, evaluationCriteria: updatedCriteria }));
  };

  const handleDocumentsChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, requiredDocuments: newValue }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* قسم معايير التقييم */}
      <Paper sx={{ p: 3, borderLeft: `4px solid ${institutionalTheme.palette.primary.main}` }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: institutionalTheme.palette.primary.main }}>
          نظام ترجيح التقييم (Weighting System)
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          حدد الأوزان النسبية لكل معيار تقييم. يجب أن يكون المجموع 100%.
        </Alert>

        {evaluationCriteria.map((criterion, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
            <Grid item xs={7}>
              <TextField value={criterion.name} onChange={(e) => handleCriterionChange(index, 'name', e.target.value)} variant="outlined" size="small" fullWidth label="معيار التقييم" disabled={loading} />
            </Grid>
            <Grid item xs={3}>
              <TextField value={criterion.weight} onChange={(e) => handleCriterionChange(index, 'weight', e.target.value)} variant="outlined" size="small" type="number" label="الوزن (%)" InputProps={{ inputProps: { min: 0, max: 100 } }} disabled={loading} />
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={() => deleteCriterion(index)} color="error" disabled={loading}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Grid container spacing={2} sx={{ mt: 1, alignItems: 'center' }}>
          <Grid item xs={7}>
            <TextField value={newCriterionName} onChange={(e) => setNewCriterionName(e.target.value)} variant="outlined" size="small" fullWidth label="إضافة معيار جديد" disabled={loading} />
          </Grid>
          <Grid item xs={5}>
            <Button startIcon={<AddIcon />} onClick={addCriterion} variant="outlined" disabled={loading || !newCriterionName.trim()}>
              إضافة
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            المجموع: {totalWeight}%
          </Typography>
          <LinearProgress variant="determinate" value={totalWeight > 100 ? 100 : totalWeight} color={totalWeight === 100 ? 'success' : 'warning'} sx={{ height: 10, borderRadius: 5 }} />
          {totalWeight !== 100 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              تحذير: يجب أن يكون مجموع الأوزان 100%. المجموع الحالي هو {totalWeight}%.
            </Alert>
          )}
        </Box>
      </Paper>

      {/* قسم الوثائق المطلوبة */}
      <Paper sx={{ p: 3, borderLeft: `4px solid ${institutionalTheme.palette.secondary.main}` }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: institutionalTheme.palette.secondary.main }}>
          الوثائق المطلوبة من الموردين
        </Typography>
        <Autocomplete
          multiple
          freeSolo
          options={PREDEFINED_DOCUMENTS}
          value={requiredDocuments}
          onChange={handleDocumentsChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="الوثائق الإلزامية" placeholder="اختر أو أضف وثيقة جديدة" />
          )}
          disabled={loading}
        />
        <Alert severity="info" sx={{ mt: 2 }}>
          حدد الوثائق الإلزامية التي يجب على الموردين إرفاقها مع عروضهم.
        </Alert>
      </Paper>
    </Box>
  );
};

export default StepFive;