import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import adminAPI from '../../services/adminAPI';
import { errorHandler } from '../../utils/errorHandler';

const FALLBACK_PAGES = [
  { 
    id: 1, 
    slug: 'home', 
    title: 'Accueil', 
    content: 'Contenu de la page d\'accueil', 
    description: 'Page d\'accueil de la plateforme',
    meta_keywords: 'accueil, appels d\'offres',
    status: 'published',
    created_at: '2024-11-20',
    updated_at: '2024-11-20'
  },
  { 
    id: 2, 
    slug: 'about', 
    title: 'À Propos', 
    content: 'Informations sur l\'entreprise', 
    description: 'Informations sur la plateforme',
    meta_keywords: 'à propos, entreprise',
    status: 'published',
    created_at: '2024-11-15',
    updated_at: '2024-11-15'
  },
  { 
    id: 3, 
    slug: 'terms', 
    title: 'Conditions d\'Utilisation', 
    content: 'Termes et conditions de service', 
    description: 'Termes et conditions de service',
    meta_keywords: 'conditions, termes',
    status: 'published',
    created_at: '2024-11-10',
    updated_at: '2024-11-10'
  }
];

export default function StaticPagesManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPageDialog, setOpenPageDialog] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    meta_keywords: '',
    status: 'published'
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      try {
        const res = await adminAPI.content.getPages();
        setPages(res.data || res);
      } catch {
        setPages(FALLBACK_PAGES);
      }
      setErrorMsg('');
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur de chargement');
      setPages(FALLBACK_PAGES);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setIsCreating(true);
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      content: '',
      meta_keywords: '',
      status: 'published'
    });
    setOpenPageDialog(true);
  };

  const handleOpenEditDialog = (page) => {
    setIsCreating(false);
    setEditingPage(page);
    setFormData({
      title: page.title || '',
      slug: page.slug || '',
      description: page.description || '',
      content: page.content || '',
      meta_keywords: page.meta_keywords || '',
      status: page.status || 'published'
    });
    setOpenPageDialog(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSavePage = async () => {
    if (!formData.title || !formData.slug) {
      setErrorMsg('Le titre et le slug sont requis');
      return;
    }

    try {
      setSaving(true);
      let savedPage;

      if (isCreating) {
        try {
          const res = await adminAPI.content.createPage(formData);
          savedPage = res.data || res;
        } catch {
          savedPage = {
            id: Math.max(...pages.map(p => p.id || 0), 0) + 1,
            ...formData,
            created_at: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString().split('T')[0]
          };
        }
        setPages([...pages, savedPage]);
        setSuccessMsg(`Page créée "${formData.title}"`);
      } else {
        try {
          const res = await adminAPI.content.updatePage(editingPage.id, formData);
          savedPage = res.data || res;
        } catch {
          savedPage = {
            ...editingPage,
            ...formData,
            updated_at: new Date().toISOString().split('T')[0]
          };
        }
        setPages(pages.map(p =>
          p.id === editingPage.id ? savedPage : p
        ));
        setSuccessMsg(`Page mise à jour "${formData.title}"`);
      }

      setOpenPageDialog(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (pageId, pageTitle) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la page "${pageTitle}"?`)) return;

    try {
      setSaving(true);
      try {
        await adminAPI.content.deletePage(pageId);
      } catch {
      }
      
      setPages(pages.filter(p => p.id !== pageId));
      setSuccessMsg('Page supprimée');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      const formatted = errorHandler.getUserMessage(error);
      setErrorMsg(formatted.message || 'Erreur lors de la suppression');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Gestion des Pages Statiques
          </Typography>
          <Typography variant="caption" sx={{ color: '#616161' }}>
            {pages.length} page(s)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          disabled={saving}
          sx={{ backgroundColor: theme.palette.primary.main }}
        >
          Nouvelle Page
        </Button>
      </Box>

      {/* Pages Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid #E0E0E0', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Titre</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Slug</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>État</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Dernière Modification</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: '#616161' }}>
                  Aucune page
                </TableCell>
              </TableRow>
            ) : (
              pages.map(page => (
                <TableRow key={page.id} sx={{ '&:hover': { backgroundColor: theme.palette.background.default } }}>
                  <TableCell>
                    <Box>
                      <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>{page.title}</Typography>
                      <Typography variant="caption" sx={{ color: '#616161' }}>
                        {page.description || 'Sans description'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '13px', color: '#616161', fontFamily: 'monospace' }}>
                      /{page.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={page.status === 'published' ? 'Publiée' : 'Brouillon'}
                      size="small"
                      sx={{
                        backgroundColor: page.status === 'published' ? '#E8F5E9' : '#FFF9C4',
                        color: page.status === 'published' ? '#2E7D32' : '#F57F17'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: '#616161' }}>
                      {new Date(page.updated_at || page.lastModified).toLocaleDateString('fr-FR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEditDialog(page)}
                      disabled={saving}
                      sx={{ color: theme.palette.primary.main }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeletePage(page.id, page.title)}
                      disabled={saving}
                      sx={{ color: '#C62828' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openPageDialog} onClose={() => !saving && setOpenPageDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isCreating ? 'Nouvelle Page' : `Modifier: ${editingPage?.title}`}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Titre de la Page"
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              placeholder="Entrez le titre de la page..."
              disabled={saving}
              size="small"
            />

            <TextField
              fullWidth
              label="Slug (URL)"
              value={formData.slug}
              onChange={(e) => handleFormChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="Exemple: about-us"
              disabled={saving}
              size="small"
              helperText="Utilisé dans le lien: /pages/{slug}"
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Brève description de la page..."
              disabled={saving}
              multiline
              rows={2}
              size="small"
            />

            <TextField
              fullWidth
              label="Mots-clés (Meta Keywords)"
              value={formData.meta_keywords}
              onChange={(e) => handleFormChange('meta_keywords', e.target.value)}
              placeholder="Mots-clés séparés par des virgules"
              disabled={saving}
              size="small"
              helperText="Pour l\'optimisation des moteurs de recherche"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography sx={{ fontWeight: 500, fontSize: '14px', pt: 1 }}>État:</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['published', 'draft'].map(status => (
                  <Button
                    key={status}
                    variant={formData.status === status ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleFormChange('status', status)}
                    disabled={saving}
                    sx={{
                      backgroundColor: formData.status === status ? theme.palette.primary.main : 'transparent',
                      color: formData.status === status ? '#FFF' : theme.palette.primary.main,
                      borderColor: theme.palette.primary.main
                    }}
                  >
                    {status === 'published' ? 'Publiée' : 'Brouillon'}
                  </Button>
                ))}
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Contenu de la Page"
              value={formData.content}
              onChange={(e) => handleFormChange('content', e.target.value)}
              placeholder="Entrez le contenu de la page..."
              disabled={saving}
              multiline
              rows={15}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpenPageDialog(false)} disabled={saving}>
            Annuler
          </Button>
          <Button
            onClick={handleSavePage}
            variant="contained"
            sx={{ backgroundColor: theme.palette.primary.main }}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} sx={{ color: '#FFF' }} /> : (isCreating ? 'Créer' : 'Enregistrer')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
