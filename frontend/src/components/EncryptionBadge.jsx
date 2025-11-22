import { Box, Tooltip } from '@mui/material';

export default function EncryptionBadge({ size = 'md', level = 'AES-256' }) {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <Tooltip title={`مشفر بـ ${level}`}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: sizeMap[size],
          cursor: 'default'
        }}
      >
        🔒
      </Box>
    </Tooltip>
  );
}
