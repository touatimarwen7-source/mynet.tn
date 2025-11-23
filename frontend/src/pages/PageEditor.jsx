import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Stack,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublishIcon from '@mui/icons-material/Publish';
import PreviewIcon from '@mui/icons-material/Preview';

export default function PageEditor() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const { pageId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [openPreview, setOpenPreview] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    status: 'brouillon',
    seoTitle: '',
    seoDescription: '',
    keywords: '',
  });

  // Original state for tracking changes
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    // Simulate loading page data
    const mockPage = {
      id: pageId || 1,
      title: 'Accueil',
      slug: 'home',
      description: 'Page d\'accueil de MyNet.tn',
      content: '<h1>Bienvenue sur MyNet.tn</h1><p>Plateforme B2B d\'approvisionnement...</p>',
      status: 'publié',
      seoTitle: 'MyNet.tn - Plateforme B2B d\'Approvisionnement',
      seoDescription: 'Plateforme de gestion d\'appels d\'offres et d\'approvisionnement pour les entreprises tunisiennes',
      keywords: 'appel offre, approvisionnement, B2B, Tunisie',
    };

    setTimeout(() => {
      setFormData(mockPage);
      setOriginalData(mockPage);
      setLoading(false);
    }, 500);
  }, [pageId]);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      showMessage('Le titre et le slug sont obligatoires', 'error');
      return;
    }

    if (!formData.content) {
      showMessage('Le contenu ne peut pas être vide', 'error');
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOriginalData(formData);
      showMessage('Page modifiée avec succès', 'success');
    } catch (err) {
      showMessage('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.slug) {
      showMessage('Le titre et le slug sont obligatoires', 'error');
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedData = { ...formData, status: 'publié' };
      setFormData(updatedData);
      setOriginalData(updatedData);
      showMessage('Page publiée avec succès', 'success');
    } catch (err) {
      showMessage('Erreur lors de la publication', 'error');
    } finally {
      setSaving(false);
    }
  };

  const [openBackDialog, setOpenBackDialog] = useState(false);

  const handleBack = () => {
    if (JSON.stringify(formData) !== JSON.stringify(originalData)) {
      setOpenBackDialog(true);
    } else {
      navigate('/super-admin');
    }
  };

  const confirmBack = () => {
    setOpenBackDialog(false);
    navigate('/super-admin');
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
        <Container maxWidth="lg">
          <Typography>Chargement...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ color: theme.palette.primary.main }}
              disabled={saving}
            >
              Retour
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary, flex: 1 }}>
              Modifier la Page: {formData.title}
            </Typography>
            <Box sx={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: '4px',
              backgroundColor: formData.status === 'publié' ? '#e8f5e9' : '#fff3e0',
              color: formData.status === 'publié' ? '#2e7d32' : '#e65100',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {formData.status === 'publié' ? 'Publié' : 'Brouillon'}
            </Box>
          </Box>

          {message && (
            <Alert severity={messageType} onClose={() => setMessage('')} sx={{ marginBottom: '16px' }}>
              {message}
            </Alert>
          )}

          {hasChanges && (
            <Alert severity="info" sx={{ marginBottom: '16px' }}>
              Vous avez des modifications non sauvegardées
            </Alert>
          )}
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Column - Editor */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Basic Info */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}>
                    Informations Générales
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Titre de la Page"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      variant="outlined"
                      placeholder="ex: Accueil"
                      helperText="Le titre affiché dans le navigateur"
                    />
                    <TextField
                      fullWidth
                      label="Slug (URL)"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      variant="outlined"
                      placeholder="ex: home"
                      helperText="URL unique sans espaces"
                    />
                    <TextField
                      fullWidth
                      label="Description Courte"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      variant="outlined"
                      multiline
                      rows={2}
                      placeholder="Brève description..."
                      helperText="Visible dans les listes"
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}>
                    Contenu de la Page
                  </Typography>
                  <TextField
                    fullWidth
                    label="Contenu HTML"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    variant="outlined"
                    multiline
                    rows={12}
                    placeholder="<h1>Titre</h1><p>Contenu...</p>"
                    sx={{ fontFamily: 'monospace' }}
                    helperText="HTML accepté. Exemple: <h1>Titre</h1>, <p>Paragraphe</p>, <img src='...' />"
                  />
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}>
                    Paramètres SEO
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Titre SEO"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      variant="outlined"
                      placeholder="ex: MyNet.tn - Plateforme B2B"
                      helperText="Titre pour les moteurs de recherche (max 60 caractères)"
                    />
                    <TextField
                      fullWidth
                      label="Description SEO"
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      variant="outlined"
                      multiline
                      rows={2}
                      placeholder="Description pour Google..."
                      helperText="Description visible dans les résultats (max 160 caractères)"
                    />
                    <TextField
                      fullWidth
                      label="Mots-clés"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleInputChange}
                      variant="outlined"
                      placeholder="appel offre, approvisionnement, B2B"
                      helperText="Séparés par des virgules"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column - Preview & Actions */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Actions */}
              <Card sx={{ border: '1px solid #e0e0e0', backgroundColor: '#f9f9f9' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: '16px' }}>
                    Actions
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={saving || !hasChanges}
                      sx={{ backgroundColor: theme.palette.primary.main }}
                    >
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PublishIcon />}
                      onClick={handlePublish}
                      disabled={saving || formData.status === 'publié'}
                      sx={{ backgroundColor: '#2e7d32' }}
                    >
                      Publier
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PreviewIcon />}
                      onClick={() => setOpenPreview(true)}
                      sx={{ color: theme.palette.primary.main, borderColor: theme.palette.primary.main }}
                    >
                      Aperçu
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Info Panel */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}>
                    Informations
                  </Typography>
                  <Stack spacing={2} sx={{ fontSize: '13px' }}>
                    <Box>
                      <Typography sx={{ color: '#666', fontSize: '11px' }}>URL de la Page</Typography>
                      <Typography sx={{ fontFamily: 'monospace', color: theme.palette.primary.main, fontWeight: 500 }}>
                        /{formData.slug}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#666', fontSize: '11px' }}>Statut</Typography>
                      <Typography sx={{ fontWeight: 500 }}>
                        {formData.status === 'publié' ? '✓ Publiée' : 'En brouillon'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#666', fontSize: '11px' }}>Contenu</Typography>
                      <Typography sx={{ fontWeight: 500 }}>
                        {formData.content.length} caractères
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Aide */}
              <Card sx={{ border: '1px solid #e0e0e0', backgroundColor: '#f0f8ff' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '12px', fontSize: '14px' }}>
                    Aide
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    <strong>Slug:</strong> Identifiant unique dans l'URL<br/>
                    <strong>Statut:</strong> Brouillon (caché) ou Publié (visible)<br/>
                    <strong>Contenu:</strong> Accepte le HTML standard<br/>
                    <strong>SEO:</strong> Pour améliorer le classement Google
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Preview Dialog */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Aperçu: {formData.title}
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <Paper sx={{ padding: '24px', backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
            <Box
              sx={{ '& h1, & h2, & h3': { color: theme.palette.primary.main, marginTop: '16px' } }}
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          </Paper>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={() => setOpenPreview(false)} sx={{ color: '#666' }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Back Confirmation Dialog */}
      <Dialog open={openBackDialog} onClose={() => setOpenBackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#ff9800' }}>
          Modifications Non Sauvegardées
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px' }}>
          <Typography>
            Vous avez des modifications non sauvegardées. Voulez-vous quitter sans sauvegarder?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={() => setOpenBackDialog(false)} sx={{ color: '#666' }}>
            Continuer
          </Button>
          <Button
            variant="contained"
            onClick={confirmBack}
            sx={{ backgroundColor: '#ff9800' }}
          >
            Quitter sans Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
