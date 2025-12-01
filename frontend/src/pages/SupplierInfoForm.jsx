import { Box, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { FRENCH_LABELS } from '../../utils/consistencyHelper';

const SupplierInfoForm = ({ data, onChange, submitting, sx }) => (
  <Card sx={sx.card}>
    <CardContent>
      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
        👤 {FRENCH_LABELS.informations_fournisseur}
      </Typography>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label={FRENCH_LABELS.nom_fournisseur_societe}
          name="supplier_name"
          value={data.supplier_name}
          onChange={onChange}
          disabled={submitting}
          variant="outlined"
          size="small"
          required
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <TextField
            label={FRENCH_LABELS.email}
            name="supplier_email"
            type="email"
            value={data.supplier_email}
            onChange={onChange}
            disabled={submitting}
            variant="outlined"
            size="small"
            required
          />
          <TextField
            label={FRENCH_LABELS.telephone}
            name="supplier_phone"
            value={data.supplier_phone}
            onChange={onChange}
            disabled={submitting}
            variant="outlined"
            size="small"
            required
          />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default SupplierInfoForm;