import { useState, useEffect, useCallback } from 'react';
import { procurementAPI } from '../api/procurementAPI';
import { useToast } from '../contexts/AppContext';

/**
 * Custom Hook to manage the multi-step invoice creation form.
 * It fetches the related Purchase Order and handles form state and submission.
 * @param {string} purchaseOrderId - The ID of the PO to create an invoice for.
 */
export const useInvoiceForm = (purchaseOrderId) => {
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true); // For initial PO loading
  const [submitting, setSubmitting] = useState(false); // For form submission
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0], // Default to today
    due_date: '',
    line_items: [],
  });

  // --- Data Loading ---
  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      if (!purchaseOrderId) {
        setLoading(false);
        setFormErrors({ general: 'Purchase Order ID is missing.' });
        return;
      }
      try {
        const response = await procurementAPI.getPurchaseOrder(purchaseOrderId);
        const poData = response.data.purchaseOrder;
        setPurchaseOrder(poData);
        // Pre-fill form with PO data
        setFormData((prev) => ({
          ...prev,
          line_items: poData.lineItems || [],
        }));
        addToast('Purchase Order details loaded.', 'success');
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Failed to load Purchase Order.';
        setFormErrors({ general: errorMsg });
        addToast(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchaseOrder();
  }, [purchaseOrderId, addToast]);

  // --- Form Validation ---
  const validateStep = useCallback(() => {
    const newErrors = {};
    if (currentStep === 0) {
      if (!formData.invoice_number.trim()) newErrors.invoice_number = 'Le numéro de facture est requis.';
      if (!formData.invoice_date) newErrors.invoice_date = 'La date de facturation est requise.';
      if (!formData.due_date) newErrors.due_date = 'La date d\'échéance est requise.';
    }
    if (currentStep === 1) {
      if (!formData.line_items || formData.line_items.length === 0) {
        newErrors.line_items = 'La facture doit contenir au moins un article.';
      }
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, currentStep]);

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
    if (!validateStep()) return;

    setSubmitting(true);
    setFormErrors({});
    try {
      await procurementAPI.createInvoice(purchaseOrderId, formData);
      setSuccess(true);
      addToast('Facture créée avec succès!', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur lors de la création de la facture.';
      setFormErrors({ general: errorMsg });
      addToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    currentStep, purchaseOrder, formData, formErrors, loading, submitting, success,
    setFormData, handleNext, handlePrevious, handleSubmit,
  };
};