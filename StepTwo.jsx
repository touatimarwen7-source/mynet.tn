import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import institutionalTheme from '../../../theme/theme';

/**
 * الخطوة الثانية: الجدولة والتواريخ
 * @param {object} props
 * @param {object} props.formData - بيانات النموذج الحالية
 * @param {function} props.setFormData - دالة لتحديث بيانات النموذج
 * @param {boolean} props.loading - حالة التحميل
 */
const StepTwo = ({ formData, setFormData, loading }) => {
  
  // دالة مساعدة لمعالجة تغييرات التاريخ والوقت
  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value ? value.toISOString() : null,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const submissionDeadline = formData.submissionDeadline ? new Date(formData.submissionDeadline) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Alert severity="info">
          حدد التواريخ الرئيسية لدورة حياة المناقصة. هذه التواريخ ستتحكم في فتح وإغلاق تقديم العروض تلقائيًا.
        </Alert>

        <Grid container spacing={3}>
          {/* تاريخ الإغلاق */}
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="تاريخ الإغلاق (Submission Deadline) *"
              value={submissionDeadline}
              onChange={(newValue) => handleDateChange('submissionDeadline', newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              disabled={loading}
              disablePast
            />
          </Grid>

          {/* تاريخ الفتح (فك التشفير) */}
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="تاريخ الفتح (Decryption Date) *"
              value={formData.decryptionDate ? new Date(formData.decryptionDate) : null}
              onChange={(newValue) => handleDateChange('decryptionDate', newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              disabled={loading || !submissionDeadline}
              minDateTime={submissionDeadline} // ✅ التحقق: يجب أن يكون بعد تاريخ الإغلاق
              helperText={!submissionDeadline ? "الرجاء تحديد تاريخ الإغلاق أولاً" : ""}
            />
          </Grid>

          {/* بداية فترة الاستفسارات */}
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="بداية فترة الاستفسارات"
              value={formData.inquiryStartDate ? new Date(formData.inquiryStartDate) : null}
              onChange={(newValue) => handleDateChange('inquiryStartDate', newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              disabled={loading}
              maxDateTime={submissionDeadline} // ✅ التحقق: يجب أن يكون قبل تاريخ الإغلاق
            />
          </Grid>

          {/* نهاية فترة الاستفسارات */}
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="نهاية فترة الاستفسارات"
              value={formData.inquiryEndDate ? new Date(formData.inquiryEndDate) : null}
              onChange={(newValue) => handleDateChange('inquiryEndDate', newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              disabled={loading || !formData.inquiryStartDate}
              minDateTime={formData.inquiryStartDate ? new Date(formData.inquiryStartDate) : null}
              maxDateTime={submissionDeadline} // ✅ التحقق: يجب أن يكون قبل تاريخ الإغلاق
            />
          </Grid>

          {/* فترة صلاحية العرض */}
          <Grid item xs={12} md={6}>
            <TextField
              name="offerValidityPeriod"
              label="فترة صلاحية العرض (بالأيام)"
              type="number"
              value={formData.offerValidityPeriod || ''}
              onChange={handleInputChange}
              fullWidth
              placeholder="مثال: 90"
              disabled={loading}
              InputProps={{
                endAdornment: <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>يومًا</Typography>,
              }}
            />
          </Grid>

          {/* نظام الإنذار */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>نظام الإنذار</InputLabel>
              <Select name="alertSystem" value={formData.alertSystem || ''} onChange={handleInputChange} label="نظام الإنذار" disabled={loading}>
                <MenuItem value="none">بدون تنبيه</MenuItem>
                <MenuItem value="24h">تنبيه قبل الإغلاق بـ 24 ساعة</MenuItem>
                <MenuItem value="48h">تنبيه قبل الإغلاق بـ 48 ساعة</MenuItem>
                <MenuItem value="7d">تنبيه قبل الإغلاق بأسبوع</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default StepTwo;