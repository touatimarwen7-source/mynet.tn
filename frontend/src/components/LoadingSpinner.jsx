import { Box, CircularProgress, Typography } from '@mui/material';
import institutionalTheme from '../theme/theme';

/**
 * Loading Spinner Component
 * Displays centered loading animation with optional message
 */
export default function LoadingSpinner({ message = 'Chargement en cours...' }) {
  const theme = institutionalTheme;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        gap: '16px'
      }}
    >
      <CircularProgress sx={{ color: theme.palette.primary.main }} size={50} />
      {message && (
        <Typography sx={{ color: '#616161', fontSize: '14px' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}
