import { Box, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { FRENCH_LABELS } from '../../utils/consistencyHelper';

const DeliveryPaymentForm = ({ data, onChange, submitting, sx }) => (
  <Card sx={sx.card}>
    <CardContent>
      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
        🚚 {FRENCH_LABELS.livraison_et_paiement}
      </Typography>
      <Stack spacing={2}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <TextField fullWidth label={FRENCH_LABELS.delai_livraison_exemple} name="delivery_time" value={data.delivery_time} onChange={onChange} disabled={submitting} variant="outlined" size="small" required />
          <TextField fullWidth label={FRENCH_LABELS.conditions_paiement_exemple} name="payment_terms" value={data.payment_terms} onChange={onChange} disabled={submitting} variant="outlined" size="small" required />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default DeliveryPaymentForm;