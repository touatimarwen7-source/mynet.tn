import { useState } from 'react';
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
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ArchiveManagement() {
  const [backups, setBackups] = useState([
    {
      id: 1,
      name: 'Sauvegarde complète 20/01/2025',
      type: 'Complète',
      size: '2.4 GB',
      date: '2025-01-20 22:30',
      status: 'succès',
      dataCount: '45,230 enregistrements',
    },
    {
      id: 2,
      name: 'Sauvegarde incrémentale 19/01/2025',
      type: 'Incrémentale',
      size: '450 MB',
      date: '2025-01-19 22:30',
      status: 'succès',
      dataCount: '8,120 enregistrements',
    },
    {
      id: 3,
      name: 'Sauvegarde complète 15/01/2025',
      type: 'Complète',
      size: '2.1 GB',
      date: '2025-01-15 22:30',
      status: 'succès',
      dataCount: '32,100 enregistrements',
    },
    {
      id: 4,
      name: 'Sauvegarde test 10/01/2025',
      type: 'Test',
      size: '1.8 GB',
      date: '2025-01-10 14:00',
      status: 'échouée',
      dataCount: 'N/A',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateBackup = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newBackup = {
        id: Math.max(...backups.map(b => b.id), 0) + 1,
        name: `Sauvegarde manuelle ${new Date().toLocaleDateString('fr-FR')}`,
        type: 'Complète',
        size: '2.5 GB',
        date: new Date().toLocaleString('fr-FR'),
        status: 'succès',
        dataCount: '46,500 enregistrements',
      };
      setBackups([newBackup, ...backups]);
      setIsProcessing(false);
      setMessage('Sauvegarde créée avec succès');
    }, 3000);
  };

  const handleRestoreBackup = (backup) => {
    setSelectedBackup(backup);
    setDialogType('restore');
    setOpenDialog(true);
  };

  const confirmRestore = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setOpenDialog(false);
      setIsProcessing(false);
      setMessage(`Restauration de ${selectedBackup.name} terminée avec succès`);
    }, 3000);
  };

  const handleDownloadBackup = (backup) => {
    const element = document.createElement('a');
    element.href = '#';
    element.download = `backup-${backup.id}.tar.gz`;
    element.click();
    setMessage(`Téléchargement de ${backup.name} en cours...`);
  };

  const handleDeleteBackup = (backup) => {
    setBackups(backups.filter(b => b.id !== backup.id));
    setMessage(`Sauvegarde ${backup.name} supprimée`);
  };

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
              disabled={isProcessing}
              sx={{ backgroundColor: '#4caf50' }}
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
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0056B3' }}>
                {backups.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Espace utilisé
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#ff9800' }}>
                {backups.reduce((total, b) => {
                  const size = parseInt(b.size);
                  return total + size;
                }, 0)} GB
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Succès
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#4caf50' }}>
                {backups.filter(b => b.status === 'succès').length}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Backups Table */}
        <Paper sx={{ border: '1px solid #e0e0e0', overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Taille</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Données</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#212121' }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>{backup.name}</TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>{backup.type}</TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>{backup.size}</TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>{backup.date}</TableCell>
                  <TableCell sx={{ fontSize: '13px', color: '#666' }}>{backup.dataCount}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        backgroundColor:
                          backup.status === 'succès'
                            ? '#4caf5020'
                            : backup.status === 'échouée'
                            ? '#d32f2f20'
                            : '#ff980020',
                        color:
                          backup.status === 'succès'
                            ? '#4caf50'
                            : backup.status === 'échouée'
                            ? '#d32f2f'
                            : '#ff9800',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {backup.status}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadBackup(backup)}
                      >
                        Télécharger
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RestoreIcon />}
                        onClick={() => handleRestoreBackup(backup)}
                        color="success"
                      >
                        Restaurer
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteBackup(backup)}
                        color="error"
                      >
                        Supprimer
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Restore Dialog */}
        <Dialog open={openDialog && dialogType === 'restore'} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Confirmer la restauration</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ marginBottom: '16px' }}>
              ⚠️ Cette action restaurera toutes les données à l'état de la sauvegarde sélectionnée. Les données actuelles seront remplacées.
            </Alert>
            {selectedBackup && (
              <Box>
                <Typography sx={{ fontWeight: 600, marginBottom: '8px' }}>
                  {selectedBackup.name}
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#666' }}>
                  Date: {selectedBackup.date}
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#666' }}>
                  Données: {selectedBackup.dataCount}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button
              onClick={confirmRestore}
              variant="contained"
              color="error"
              disabled={isProcessing}
            >
              {isProcessing ? 'Restauration...' : 'Confirmer Restauration'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
