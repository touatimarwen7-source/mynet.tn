import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Reusable dialog component to eliminate Dialog duplication
 * Reduces code by 100+ lines across admin components
 */
export default function AdminDialog({
  open = false,
  onClose = () => {},
  onConfirm = () => {},
  title = '',
  children = null,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  loading = false,
  severity = 'default', // 'default' | 'warning' | 'danger'
}) {
  const getSeverityStyle = () => {
    if (severity === 'danger') return { color: '#d32f2f' };
    if (severity === 'warning') return { color: '#f57c00' };
    return {};
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '4px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.25rem',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...getSeverityStyle(),
        }}
      >
        {title}
        <Button
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Box>{children}</Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderColor: '#ddd',
            color: '#666',
            '&:hover': { borderColor: '#999' },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          sx={{
            textTransform: 'none',
            backgroundColor: severity === 'danger' ? '#d32f2f' : theme.palette.primary.main,
            '&:hover': {
              backgroundColor: severity === 'danger' ? '#b71c1c' : '#004499',
            },
          }}
        >
          {loading ? '...loading' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
