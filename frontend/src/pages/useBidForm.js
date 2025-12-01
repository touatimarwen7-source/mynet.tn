import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { procurementAPI } from '../api';
import { autosaveDraft, recoverDraft, clearDraft } from '../utils/draftStorageHelper';
import { validateEmail, validatePhone } from '../utils/validationHelpers';
import debounce from 'lodash.debounce';

/**
 * Custom Hook for managing the multi-step bid creation form.
 * It encapsulates state, validation, and API logic, promoting separation of concerns.
 */
export const useBidForm = (tenderId) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [tender, setTender] = useState(null);
  const [tenderItems, setTenderItems] = useState([]);
  const [formData, setFormData] = useState({
    tender_id: tenderId,
    supplier_name: '',
    supplier_contact_person: '',
    supplier_email: '',
    supplier_phone: '',
    supplier_address: '',
    line_items: [],
    delivery_time: '',
    payment_terms: '',
    compliance_statement: false,
    attachments: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);

  // --- Data Loading ---
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const response = await procurementAPI.getTender(tenderId);
        setTender(response.data.tender);
        setTenderItems(response.data.tender.items || []);

        const draft = recoverDraft(`bid_draft_${tenderId}`);
        if (draft) {
          setFormData(draft);
        }
      } catch (err) {
        setFormErrors({ general: "Erreur lors du chargement de l'appel d'offres." });
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [tenderId]);

  // --- Autosave with Debounce ---
  const debouncedSave = useCallback(
    debounce((data) => {
      autosaveDraft(`bid_draft_${tenderId}`, data);
    }, 1500),
    [tenderId]
  );

  useEffect(() => {
    if (tender) { // Only save if tender has loaded
      debouncedSave(formData);
    }
  }, [formData, tender, debouncedSave]);

  // --- Form Validation ---
  const validateStep = () => {
    const newErrors = {};
    switch (currentStep) {
      case 0: { // Informations
        if (!formData.supplier_name.trim()) newErrors.supplier_name = 'Le nom de l\'entreprise est requis.';
        if (!formData.supplier_email.trim()) newErrors.supplier_email = 'L\'email est requis.';
        else if (!validateEmail(formData.supplier_email).valid) newErrors.supplier_email = 'Format d\'email invalide.';
        if (!formData.supplier_phone.trim()) newErrors.supplier_phone = 'Le téléphone est requis.';
        else if (!validatePhone(formData.supplier_phone).valid) newErrors.supplier_phone = 'Format de téléphone invalide.';
        break;
      }
      case 1: { // Éléments
        if (!formData.line_items || formData.line_items.length === 0) {
          newErrors.line_items = 'Vous devez ajouter au moins un article à votre offre.';
        }
        break;
      }
      case 2: { // Conformité
        if (!formData.delivery_time) newErrors.delivery_time = 'Le délai de livraison est requis.';
        if (!formData.payment_terms) newErrors.payment_terms = 'Les conditions de paiement sont requises.';
        if (!formData.compliance_statement) newErrors.compliance_statement = 'Vous devez confirmer votre conformité.';
        break;
      }
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

    setLoading(true);
    setFormErrors({});
    try {
      const submitData = new FormData();
      // Append all form data fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'line_items') {
          submitData.append(key, JSON.stringify(value));
        } else if (key === 'attachments') {
          value.forEach(file => submitData.append('attachments', file));
        } else {
          submitData.append(key, value);
        }
      });

      await procurementAPI.createOffer(submitData);
      clearDraft(`bid_draft_${tenderId}`);
      setSuccessDialog(true);
      setTimeout(() => {
        navigate(`/tender/${tenderId}`);
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
    tender,
    tenderItems,
    formData,
    formErrors,
    loading,
    successDialog,
    setFormData,
    handleNext,
    handlePrevious,
    handleSubmit,
  };
};