import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

export default function ConfirmDialog({ 
  open, 
  title, 
  message, 
  confirmText = 'Confirmer', 
  cancelText = 'Annuler',
  onConfirm, 
  onCancel,
  severity = 'warning',
  loading = false 
}) {
  const severityColors = {
    warning: { title: '#d32f2f', button: '#d32f2f' },
    info: { title: theme.palette.primary.main, button: theme.palette.primary.main },
    success: { title: '#2e7d32', button: '#2e7d32' }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: severityColors[severity].title, fontWeight: 600 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: '#666', marginTop: '12px' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{ backgroundColor: severityColors[severity].button }}
          disabled={loading}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
