import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { SuperAdminContext } from '../contexts/SuperAdminContext';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ paddingTop: '24px' }}>{children}</Box>}
    </div>
  );
}

export default function SuperAdminCRUD() {
  const navigate = useNavigate();
  const context = useContext(SuperAdminContext);
  
  if (!context) {
    return (
      <Container>
        <Alert severity="error">
          Context not available. Please ensure SuperAdminProvider is set up in App.js
        </Alert>
      </Container>
    );
  }

  const {
    pages,
    files,
    documents,
    users,
    fetchPages,
    fetchFiles,
    fetchDocuments,
    fetchUsers,
    createPage,
    updatePage,
    deletePage,
    uploadFile,
    deleteFile,
    createDocument,
    deleteDocument,
    updateUserRole,
    blockUser,
    unblockUser,
    loading,
    error,
    success,
  } = context;

  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [formData, setFormData] = useState({ title: '', slug: '', description: '', status: 'brouillon' });

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Show context messages
  useEffect(() => {
    if (success) {
      setMessage(success);
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      setMessage(error);
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  }, [error]);

  const loadAllData = async () => {
    await fetchPages();
    await fetchFiles();
    await fetchDocuments();
    await fetchUsers();
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setDialogType('');
    setFormData({ title: '', slug: '', description: '', status: 'brouillon' });
  };

  // ===== PAGE ACTIONS =====
  const handleViewPage = (page) => {
    setSelectedItem(page);
    setDialogType('viewPage');
    setOpenDialog(true);
  };

  const handleEditPage = (page) => {
    navigate(`/super-admin/page-editor/${page.id}`);
  };

  const handleDeletePage = (page) => {
    setSelectedItem(page);
    setOpenDeleteConfirm(true);
  };

  const confirmDeletePage = async () => {
    await deletePage(selectedItem.id);
    setOpenDeleteConfirm(false);
  };

  const handleCreatePage = () => {
    setSelectedItem(null);
    setFormData({ title: '', slug: '', description: '', status: 'brouillon' });
    setDialogType('createPage');
    setOpenDialog(true);
  };

  const savePageChanges = async () => {
    if (!formData.title || !formData.slug) {
      setMessage('Titre et Slug sont obligatoires');
      setMessageType('error');
      return;
    }

    if (dialogType === 'createPage') {
      await createPage({
        title: formData.title,
        slug: formData.slug,
        content: formData.description || '',
        status: formData.status,
      });
    } else if (dialogType === 'editPage') {
      await updatePage(selectedItem.id, {
        title: formData.title,
        slug: formData.slug,
        content: formData.description || '',
        status: formData.status,
      });
    }
    closeDialog();
  };

  // ===== FILE ACTIONS =====
  const handleViewFile = (file) => {
    window.open(file.url, '_blank');
    setMessage(`Ouverture: ${file.name}`);
    setMessageType('success');
  };

  const handleDeleteFile = (file) => {
    setSelectedItem(file);
    setOpenDeleteConfirm(true);
  };

  const confirmDeleteFile = async () => {
    await deleteFile(selectedItem.id);
    setOpenDeleteConfirm(false);
  };

  const handleUploadFile = () => {
    setSelectedItem(null);
    setFormData({ title: '', slug: '', description: '', status: 'brouillon' });
    setDialogType('uploadFile');
    setOpenDialog(true);
  };

  const saveFileUpload = async () => {
    if (!formData.title) {
      setMessage('Nom du fichier obligatoire');
      setMessageType('error');
      return;
    }
    
    await uploadFile({
      name: formData.title,
      size_bytes: 0,
      mime_type: 'application/octet-stream',
      url: '#',
    });
    closeDialog();
  };

  // ===== DOCUMENT ACTIONS =====
  const handleAddDocument = () => {
    setSelectedItem(null);
    setFormData({ title: '', slug: '', description: '', status: 'brouillon' });
    setDialogType('addDocument');
    setOpenDialog(true);
  };

  const saveDocumentChanges = async () => {
    if (!formData.title) {
      setMessage('Nom du document obligatoire');
      setMessageType('error');
      return;
    }
    
    await createDocument({
      name: formData.title,
      description: formData.description || '',
    });
    closeDialog();
  };

  const handleDeleteDocument = (doc) => {
    setSelectedItem(doc);
    setOpenDeleteConfirm(true);
  };

  const confirmDeleteDocument = async () => {
    await deleteDocument(selectedItem.id);
    setOpenDeleteConfirm(false);
  };

  // ===== USER ACTIONS =====
  const handleUpdateUserRole = async (userId, newRole) => {
    await updateUserRole(userId, newRole);
  };

  const handleBlockUser = async (userId) => {
    await blockUser(userId);
  };

  const handleUnblockUser = async (userId) => {
    await unblockUser(userId);
  };

  return (
    <Container maxWidth="xl" sx={{ paddingY: '40px' }}>
      {/* Messages */}
      {message && (
        <Alert severity={messageType} sx={{ marginBottom: '24px' }}>
          {message}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ marginBottom: '24px' }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label="📄 Pages Statiques" />
          <Tab label="📁 Fichiers" />
          <Tab label="📋 Documents" />
          <Tab label="👥 Utilisateurs" />
        </Tabs>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <CircularProgress />
        </Box>
      )}

      {/* PAGES TAB */}
      <TabPanel value={tabValue} index={0}>
        <Stack spacing={3}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePage}
            sx={{ alignSelf: 'flex-start' }}
          >
            Créer une Page
          </Button>

          <Paper sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Titre</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Slug</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Modifiée le</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id} hover>
                    <TableCell>{page.title}</TableCell>
                    <TableCell>{page.slug}</TableCell>
                    <TableCell>
                      <Box sx={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: page.status === 'publié' ? '#e8f5e9' : '#fff3e0',
                        color: page.status === 'publié' ? '#2e7d32' : '#e65100',
                        fontSize: '12px',
                      }}>
                        {page.status}
                      </Box>
                    </TableCell>
                    <TableCell>{page.updated_at || page.updatedAt}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => handleViewPage(page)} startIcon={<VisibilityIcon />}>
                        Voir
                      </Button>
                      <Button size="small" onClick={() => handleEditPage(page)} startIcon={<EditIcon />}>
                        Éditer
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDeletePage(page)} startIcon={<DeleteIcon />}>
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      </TabPanel>

      {/* FILES TAB */}
      <TabPanel value={tabValue} index={1}>
        <Stack spacing={3}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleUploadFile}
            sx={{ alignSelf: 'flex-start' }}
          >
            Télécharger un Fichier
          </Button>

          <Paper sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Taille</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Téléchargé le</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id} hover>
                    <TableCell>{file.name}</TableCell>
                    <TableCell>{file.file_type || file.type}</TableCell>
                    <TableCell>{file.size_bytes || file.size}</TableCell>
                    <TableCell>{file.created_at || file.uploadedAt}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => handleViewFile(file)} startIcon={<VisibilityIcon />}>
                        Voir
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDeleteFile(file)} startIcon={<DeleteIcon />}>
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      </TabPanel>

      {/* DOCUMENTS TAB */}
      <TabPanel value={tabValue} index={2}>
        <Stack spacing={3}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddDocument}
            sx={{ alignSelf: 'flex-start' }}
          >
            Ajouter un Document
          </Button>

          <Paper sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Versions</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Modifiée le</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{doc.versions || 1}</TableCell>
                    <TableCell>{doc.last_updated || doc.lastUpdated}</TableCell>
                    <TableCell>
                      <Box sx={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: doc.status === 'actif' ? '#e8f5e9' : '#ffebee',
                        color: doc.status === 'actif' ? '#2e7d32' : '#c62828',
                        fontSize: '12px',
                      }}>
                        {doc.status}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" color="error" onClick={() => handleDeleteDocument(doc)} startIcon={<DeleteIcon />}>
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      </TabPanel>

      {/* USERS TAB */}
      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rôle</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                      >
                        <MenuItem value="buyer">Acheteur</MenuItem>
                        <MenuItem value="supplier">Fournisseur</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="super_admin">Super Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: user.is_active ? '#e8f5e9' : '#ffebee',
                      color: user.is_active ? '#2e7d32' : '#c62828',
                      fontSize: '12px',
                    }}>
                      {user.is_active ? 'Actif' : 'Bloqué'}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {user.is_active ? (
                      <Button size="small" color="warning" onClick={() => handleBlockUser(user.id)}>
                        Bloquer
                      </Button>
                    ) : (
                      <Button size="small" color="success" onClick={() => handleUnblockUser(user.id)}>
                        Débloquer
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* CREATE/EDIT PAGE DIALOG */}
      <Dialog open={openDialog && (dialogType === 'createPage' || dialogType === 'editPage')} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {dialogType === 'createPage' ? 'Créer une Page' : 'Éditer la Page'}
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <Stack spacing={2}>
            <TextField
              label="Titre"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Slug"
              fullWidth
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Statut"
              >
                <MenuItem value="brouillon">Brouillon</MenuItem>
                <MenuItem value="publié">Publié</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={closeDialog} sx={{ color: '#666' }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={savePageChanges} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW PAGE DIALOG */}
      <Dialog open={openDialog && dialogType === 'viewPage'} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {selectedItem?.title}
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <Typography variant="body2" sx={{ color: '#666', marginBottom: '12px' }}>
            <strong>Slug:</strong> {selectedItem?.slug}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            <strong>Statut:</strong> {selectedItem?.status}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#666' }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* UPLOAD FILE DIALOG */}
      <Dialog open={openDialog && dialogType === 'uploadFile'} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Télécharger un Fichier
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <TextField
            label="Nom du fichier"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={closeDialog} sx={{ color: '#666' }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={saveFileUpload} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Télécharger'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD DOCUMENT DIALOG */}
      <Dialog open={openDialog && dialogType === 'addDocument'} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Ajouter un Document
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <Stack spacing={2}>
            <TextField
              label="Nom du document"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={closeDialog} sx={{ color: '#666' }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={saveDocumentChanges} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={openDeleteConfirm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#ff9800' }}>
          Confirmer la Suppression
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <Typography>
            Êtes-vous certain de vouloir supprimer {selectedItem?.title || selectedItem?.name}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={() => setOpenDeleteConfirm(false)} sx={{ color: '#666' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (selectedItem?.title !== undefined) {
                confirmDeletePage();
              } else if (selectedItem?.name && dialogType !== 'deleteDocument') {
                confirmDeleteFile();
              } else {
                confirmDeleteDocument();
              }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
