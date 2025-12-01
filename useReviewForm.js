import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { procurementAPI } from '../api/procurementAPI';
import { useToast } from '../contexts/AppContext';

/**
 * Custom Hook to manage the review submission form.
 * @param {string} purchaseOrderId - The ID of the purchase order to be reviewed.
 */
export const useReviewForm = (purchaseOrderId) => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (rating === 0) {
      newErrors.rating = 'Veuillez sélectionner une note.';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Veuillez corriger les erreurs.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await procurementAPI.submitReview({
        purchaseOrderId,
        rating,
        comment,
      });
      addToast('Merci pour votre évaluation!', 'success');
      setTimeout(() => navigate('/my-reviews'), 2000); // Redirect to a list of submitted reviews
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Échec de l\'envoi de l\'évaluation.';
      setFormErrors({ general: errorMsg });
      addToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    rating,
    setRating,
    comment,
    setComment,
    submitting,
    formErrors,
    handleSubmit,
  };
};