import { useState, useEffect } from 'react';
import { Alert, Box, IconButton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function AlertStrip() {
  const [alerts, setAlerts] = useState([]);
  const [visibleAlerts, setVisibleAlerts] = useState(new Set());

  useEffect(() => {
    // No alerts to display by default
    setAlerts([]);
    setVisibleAlerts(new Set());
  }, []);

  const closeAlert = (id) => {
    const newVisibleAlerts = new Set(visibleAlerts);
    newVisibleAlerts.delete(id);
    setVisibleAlerts(newVisibleAlerts);
  };

  const closeAllAlerts = () => {
    setVisibleAlerts(new Set());
  };

  // Don't render if no visible alerts
  if (visibleAlerts.size === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '64px',
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        padding: '8px 16px',
      }}
    >
      <Stack spacing={1}>
        {alerts.map(
          (alert) =>
            visibleAlerts.has(alert.id) && (
              <Alert
                key={alert.id}
                severity={alert.type}
                onClose={() => closeAlert(alert.id)}
                sx={{
                  border: '1px solid',
                  borderColor:
                    alert.type === 'success'
                      ? '#2e7d32'
                      : alert.type === 'warning'
                      ? '#f57c00'
                      : alert.type === 'error'
                      ? '#c62828'
                      : '#1976d2',
                  borderRadius: '4px',
                }}
              >
                <strong>{alert.title}</strong> {alert.message}
              </Alert>
            )
        )}
        {visibleAlerts.size > 1 && (
          <Box sx={{ textAlign: 'right' }}>
            <IconButton
              size="small"
              onClick={closeAllAlerts}
              sx={{
                color: '#616161',
                fontSize: '12px',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
            >
              Fermer tout
            </IconButton>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
