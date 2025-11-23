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
  Tabs,
  Tab,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ paddingTop: '24px' }}>{children}</Box>}
    </div>
  );
}

export default function SuperAdminCRUD() {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Pages State
  const [pages, setPages] = useState([
    { id: 1, title: 'Accueil', slug: 'home', status: 'publié', updatedAt: '2025-01-20' },
    { id: 2, title: 'À Propos', slug: 'about', status: 'publié', updatedAt: '2025-01-19' },
    { id: 3, title: 'Solutions', slug: 'solutions', status: 'brouillon', updatedAt: '2025-01-18' },
    { id: 4, title: 'Tarification', slug: 'pricing', status: 'publié', updatedAt: '2025-01-17' },
    { id: 5, title: 'Contact', slug: 'contact', status: 'publié', updatedAt: '2025-01-15' },
  ]);

  // Files State
  const [files, setFiles] = useState([
    { id: 1, name: 'logo-mynet.png', type: 'Image', size: '245 KB', uploadedAt: '2025-01-20', url: '/storage/logo.png' },
    { id: 2, name: 'hero-banner.jpg', type: 'Image', size: '512 KB', uploadedAt: '2025-01-19', url: '/storage/banner.jpg' },
    { id: 3, name: 'terms-of-service.pdf', type: 'Document', size: '125 KB', uploadedAt: '2025-01-18', url: '/storage/terms.pdf' },
    { id: 4, name: 'privacy-policy.pdf', type: 'Document', size: '98 KB', uploadedAt: '2025-01-17', url: '/storage/privacy.pdf' },
  ]);

  // Documents State
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Guide Admin v1.2', versions: 3, lastUpdated: '2025-01-20', status: 'actif' },
    { id: 2, name: 'Conditions d\'Utilisation', versions: 5, lastUpdated: '2025-01-19', status: 'actif' },
  ]);

  // Form State
  const [formData, setFormData] = useState({ title: '', slug: '', description: '', status: 'brouillon' });

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  // PAGE ACTIONS
  const handleViewPage = (page) => {
    setSelectedItem(page);
    setDialogType('viewPage');
    setOpenDialog(true);
  };

  const handleEditPage = (page) => {
    // Navigate to dedicated page editor for rich editing experience
    window.location.href = `/super-admin/page-editor/${page.id}`;
  };

  const handleDeletePage = (page) => {
    setSelectedItem(page);
    setOpenDeleteConfirm(true);
  };

  const confirmDeletePage = () => {
    setPages(pages.filter(p => p.id !== selectedItem.id));
    setOpenDeleteConfirm(false);
    showMessage(`Page "${selectedItem.title}" supprimée avec succès`, 'success');
  };

  const handleCreatePage = () => {
    setSelectedItem(null);
    setFormData({ title: '', slug: '', description: '', status: 'brouillon' });
    setDialogType('createPage');
    setOpenDialog(true);
  };

  const savePageChanges = () => {
    if (!formData.title || !formData.slug) {
      showMessage('Titre et Slug sont obligatoires', 'error');
      return;
    }

    if (dialogType === 'createPage') {
      const newPage = {
        id: Math.max(...pages.map(p => p.id), 0) + 1,
        title: formData.title,
        slug: formData.slug,
        status: formData.status,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setPages([...pages, newPage]);
      showMessage('Page créée avec succès', 'success');
    } else if (dialogType === 'editPage') {
      setPages(pages.map(p =>
        p.id === selectedItem.id
          ? { ...p, title: formData.title, slug: formData.slug, status: formData.status, updatedAt: new Date().toISOString().split('T')[0] }
          : p
      ));
      showMessage('Page modifiée avec succès', 'success');
    }
    closeDialog();
  };

  // FILE ACTIONS
  const handleViewFile = (file) => {
    window.open(file.url, '_blank');
    showMessage(`Ouverture: ${file.name}`, 'success');
  };

  const handleDeleteFile = (file) => {
    setSelectedItem(file);
    setOpenDeleteConfirm(true);
  };

  const confirmDeleteFile = () => {
    setFiles(files.filter(f => f.id !== selectedItem.id));
    setOpenDeleteConfirm(false);
    showMessage(`Fichier "${selectedItem.name}" supprimé avec succès`, 'success');
  };

  const handleUploadFile = () => {
    setSelectedItem(null);
    setFormData({ title: '', slug: '', description: '', status: 'brouillon' });
    setDialogType('uploadFile');
    setOpenDialog(true);
  };

  const saveFileUpload = () => {
    if (!formData.title) {
      showMessage('Nom du fichier obligatoire', 'error');
      return;
    }
    const newFile = {
      id: Math.max(...files.map(f => f.id), 0) + 1,
      name: formData.title,
      type: 'Document',
      size: '0 KB',
      uploadedAt: new Date().toISOString().split('T')[0],
      url: '#',
    };
    setFiles([...files, newFile]);
    showMessage('Fichier ajouté avec succès', 'success');
    closeDialog();
  };

  // DOCUMENT ACTIONS
  const handleAddDocument = () => {
    setSelectedItem(null);
    setFormData({ title: '', slug: '', description: '', status: 'brouillon' });
    setDialogType('addDocument');
    setOpenDialog(true);
  };

  const saveDocumentChanges = () => {
    if (!formData.title) {
      showMessage('Nom du document obligatoire', 'error');
      return;
    }
    const newDoc = {
      id: Math.max(...documents.map(d => d.id), 0) + 1,
      name: formData.title,
      versions: 1,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'actif',
    };
    setDocuments([...documents, newDoc]);
    showMessage('Document créé avec succès', 'success');
    closeDialog();
  };

  // BACKUP ACTIONS
  const handleBackup = () => {
    showMessage('Sauvegarde en cours...', 'success');
    setTimeout(() => showMessage('Sauvegarde créée avec succès', 'success'), 2000);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({ title: '', slug: '', description: '', status: 'brouillon' });
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#212121', marginBottom: '32px' }}>
          Centre de Contrôle Super Admin
        </Typography>

        {message && (
          <Alert severity={messageType} sx={{ marginBottom: '24px' }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Paper sx={{ border: '1px solid #e0e0e0' }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': {
                color: '#666',
                fontWeight: 500,
                textTransform: 'none',
              },
              '& .Mui-selected': {
                color: '#0056B3',
              },
            }}
          >
            <Tab label="Pages Statiques" />
            <Tab label="Gestion des Fichiers" />
            <Tab label="Documents" />
            <Tab label="Paramètres" />
          </Tabs>

          {/* Pages Statiques Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ padding: '24px' }}>
              <Stack direction="row" spacing={2} sx={{ marginBottom: '24px' }}>
                <Typography sx={{ fontWeight: 600, color: '#212121', flex: 1 }}>
                  Gestion des Pages Statiques
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreatePage}
                  sx={{ backgroundColor: '#0056B3' }}
                >
                  Créer une Page
                </Button>
              </Stack>

              <Paper sx={{ border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Titre</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Slug</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Mise à jour</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{page.title}</TableCell>
                        <TableCell>/{page.slug}</TableCell>
                        <TableCell>
                          <Box sx={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            backgroundColor: page.status === 'publié' ? '#e8f5e9' : '#fff3e0',
                            color: page.status === 'publié' ? '#2e7d32' : '#e65100',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}>
                            {page.status}
                          </Box>
                        </TableCell>
                        <TableCell>{page.updatedAt}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewPage(page)}
                              sx={{ color: '#0056B3' }}
                            >
                              Aperçu
                            </Button>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEditPage(page)}
                              sx={{ color: '#0056B3' }}
                            >
                              Modifier
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeletePage(page)}
                              sx={{ color: '#c62828' }}
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
            </Box>
          </TabPanel>

          {/* Fichiers Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ padding: '24px' }}>
              <Stack direction="row" spacing={2} sx={{ marginBottom: '24px' }}>
                <Typography sx={{ fontWeight: 600, color: '#212121', flex: 1 }}>
                  Galerie d'Images
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleUploadFile}
                  sx={{ backgroundColor: '#0056B3' }}
                >
                  Télécharger
                </Button>
              </Stack>

              <Paper sx={{ border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Taille</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Téléchargé</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{file.name}</TableCell>
                        <TableCell>{file.type}</TableCell>
                        <TableCell>{file.size}</TableCell>
                        <TableCell>{file.uploadedAt}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewFile(file)}
                              sx={{ color: '#0056B3' }}
                            >
                              Voir
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteFile(file)}
                              sx={{ color: '#c62828' }}
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
            </Box>
          </TabPanel>

          {/* Documents Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ padding: '24px' }}>
              <Stack direction="row" spacing={2} sx={{ marginBottom: '24px' }}>
                <Typography sx={{ fontWeight: 600, color: '#212121', flex: 1 }}>
                  Gestion des Documents
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddDocument}
                  sx={{ backgroundColor: '#0056B3' }}
                >
                  Ajouter Document
                </Button>
              </Stack>

              <Paper sx={{ border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Versions</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Dernière Mise à Jour</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{doc.name}</TableCell>
                        <TableCell>{doc.versions}</TableCell>
                        <TableCell>{doc.lastUpdated}</TableCell>
                        <TableCell>
                          <Box sx={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}>
                            {doc.status}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          </TabPanel>

          {/* Paramètres Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ padding: '24px' }}>
              <Typography sx={{ fontWeight: 600, color: '#212121', marginBottom: '24px' }}>
                Paramètres Système
              </Typography>

              <Stack spacing={2}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#0056B3', marginBottom: '12px' }}>
                        Sauvegarde et Restauration
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          onClick={handleBackup}
                          sx={{ color: '#0056B3', borderColor: '#0056B3' }}
                        >
                          Créer une Sauvegarde
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{ color: '#0056B3', borderColor: '#0056B3' }}
                        >
                          Restaurer à partir d'une Sauvegarde
                        </Button>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#0056B3', marginBottom: '12px' }}>
                        Configuration du Système
                      </Typography>
                      <Typography sx={{ color: '#666', fontSize: '14px' }}>
                        Version: 1.0.0 • Dernière mise à jour: 2025-01-20 • Base de données: PostgreSQL
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </TabPanel>
        </Paper>
      </Container>

      {/* Edit/Create Page Dialog */}
      <Dialog open={openDialog && (dialogType === 'createPage' || dialogType === 'editPage')} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#0056B3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {dialogType === 'createPage' ? 'Créer une Page' : 'Modifier la Page'}
          <Button size="small" startIcon={<CloseIcon />} onClick={closeDialog} sx={{ color: '#666' }} />
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Titre"
              variant="outlined"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ex: Accueil"
            />
            <TextField
              fullWidth
              label="Slug (URL)"
              variant="outlined"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="ex: home"
            />
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Contenu de la page..."
            />
            <TextField
              fullWidth
              select
              label="Statut"
              variant="outlined"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="brouillon">Brouillon</option>
              <option value="publié">Publié</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={closeDialog} sx={{ color: '#666' }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={savePageChanges} startIcon={<SaveIcon />} sx={{ backgroundColor: '#0056B3' }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Page Dialog */}
      <Dialog open={openDialog && dialogType === 'viewPage'} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#0056B3' }}>
          Aperçu: {selectedItem?.title}
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Titre</Typography>
              <Typography sx={{ fontWeight: 500 }}>{selectedItem?.title}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>URL</Typography>
              <Typography sx={{ fontWeight: 500 }}>/{selectedItem?.slug}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Statut</Typography>
              <Box sx={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '4px',
                backgroundColor: selectedItem?.status === 'publié' ? '#e8f5e9' : '#fff3e0',
                color: selectedItem?.status === 'publié' ? '#2e7d32' : '#e65100',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                {selectedItem?.status}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={closeDialog} sx={{ color: '#666' }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload File Dialog */}
      <Dialog open={openDialog && dialogType === 'uploadFile'} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#0056B3' }}>
          Télécharger un Fichier
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Nom du Fichier"
              variant="outlined"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ex: logo.png"
            />
            <TextField
              fullWidth
              label="Sélectionner un Fichier"
              variant="outlined"
              type="file"
              inputProps={{ accept: 'image/*,application/pdf' }}
            />
            <Typography sx={{ fontSize: '12px', color: '#999' }}>
              Formats acceptés: Images (PNG, JPG, GIF), Documents (PDF)
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={closeDialog} sx={{ color: '#666' }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={saveFileUpload} startIcon={<SaveIcon />} sx={{ backgroundColor: '#0056B3' }}>
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={openDialog && dialogType === 'addDocument'} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#0056B3' }}>
          Ajouter un Document
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Nom du Document"
              variant="outlined"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ex: Guide Admin v1.3"
            />
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du document..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={closeDialog} sx={{ color: '#666' }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={saveDocumentChanges} startIcon={<SaveIcon />} sx={{ backgroundColor: '#0056B3' }}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle sx={{ fontWeight: 600, color: '#c62828' }}>
          Confirmer la Suppression
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <Typography>
            Êtes-vous sûr de vouloir supprimer <strong>{selectedItem?.title || selectedItem?.name}</strong>?
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
            Cette action ne peut pas être annulée.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={() => setOpenDeleteConfirm(false)} sx={{ color: '#666' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (dialogType === 'viewPage' || dialogType === 'editPage') {
                confirmDeletePage();
              } else if (dialogType === 'uploadFile') {
                confirmDeleteFile();
              }
              setOpenDeleteConfirm(false);
            }}
            sx={{ backgroundColor: '#c62828' }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
