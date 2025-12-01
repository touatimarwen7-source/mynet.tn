import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FRENCH_LABELS } from '../../utils/consistencyHelper';

const BidSubmissionHeader = ({ tender, onBack, sx, theme }) => (
  <Box sx={{ mb: 4 }}>
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={onBack}
      sx={{ color: theme.palette.primary.main, textTransform: 'none', mb: '16px' }}
    >
      {FRENCH_LABELS.retour}
    </Button>
    <Typography 
      variant="h4" 
      sx={{ 
        fontSize: '32px', 
        fontWeight: 600, 
        color: theme.palette.primary.main,
        mb: '8px'
      }}
    >
      📝 {FRENCH_LABELS.soumettre_offre}
    </Typography>
    {tender && (
      <Box>
        <Typography sx={{ fontSize: '14px', color: '#0056B3', mb: '8px', fontWeight: 700 }}>
          🔐 ID Référence (Plateforme): <strong>{tender.id || 'N/A'}</strong>
        </Typography>
        <Typography sx={{ fontSize: '13px', color: '#666666', mb: '4px' }}>
          <strong>N° Consultation:</strong> {tender.consultation_number}
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#666666' }}>
          {tender.title}
        </Typography>
      </Box>
    )}
  </Box>
);

export default BidSubmissionHeader;