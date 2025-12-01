import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { procurementAPI } from '../api/procurementAPI';
import { autosaveDraft, recoverDraft, clearDraft } from '../utils/draftStorageHelper';
import debounce from 'lodash.debounce';

/**
 * Custom Hook for managing the multi-step supply request creation form.
 */
export const useSupplyRequestForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    request_title: '',
    department: '',
    urgency: 'normal',
    line_items: [],
    delivery_deadline: '',
    delivery_location: '',
    notes: '',
    attachments: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const DRAFT_ID = 'supply_request_draft';

  // --- Draft Recovery ---
  useEffect(() => {
    const draft = recoverDraft(DRAFT_ID);
    if (draft) {
      setFormData(draft);
    }
  }, []);

  // --- Autosave with Debounce ---
  const debouncedSave = useCallback(
    debounce((data) => {
      autosaveDraft(DRAFT_ID, data);
    }, 1500),
    []
  );

  useEffect(() => {
    if (formData.request_title || formData.line_items.length > 0) {
      debouncedSave(formData);
    }
  }, [formData, debouncedSave]);

  // --- Form Validation ---
  const validateStep = () => {
    const newErrors = {};
    switch (currentStep) {
      case 0: // Informations Générales
        if (!formData.request_title.trim()) newErrors.request_title = 'Le titre de la demande est requis.';
        if (!formData.department.trim()) newErrors.department = 'Le département est requis.';
        break;
      
      case 1: // Articles
        if (!formData.line_items || formData.line_items.length === 0) {
          newErrors.line_items = 'Vous devez ajouter au moins un article.';
        }
        break;

      case 2: // Livraison et Notes
        if (!formData.delivery_deadline) newErrors.delivery_deadline = 'La date limite de livraison est requise.';
        break;

      default:
        break;
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Navigation & Submission ---
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    // Run validation for all steps before submitting
    if (!validateStep()) {
        setFormErrors(prev => ({ ...prev, general: 'Veuillez corriger les erreurs avant de soumettre.' }));
        return;
    }

    setLoading(true);
    setFormErrors({});
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'line_items') {
          submitData.append(key, JSON.stringify(value));
        } else if (key === 'attachments') {
          value.forEach(file => submitData.append('attachments', file));
        } else {
          submitData.append(key, value);
        }
      });

      await procurementAPI.createSupplyRequest(submitData);
      clearDraft(DRAFT_ID);
      setSuccess(true);
      setTimeout(() => {
        navigate('/supply-requests');
      }, 2000);
    } catch (err) {
      const apiError = err.response?.data?.message || err.message;
      setFormErrors({ general: `Erreur de soumission: ${apiError}` });
    } finally {
      setLoading(false);
    }
  };

  return {
    currentStep,
    formData,
    formErrors,
    loading,
    success,
    setFormData,
    handleNext,
    handlePrevious,
    handleSubmit,
  };
};