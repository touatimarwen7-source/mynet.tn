import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Switch,
  Alert,
  Grid,
  RadioGroup,
  Radio,
} from '@mui/material';
import institutionalTheme from '../../../theme/theme';

/**
 * الخطوة الرابعة: شروط الأهلية والأمن
 * @param {object} props
 * @param {object} props.formData - بيانات النموذج الحالية
 * @param {function} props.setFormData - دالة لتحديث بيانات النموذج
 * @param {boolean} props.loading - حالة التحميل
 */
const StepFour = ({ formData, setFormData, loading }) => {

  const handleEligibilityChange = (event) => {
    const { name, checked } = event.target;
    const currentEligibility = formData.eligibilityCriteria || [];
    let updatedEligibility;

    if (checked) {
      updatedEligibility = [...currentEligibility, name];
    } else {
      updatedEligibility = currentEligibility.filter(item => item !== name);
    }

    setFormData(prev => ({ ...prev, eligibilityCriteria: updatedEligibility }));
  };

  const handleSwitchChange = (event) => {
    const { name, checked } = event.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Alert severity="info">
        حدد الشروط التي يجب على الموردين استيفاؤها للمشاركة، وكيف سيتم ترسية المناقصة.
      </Alert>

      <Grid container spacing={3}>
        {/* شروط الأهلية */}
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend" sx={{ fontWeight: 'bold', color: institutionalTheme.palette.primary.main, mb: 1 }}>
              شروط الأهلية الإلزامية
            </FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={(formData.eligibilityCriteria || []).includes('minRegistrationPeriod')} onChange={handleEligibilityChange} name="minRegistrationPeriod" />}
                label="مسجل في المنصة لمدة 6 أشهر على الأقل"
                disabled={loading}
              />
              <FormControlLabel
                control={<Checkbox checked={(formData.eligibilityCriteria || []).includes('hasPositiveRating')} onChange={handleEligibilityChange} name="hasPositiveRating" />}
                label="لديه تقييم إيجابي (أكثر من 4 نجوم)"
                disabled={loading}
              />
              <FormControlLabel
                control={<Checkbox checked={(formData.eligibilityCriteria || []).includes('isVerified')} onChange={handleEligibilityChange} name="isVerified" />}
                label="حسابه موثق (Verified)"
                disabled={loading}
              />
            </FormGroup>
          </FormControl>
        </Grid>

        {/* الموقع الجغرافي */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>الموقع الجغرافي المسموح به</InputLabel>
            <Select name="allowedLocation" value={formData.allowedLocation || 'all'} onChange={handleInputChange} label="الموقع الجغرافي المسموح به" disabled={loading}>
              <MenuItem value="all">كل المناطق</MenuItem>
              <MenuItem value="national">وطني فقط</MenuItem>
              <MenuItem value="regional">إقليمي</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* شروط الترسية */}
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold', color: institutionalTheme.palette.primary.main, mb: 1 }}>
              شروط الترسية
            </FormLabel>
            <RadioGroup name="awardCondition" value={formData.awardCondition || 'lowestPrice'} onChange={handleInputChange}>
              <FormControlLabel value="lowestPrice" control={<Radio />} label="الترسية بالكامل لأفضل سعر إجمالي" disabled={loading} />
              <FormControlLabel value="partialByItem" control={<Radio />} label="الترسية الجزئية بناءً على البنود والامتثال" disabled={loading} />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* إذن إعادة التفاوض */}
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold', color: institutionalTheme.palette.primary.main, mb: 1 }}>
              إعدادات التفاوض
            </FormLabel>
            <FormControlLabel
              control={<Switch checked={formData.allowRenegotiation || false} onChange={handleSwitchChange} name="allowRenegotiation" />}
              label="السماح بإعادة التفاوض مع الموردين المؤهلين"
              disabled={loading}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StepFour;