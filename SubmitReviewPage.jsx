import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Rating,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useReviewForm } from '../hooks/useReviewForm';
import { setPageTitle } from '../utils/pageTitle';

/**
 * A page for a buyer to submit a review for a completed purchase order.
 */
const SubmitReviewPage = () => {
  const { purchaseOrderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle(`Évaluation du BC #${purchaseOrderId}`);
  }, [purchaseOrderId]);

  const {
    rating,
    setRating,
    comment,
    setComment,
    submitting,
    formErrors,
    handleSubmit,
  } = useReviewForm(purchaseOrderId);

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="sm">
        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none' }}>
          <CardContent sx={{ padding: '40px' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/reviewable-orders')} sx={{ mb: 3 }}>
              Retour
            </Button>
            <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
              Évaluer le Fournisseur
            </Typography>
            <Typography sx={{ mb: 4 }}>
              Pour la commande <strong>#{purchaseOrderId}</strong>
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Typography component="legend">Votre note globale</Typography>
                <Rating
                  name="rating"
                  value={rating}
                  onChange={(event, newValue) => {
                    setRating(newValue);
                  }}
                  size="large"
                />
                {formErrors.rating && <Alert severity="error" sx={{ width: 'fit-content' }}>{formErrors.rating}</Alert>}

                <TextField label="Votre commentaire (optionnel)" multiline rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />

                {formErrors.general && <Alert severity="error">{formErrors.general}</Alert>}

                <Button type="submit" variant="contained" size="large" disabled={submitting}>
                  {submitting ? <CircularProgress size={24} /> : 'Envoyer mon évaluation'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SubmitReviewPage;