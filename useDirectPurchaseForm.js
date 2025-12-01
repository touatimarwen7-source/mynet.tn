import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { procurementAPI } from '../api/procurementAPI';
import { useToast } from '../contexts/AppContext';
import debounce from 'lodash.debounce';

/**
 * Custom Hook to manage the Direct Purchase Request form.
 */
export const useDirectPurchaseForm = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    supplierId: null,
    title: '',
    lineItems: [{ id: 1, description: '', quantity: 1, unit: 'Unit' }],
    deliveryDeadline: null,
    notes: '',
  });

  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // --- Supplier Search ---
  const fetchSuppliers = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 2) {
        setSuppliers([]);
        return;
      }
      setLoadingSuppliers(true);
      try {
        const response = await procurementAPI.getSuppliers({ search: searchQuery });
        setSuppliers(response.data.suppliers || []);
      } catch (err) {
        addToast('Erreur lors de la recherche des fournisseurs.', 'error');
      } finally {
        setLoadingSuppliers(false);
      }
    }, 500),
    [addToast]
  );

  // --- Form Validation ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.supplierId) newErrors.supplierId = 'Vous devez sélectionner un fournisseur.';
    if (!formData.title.trim()) newErrors.title = 'Le titre de la demande est requis.';
    if (!formData.deliveryDeadline) newErrors.deliveryDeadline = 'La date de livraison est requise.';
    if (formData.lineItems.some(item => !item.description.trim() || item.quantity <= 0)) {
      newErrors.lineItems = 'Tous les articles doivent avoir une description et une quantité valide.';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Veuillez corriger les erreurs dans le formulaire.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await procurementAPI.createDirectPurchaseRequest(formData);
      addToast('Demande d\'achat direct envoyée avec succès!', 'success');
      setTimeout(() => navigate('/dashboard'), 2000); // Redirect to dashboard or a confirmation page
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Échec de l\'envoi de la demande.';
      setFormErrors({ general: errorMsg });
      addToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    formErrors,
    suppliers,
    loadingSuppliers,
    submitting,
    fetchSuppliers,
    handleSubmit,
  };
};