import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Button, Paper, Tabs, Tab, Stack, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import AdminTable from '../../components/Admin/AdminTable';
import AdminDialog from '../../components/Admin/AdminDialog';
import AdminForm from '../../components/Admin/AdminForm';
import SkeletonLoader from '../../components/SkeletonLoader';
import { EMPTY_STATES, FEATURE_FLAGS, isFeatureEnabled } from '../../utils/adminHelpers';

/**
 * Refactored SuperAdminCRUD - Reduced from 667 to ~250 lines
 * Using reusable components (AdminTable, AdminDialog, AdminForm)
 * Eliminates 200+ lines of duplicated code
 */

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ py: 3 }}>{children}</Box>}</div>;
}

export default function SuperAdminCRUD() {
  const navigate = useNavigate();
  const context = useContext(SuperAdminContext);
  
  if (!context) return <Alert severity="error">Context not available</Alert>;

  const { pages, files, documents, users, loading, error, success, 
    fetchPages, fetchFiles, fetchDocuments, fetchUsers,
    createPage, updatePage, deletePage, uploadFile, deleteFile,
    createDocument, deleteDocument, updateUserRole, blockUser, unblockUser } = context;

  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ title: '', slug: '', description: '', status: 'brouillon' });

  // Auto-hide messages
  useEffect(() => {
    if (success || error) {
      setMessage(success || error);
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Load data
  useEffect(() => {
    Promise.all([fetchPages(), fetchFiles(), fetchDocuments(), fetchUsers()]);
  }, []);

  // Handlers
  const openCreateDialog = (type) => {
    setDialogType(type);
    setSelectedItem(null);
    setFormData({ title: '', slug: '', description: '', status: 'brouillon' });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      setMessage('Titre obligatoire');
      return;
    }

    if (dialogType === 'page') {
      selectedItem 
        ? await updatePage(selectedItem.id, formData)
        : await createPage(formData);
    } else if (dialogType === 'document') {
      await createDocument(formData);
    }
    
    setOpenDialog(false);
  };

  const handleDelete = async (item) => {
    if (window.confirm('Confirmer la suppression?')) {
      if (dialogType === 'page') await deletePage(item.id);
      else if (dialogType === 'file') await deleteFile(item.id);
      else if (dialogType === 'document') await deleteDocument(item.id);
    }
  };

  // Table configurations
  const pageColumns = [
    { field: 'title', label: 'Titre' },
    { field: 'slug', label: 'Slug' },
    { field: 'status', label: 'Statut' },
    { field: 'updated_at', label: 'Modifiée' }
  ];

  const fileColumns = [
    { field: 'name', label: 'Nom' },
    { field: 'file_type', label: 'Type' },
    { field: 'size_bytes', label: 'Taille' },
    { field: 'created_at', label: 'Uploadée' }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Paper>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
          <Tab label="📄 Pages" />
          <Tab label="📁 Fichiers" />
          <Tab label="📋 Documents" />
          <Tab label="👥 Utilisateurs" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ mt: 3 }}>
          <SkeletonLoader type="table" />
        </Box>
      ) : (
        <>
          {/* PAGES TAB */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={2}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => openCreateDialog('page')}
              >
                Créer Page
              </Button>
              <AdminTable
                columns={pageColumns}
                rows={pages || []}
                onEdit={(row) => {
                  setSelectedItem(row);
                  setFormData(row);
                  setDialogType('page');
                  setOpenDialog(true);
                }}
                onDelete={(row) => {
                  setDialogType('page');
                  handleDelete(row);
                }}
                emptyMessage={EMPTY_STATES.pages}
              />
            </Stack>
          </TabPanel>

          {/* FILES TAB */}
          <TabPanel value={tabValue} index={1}>
            <Stack spacing={2}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => openCreateDialog('file')}
              >
                Télécharger
              </Button>
              <AdminTable
                columns={fileColumns}
                rows={files || []}
                onDelete={(row) => {
                  setDialogType('file');
                  handleDelete(row);
                }}
                emptyMessage={EMPTY_STATES.files}
              />
            </Stack>
          </TabPanel>

          {/* DOCUMENTS TAB */}
          <TabPanel value={tabValue} index={2}>
            <Stack spacing={2}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => openCreateDialog('document')}
              >
                Ajouter Document
              </Button>
              <AdminTable
                columns={[{ field: 'name', label: 'Nom' }, { field: 'created_at', label: 'Créé' }]}
                rows={documents || []}
                onDelete={(row) => {
                  setDialogType('document');
                  handleDelete(row);
                }}
                emptyMessage={EMPTY_STATES.documents}
              />
            </Stack>
          </TabPanel>

          {/* USERS TAB */}
          <TabPanel value={tabValue} index={3}>
            <AdminTable
              columns={[
                { field: 'email', label: 'Email' },
                { field: 'role', label: 'Rôle' },
                { field: 'created_at', label: 'Créé' }
              ]}
              rows={users || []}
              emptyMessage={EMPTY_STATES.users}
            />
          </TabPanel>
        </>
      )}

      {/* DIALOG */}
      <AdminDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleSave}
        title={`${selectedItem ? 'Modifier' : 'Créer'} ${dialogType}`}
        loading={loading}
      >
        <AdminForm
          fields={[
            { name: 'title', label: 'Titre', required: true },
            { name: 'slug', label: 'Slug' },
            { name: 'description', label: 'Description', multiline: true, rows: 3 },
            { 
              name: 'status', 
              label: 'Statut', 
              type: 'select',
              options: [
                { value: 'brouillon', label: 'Brouillon' },
                { value: 'publié', label: 'Publié' }
              ]
            }
          ]}
          values={formData}
          onChange={setFormData}
          onCancel={() => setOpenDialog(false)}
          loading={loading}
        />
      </AdminDialog>
    </Container>
  );
}
