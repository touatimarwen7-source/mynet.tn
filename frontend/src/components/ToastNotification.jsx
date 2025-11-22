import { useState, useEffect } from 'react';
import { Alert, Box, LinearProgress } from '@mui/material';

export default function ToastNotification({ id, message, type = 'info', duration = 4000, onClose }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.(id);
    }, duration);

    const interval = setInterval(() => {
      setProgress((prev) => Math.max(prev - (100 / (duration / 100)), 0));
    }, duration / 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [id, duration, onClose]);

  const severityMap = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };

  return (
    <Box
      sx={{
        animation: 'slideIn 0.3s ease-in-out',
        '@keyframes slideIn': {
          from: {
            transform: 'translateX(400px)',
            opacity: 0
          },
          to: {
            transform: 'translateX(0)',
            opacity: 1
          }
        }
      }}
    >
      <Alert
        severity={severityMap[type] || 'info'}
        sx={{
          minWidth: '300px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.12)'
        }}
      >
        {message}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            marginTop: '8px',
            height: '2px'
          }}
        />
      </Alert>
    </Box>
  );
}
