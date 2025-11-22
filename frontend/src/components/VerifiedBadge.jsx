import { Box, Tooltip, Typography } from '@mui/material';

export default function VerifiedBadge({ size = 'md', showText = true }) {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <Tooltip title="تم التحقق من هذا المورد">
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'default'
        }}
      >
        <Box sx={{ fontSize: sizeMap[size] }}>
          ✓
        </Box>
        {showText && (
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#2e7d32' }}>
            موثق
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}
