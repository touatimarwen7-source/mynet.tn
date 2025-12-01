import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { procurementAPI } from './procurementAPI';
import { useToast } from '../contexts/AppContext';
import { autosaveDraft, recoverDraft, clearDraft } from '../utils/draftStorageHelper';
import debounce from 'lodash.debounce';

// --- Constants ---
const DRAFT_PREFIX = 'offer_draft_';
const DEFAULT_PAYMENT_TERMS = 'Net30';
const DEFAULT_VALIDITY_DAYS = 30;

const TOAST_DURATION = {
  INFO: 1500,
  SUCCESS: 2500,
  ERROR: 4000,
};

/**
 * Custom Hook for managing the offer submission form.
 * Handles data fetching, draft autosaving, validation, and submission.
 * @param {string} tenderId - The ID of the tender to submit an offer for.
 * @returns {{
 *   tender: object | null,
 *   loading: boolean,
 *   submitting: boolean,
 *   formErrors: object,
 *   success: boolean,
 *   isDeadlinePassed: boolean,
 *   offerData: object,
 *   setOfferData: Function,
 *   handleSubmit: (e: React.FormEvent) => Promise<void>
 * }}
 */
export const useOfferForm = (tenderId) => {
  // --- Hooks and State ---
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [offerData, setOfferData] = useState({
    supplier_ref_number: '',
    validity_period_days: DEFAULT_VALIDITY_DAYS,
    payment_terms: DEFAULT_PAYMENT_TERMS,
    technical_proposal: '',
    line_items: [],
    attachments: [],
    commitment: false
  });

  const DRAFT_ID = `${DRAFT_PREFIX}${tenderId}`;
  const isDeadlinePassed = tender ? new Date() > new Date(tender.deadline) : false;

  // --- Data Loading & Draft Recovery ---
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const response = await procurementAPI.getTender(tenderId);
        const tenderData = response.data.tender;
        setTender(tenderData);

        const draft = recoverDraft(DRAFT_ID);
        if (draft) {
          setOfferData(draft);
        } else {
          const initialLineItems = (tenderData.lots || []).flatMap((lot, lotIdx) =>
            (lot.articles || []).map((article, artIdx) => ({
              id: `${lotIdx}-${artIdx}`,
              lot_id: lot.numero,
              description: article.name,
              quantity: parseFloat(article.quantity) || 1,
              unit: article.unit || 'unité',
              unit_price: 0,
              total_price: 0,
            }))
          );
          setOfferData(prev => ({ ...prev, line_items: initialLineItems }));
        }
        addToast('Appel d\'offres chargé.', 'success', TOAST_DURATION.SUCCESS);
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message;
        setFormErrors({ general: `Erreur de chargement: ${errorMsg}` });
        addToast(`Erreur: ${errorMsg}`, 'error', TOAST_DURATION.ERROR);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [tenderId, addToast, DRAFT_ID]);

  // --- Autosave with Debounce ---
  const debouncedSave = useCallback(
    debounce((data) => {
      autosaveDraft(DRAFT_ID, data);
      addToast('✓ Brouillon sauvegardé', 'info', TOAST_DURATION.INFO);
    }, TOAST_DURATION.INFO),
    [DRAFT_ID, addToast]
  );

  useEffect(() => {
    if (tender) {
      debouncedSave(offerData);
    }
  }, [offerData, tender, debouncedSave]);

  // --- Form Validation ---
  const validateForm = () => {
    const newErrors = {};
    if (isDeadlinePassed) {
      newErrors.general = `La date limite pour cet appel d'offres est passée.`;
    }
    if (!offerData.commitment) {
      newErrors.commitment = 'Vous devez vous engager à respecter les termes de l\'offre.';
    }
    const invalidItems = offerData.line_items.filter(
      item => !item.unit_price || parseFloat(item.unit_price) <= 0
    );
    if (invalidItems.length > 0) {
      newErrors.line_items = `Le prix de ${invalidItems.length} article(s) est invalide. Le prix doit être supérieur à 0.`;
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
    setFormErrors({});
    try {
      const formDataToSubmit = new FormData();
      
      // Append all fields except files and structured data
      Object.entries(offerData).forEach(([key, value]) => {
        if (key !== 'line_items' && key !== 'attachments') {
          formDataToSubmit.append(key, value);
        }
      });

      formDataToSubmit.append('line_items', JSON.stringify(offerData.line_items));
      offerData.attachments.forEach(file => formDataToSubmit.append('attachments', file));
      formDataToSubmit.append('tender_id', tenderId);

      await procurementAPI.createOffer(formDataToSubmit);
      
      clearDraft(DRAFT_ID);
      setSuccess(true);
      addToast('✅ Offre envoyée avec succès!', 'success', TOAST_DURATION.SUCCESS);
      setTimeout(() => navigate('/my-offers'), TOAST_DURATION.SUCCESS);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setFormErrors({ general: `Erreur lors de la soumission: ${errorMsg}` });
      addToast(`Erreur: ${errorMsg}`, 'error', TOAST_DURATION.ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    tender,
    loading,
    submitting,
    formErrors,
    success,
    isDeadlinePassed,
    offerData,
    setOfferData,
    handleSubmit,
  };
};