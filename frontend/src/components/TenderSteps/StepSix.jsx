import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import institutionalTheme from '../../theme/theme';

/**
 * الخطوة السادسة: المراجعة والنشر
 * @param {object} props
 * @param {object} props.formData - بيانات النموذج الحالية
 */
const StepSix = ({ formData }) => {
  return (
    <Box>
      <Alert severity="success" sx={{ mb: 3 }}>
        لقد أكملت جميع الخطوات. يرجى مراجعة جميع التفاصيل بعناية قبل النشر النهائي.
      </Alert>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, color: institutionalTheme.palette.primary.main, fontWeight: 'bold' }}>
          ملخص المناقصة
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* المعلومات الأساسية */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">العنوان:</Typography>
            <Typography variant="body1">{formData.title}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">النوع:</Typography>
            <Typography variant="body1">{formData.type === 'Limited' ? 'محدود' : 'عام'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">الوصف:</Typography>
            <Typography variant="body2">{formData.description}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* التواريخ */}
        <Typography variant="h6" sx={{ mb: 1 }}>الجدولة</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">تاريخ الإغلاق:</Typography>
            <Typography variant="body1">
              {formData.submissionDeadline ? format(new Date(formData.submissionDeadline), 'PPpp') : 'غير محدد'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">تاريخ الفتح:</Typography>
            <Typography variant="body1">
              {formData.decryptionDate ? format(new Date(formData.decryptionDate), 'PPpp') : 'غير محدد'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* البنود */}
        <Typography variant="h6" sx={{ mb: 1 }}>البنود المطلوبة ({formData.lineItems?.length || 0})</Typography>
        <List dense>
          {(formData.lineItems || []).map((item, index) => (
            <ListItem key={index}>
              <ListItemText primary={item.description} secondary={`الكمية: ${item.quantity} ${item.unit}`} />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* شروط الأهلية والترسية */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 1 }}>شروط الأهلية</Typography>
            {(formData.eligibilityCriteria || []).map(criterion => (
              <Chip key={criterion} label={criterion} size="small" sx={{ mr: 1 }} />
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 1 }}>شرط الترسية</Typography>
            <Typography variant="body1">
              {formData.awardCondition === 'partialByItem' ? 'الترسية الجزئية حسب البند' : 'الترسية لأفضل سعر إجمالي'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* الوثائق المطلوبة */}
        <Typography variant="h6" sx={{ mb: 1 }}>الوثائق المطلوبة</Typography>
        {(formData.requiredDocuments || []).map(doc => (
          <Chip key={doc} label={doc} size="small" sx={{ mr: 1, mb: 1 }} variant="outlined" />
        ))}
      </Paper>
    </Box>
  );
};

export default StepSix;