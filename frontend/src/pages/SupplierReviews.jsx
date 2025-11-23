import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams } from 'react-router-dom';
import { setPageTitle } from '../utils/pageTitle';
import axiosInstance from '../services/axiosConfig';

export default function SupplierReviews() {
  const theme = institutionalTheme;
  const { supplierId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    setPageTitle('Avis et Évaluations');
    fetchReviews();
  }, [supplierId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/procurement/reviews/user/${supplierId}`);
      setReviews(response.data);

      // Calculate stats
      if (response.data.length > 0) {
        const avgRating = (response.data.reduce((sum, r) => sum + r.rating, 0) / response.data.length).toFixed(2);
        const ratingCounts = {
          5: response.data.filter(r => r.rating === 5).length,
          4: response.data.filter(r => r.rating === 4).length,
          3: response.data.filter(r => r.rating === 3).length,
          2: response.data.filter(r => r.rating === 2).length,
          1: response.data.filter(r => r.rating === 1).length,
        };
        setStats({ avgRating, count: response.data.length, ratingCounts });
      }
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (review = null) => {
    if (review) {
      setEditingId(review.id);
      setFormData({
        rating: review.rating,
        title: review.title,
        comment: review.comment,
      });
    } else {
      setEditingId(null);
      setFormData({ rating: 5, title: '', comment: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axiosInstance.put(`/procurement/reviews/${editingId}`, formData);
      } else {
        await axiosInstance.post('/procurement/reviews', {
          reviewed_user_id: parseInt(supplierId),
          tender_id: null,
          ...formData,
        });
      }
      fetchReviews();
      handleCloseDialog();
      setError('');
    } catch (err) {
      setError('Erreur lors de la sauvegarde de l\'avis');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis?')) return;
    try {
      await axiosInstance.delete(`/procurement/reviews/${reviewId}`);
      fetchReviews();
    } catch (err) {
      setError('Erreur lors de la suppression de l\'avis');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            Avis et Évaluations
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ backgroundColor: theme.palette.primary.main }}
          >
            Ajouter un Avis
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ marginBottom: '20px' }}>{error}</Alert>}

        {stats.count && (
          <Card sx={{ marginBottom: '30px' }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {stats.avgRating}
                    </Typography>
                    <Rating value={parseFloat(stats.avgRating)} readOnly precision={0.1} />
                    <Typography variant="body2" sx={{ color: '#666', marginTop: '8px' }}>
                      Basé sur {stats.count} avis
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={9}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <Typography sx={{ minWidth: '20px' }}>{star}</Typography>
                      <Rating value={star} readOnly size="small" />
                      <LinearProgress
                        variant="determinate"
                        value={(stats.ratingCounts[star] / stats.count) * 100}
                        sx={{ flex: 1, height: '8px' }}
                      />
                      <Typography variant="body2" sx={{ minWidth: '30px' }}>
                        {stats.ratingCounts[star]}
                      </Typography>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Box>
          {reviews.length === 0 ? (
            <Alert severity="info">Aucun avis pour le moment</Alert>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} sx={{ marginBottom: '16px' }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '8px' }}>
                        {review.title}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" sx={{ marginBottom: '8px' }} />
                      <Typography variant="body2" sx={{ color: '#666', marginBottom: '8px' }}>
                        <strong>De:</strong> {review.reviewer_company || review.reviewer_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#333', marginBottom: '8px' }}>
                        {review.comment}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999', marginTop: '8px', display: 'block' }}>
                        {new Date(review.created_at).toLocaleDateString('fr-TN')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(review)}
                        sx={{ color: theme.palette.primary.main, marginRight: '8px' }}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(review.id)}
                        sx={{ color: '#f44336' }}
                      >
                        Supprimer
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          )}
        </Box>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingId ? 'Modifier l\'Avis' : 'Ajouter un Nouvel Avis'}
          </DialogTitle>
          <DialogContent sx={{ paddingY: '20px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Box>
                <Typography variant="body2" sx={{ marginBottom: '8px' }}>Évaluation</Typography>
                <Rating
                  value={formData.rating}
                  onChange={(e, value) => setFormData({ ...formData, rating: value })}
                  size="large"
                />
              </Box>
              <TextField
                fullWidth
                label="Commentaire"
                multiline
                rows={4}
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              {editingId ? 'Mettre à Jour' : 'Ajouter'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
