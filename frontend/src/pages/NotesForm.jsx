import { Card, CardContent, TextField, Typography } from '@mui/material';
import { FRENCH_LABELS } from '../../utils/consistencyHelper';

const NotesForm = ({ data, onChange, submitting, sx }) => (
  <Card sx={sx.card}>
    <CardContent>
      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>📝 {FRENCH_LABELS.notes}</Typography>
      <TextField fullWidth label={FRENCH_LABELS.notes_qualite_conformite} name="quality_notes" value={data.quality_notes} onChange={onChange} disabled={submitting} variant="outlined" multiline rows={3} placeholder={FRENCH_LABELS.placeholder_notes_qualite} />
    </CardContent>
  </Card>
);

export default NotesForm;