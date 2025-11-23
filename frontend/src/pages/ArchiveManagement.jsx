import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSuperAdmin } from '../contexts/SuperAdminContext';

export default function ArchiveManagement() {
  const { backups, loading, error, fetchBackups, createBackup, restoreBackup } = useSuperAdmin();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsProcessing(true);
    try {
      await createBackup();
      setMessage('Sauvegarde créée avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Erreur: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreBackup = (backup) => {
    setSelectedBackup(backup);
    setOpenDialog(true);
  };

  const confirmRestore = async () => {
    if (!selectedBackup) return;
    
    setIsProcessing(true);
    try {
      await restoreBackup(selectedBackup.id);
      setOpenDialog(false);
      setMessage(`Restauration de ${selectedBackup.name} terminée avec succès`);
      setTimeout(() => setMessage(''), 3000);
      await fetchBackups();
    } catch (err) {
      setMessage(`Erreur de restauration: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadBackup = (backup) => {
    const element = document.createElement('a');
    element.href = '#';
    element.download = `backup-${backup.id}.tar.gz`;
    element.click();
    setMessage(`Téléchargement de ${backup.name} en cours...`);
    setTimeout(() => setMessage(''), 3000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const backupsList = Array.isArray(backups) ? backups : [];
  const totalSize = backupsList.reduce((sum, b) => sum + (b.size_bytes || 0), 0);
  const successCount = backupsList.filter(b => b.status === 'completed').length;

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#212121', marginBottom: '12px' }}>
            Sauvegarde & Restauration - Backup & Restore
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            Gestion des sauvegardes et restauration des données
          </Typography>

          {error && (
            <Alert severity="error" sx={{ marginBottom: '16px' }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ marginBottom: '16px' }}>
              {message}
            </Alert>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ marginBottom: '24px' }}>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={handleCreateBackup}
              disabled={isProcessing || loading}
              sx={{ backgroundColor: theme.palette.primary.main, color: 'white', '&:hover': { backgroundColor: '#004399' } }}
            >
              {isProcessing ? 'Création en cours...' : 'Créer Sauvegarde'}
            </Button>
          </Stack>

          {isProcessing && (
            <Box sx={{ marginBottom: '24px' }}>
              <LinearProgress sx={{ height: '8px', borderRadius: '4px' }} />
              <Typography sx={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                Opération en cours... Veuillez patienter
              </Typography>
            </Box>
          )}
        </Box>

        {/* Stats */}
        <Stack direction="row" spacing={2} sx={{ marginBottom: '24px' }}>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Total des sauvegardes
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: theme.palette.primary.main }}>
                {backupsList.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Espace utilisé
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#ff9800' }}>
                {formatFileSize(totalSize)}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Succès
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#4caf50' }}>
                {successCount}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Backups Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : (
          <Paper sx={{ border: '1px solid #e0e0e0', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Nom</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Taille</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#212121' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {backupsList.length > 0 ? (
                  backupsList.map((backup) => (
                    <TableRow key={backup.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>{backup.name}</TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>{formatFileSize(backup.size_bytes)}</TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>
                        {backup.created_at ? new Date(backup.created_at).toLocaleDateString('ar-TN') : '-'}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            backgroundColor:
                              backup.status === 'completed'
                                ? '#4caf5020'
                                : backup.status === 'failed'
                                ? '#d32f2f20'
                                : '#ff980020',
                            color:
                              backup.status === 'completed'
                                ? '#4caf50'
                                : backup.status === 'failed'
                                ? '#d32f2f'
                                : '#ff9800',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {backup.status === 'completed' ? 'نجح' : backup.status === 'failed' ? 'فشل' : 'قيد المعالجة'}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadBackup(backup)}
                            sx={{ borderColor: '#0056B3', color: theme.palette.primary.main }}
                          >
                            تحميل
                          </Button>
                          {backup.status === 'completed' && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<RestoreIcon />}
                              onClick={() => handleRestoreBackup(backup)}
                              color="success"
                            >
                              استرجاع
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ padding: '40px', color: '#616161' }}>
                      لا توجد نسخ احتياطية
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* Restore Dialog */}
        <Dialog open={openDialog} onClose={() => !isProcessing && setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>
            تأكيد الاسترجاع
          </DialogTitle>
          <DialogContent sx={{ padding: '20px' }}>
            <Alert severity="warning" sx={{ marginBottom: '16px', marginTop: '16px' }}>
              ⚠️ هذا الإجراء سيستعيد جميع البيانات إلى حالة النسخة الاحتياطية المحددة. سيتم استبدال البيانات الحالية.
            </Alert>
            {selectedBackup && (
              <Box>
                <Typography sx={{ fontWeight: 600, marginBottom: '8px' }}>
                  {selectedBackup.name}
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#666' }}>
                  التاريخ: {selectedBackup.created_at ? new Date(selectedBackup.created_at).toLocaleDateString('ar-TN') : '-'}
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#666' }}>
                  الحجم: {formatFileSize(selectedBackup.size_bytes)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ padding: '20px', gap: '10px' }}>
            <Button onClick={() => setOpenDialog(false)} disabled={isProcessing} sx={{ color: '#616161' }}>
              إلغاء
            </Button>
            <Button
              onClick={confirmRestore}
              variant="contained"
              color="error"
              disabled={isProcessing}
            >
              {isProcessing ? <CircularProgress size={24} /> : 'تأكيد الاسترجاع'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
