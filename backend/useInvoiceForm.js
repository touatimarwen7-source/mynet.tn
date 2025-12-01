import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { procurementAPI } from '../services/procurementAPI';
import { autosaveDraft, recoverDraft, clearDraft } from '../utils/draftStorageHelper';
import debounce from 'lodash.debounce';

/**
 * Custom Hook for managing the multi-step invoice creation form.
 * It encapsulates all state, validation, and API logic.
 */
export const useInvoiceForm = (purchaseOrderId) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [formData, setFormData] = useState({
    purchase_order_id: purchaseOrderId,
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    line_items: [],
    notes: '',
    attachments: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const DRAFT_ID = `invoice_draft_${purchaseOrderId}`;

  // --- Data Loading & Draft Recovery ---
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const response = await procurementAPI.getPurchaseOrder(purchaseOrderId);
        const po = response.data.purchaseOrder;
        setPurchaseOrder(po);

        const draft = recoverDraft(DRAFT_ID);
        if (draft) {
          setFormData(draft);
        } else {
          // Initialize form with PO data if no draft exists
          setFormData(prev => ({
            ...prev,
            line_items: po.items || [],
          }));
        }
      } catch (err) {
        setFormErrors({ general: "Erreur lors du chargement du bon de commande." });
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [purchaseOrderId]);

  // --- Autosave with Debounce ---
  const debouncedSave = useCallback(
    debounce((data) => {
      autosaveDraft(DRAFT_ID, data);
    }, 1500),
    [DRAFT_ID]
  );

  useEffect(() => {
    if (purchaseOrder) { // Only save after initial data has loaded
      debouncedSave(formData);
    }
  }, [formData, purchaseOrder, debouncedSave]);

  // --- Form Validation ---
  const validateStep = () => {
    const newErrors = {};
    switch (currentStep) {
      case 0: // Invoice Details
        if (!formData.invoice_number.trim()) newErrors.invoice_number = 'Le numéro de facture est requis.';
        if (!formData.invoice_date) newErrors.invoice_date = 'La date de facturation est requise.';
        if (!formData.due_date) newErrors.due_date = 'La date d\'échéance est requise.';
        break;
      
      case 1: // Review Items
        if (!formData.line_items || formData.line_items.length === 0) {
          newErrors.line_items = 'La facture doit contenir au moins un article.';
        }
        break;

      case 2: // Review and Submit
        if (!formData.attachments || formData.attachments.length === 0) {
          newErrors.attachments = 'Le fichier de la facture (PDF) est requis.';
        } else if (formData.attachments[0].type !== 'application/pdf') {
          newErrors.attachments = 'Le fichier doit être au format PDF.';
        }
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
    if (!validateStep()) {
        setFormErrors(prev => ({ ...prev, general: 'Veuillez corriger les erreurs avant de soumettre.' }));
        return;
    }

    setSubmitting(true);
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

      await procurementAPI.createInvoice(submitData);
      clearDraft(DRAFT_ID);
      setSuccess(true);
      setTimeout(() => {
        navigate('/invoices');
      }, 2000);
    } catch (err) {
      const apiError = err.response?.data?.message || err.message;
      setFormErrors({ general: `Erreur de soumission: ${apiError}` });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    currentStep,
    purchaseOrder,
    formData,
    formErrors,
    loading,
    submitting,
    success,
    setFormData,
    handleNext,
    handlePrevious,
    handleSubmit,
  };
};