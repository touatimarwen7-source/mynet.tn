import { useState, useEffect, useCallback } from 'react';
import { procurementAPI } from '../api/procurementAPI';
import { useToast } from '../contexts/AppContext';

/**
 * Custom Hook to manage the notification preferences page.
 */
export const useNotificationPreferences = () => {
  const { addToast } = useToast();
  const [preferences, setPreferences] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data (preferences and available categories)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [prefsResponse, catsResponse] = await Promise.all([
          procurementAPI.getNotificationPreferences(),
          procurementAPI.getSystemCategories(),
        ]);
        setPreferences(prefsResponse.data.preferences);
        setCategories(catsResponse.data.categories || []);
      } catch (err) {
        setError('Erreur lors du chargement des préférences.');
        addToast('Erreur de chargement.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [addToast]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!preferences) return;

    setSubmitting(true);
    try {
      await procurementAPI.updateNotificationPreferences(preferences);
      addToast('Préférences mises à jour avec succès!', 'success');
    } catch (err) {
      addToast('Échec de la mise à jour des préférences.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [preferences, addToast]);

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  return {
    preferences,
    categories,
    loading,
    submitting,
    error,
    handlePreferenceChange,
    handleSubmit,
  };
};