import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showToast } from '../utils/toast';

const initialFormData = {
  title: '',
  description: '',
  status: 'draft',
  submission_deadline: null,
  opening_date: null,
  enquiry_period_end_date: null,
  tender_bond_amount: '',
  award_level: 'global',
  lots: [],
  requirements: [],
  evaluation_criteria: [],
  attachments: [],
};

export const useTenderForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const validateStep = useCallback(() => {
    const errors = {};
    // Step 0: Basic Info
    if (currentStep === 0) {
      if (!formData.title.trim()) errors.title = "Le titre de l'appel d'offres est requis.";
      if (!formData.submission_deadline) errors.submission_deadline = 'La date limite de soumission est requise.';
      if (!formData.opening_date) errors.opening_date = 'La date d\'ouverture est requise.';
      if (formData.opening_date && formData.submission_deadline && new Date(formData.opening_date) <= new Date(formData.submission_deadline)) {
        errors.opening_date = "La date d'ouverture doit être postérieure à la date de soumission.";
      }
    }
    // Step 1: Lots
    if (currentStep === 1) {
      if (formData.lots.length === 0) {
        errors.lots = "Vous devez définir au moins un lot.";
      }
    }
    // Step 2: Requirements
    if (currentStep === 2) {
        if (formData.requirements.length === 0) {
            errors.requirements = "Vous devez ajouter au moins une exigence.";
        }
    }
    // Step 3: Evaluation Criteria
    if (currentStep === 3) {
      const totalWeight = formData.evaluation_criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
      if (totalWeight !== 100) {
        errors.evaluation_criteria = `La somme des poids des critères doit être égale à 100%. Total actuel : ${totalWeight}%.`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, formData]);

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setFormErrors({});
    try {
      // Assuming you have a draft endpoint or your create endpoint handles drafts
      const payload = { ...formData, status: 'draft' };
      await api.post('/procurement/tenders', payload);
      showToast('Brouillon enregistré avec succès.', 'success');
    } catch (error) {
      console.error('Error saving draft:', error);
      setFormErrors({ general: "Erreur lors de l'enregistrement du brouillon." });
      showToast("Erreur lors de l'enregistrement du brouillon.", 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before final submission
    // This is a simplified validation check. A more robust implementation
    // would check all fields.
    if (formData.lots.length === 0 || formData.evaluation_criteria.length === 0 || !formData.title) {
        setFormErrors({ general: "Veuillez remplir toutes les sections requises avant de soumettre." });
        showToast("Veuillez remplir toutes les sections requises.", 'error');
        return;
    }

    setLoading(true);
    setFormErrors({});
    console.log('🔄 [CreateTender] Submitting tender with data:', {
        title: formData.title,
        lots: formData.lots.length,
        criteria: formData.evaluation_criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0) + '%',
    });

    try {
        const payload = { ...formData, status: 'published' };
        console.log('📤 Sending API request to /procurement/tenders');
        const response = await api.post('/procurement/tenders', payload);

        if (response.data && response.data.tender_id) {
            console.log('✅ [CreateTender] Tender created successfully:', response.data);
            showToast('Appel d\'offres créé avec succès!', 'success');
            navigate(`/tender/${response.data.tender_id}`);
        } else {
            throw new Error('Invalid response from server.');
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Une erreur inattendue s'est produite.";
        console.error('❌ [CreateTender] Submit error:', {
            message: errorMessage,
            status: error.response?.status,
            response: error.response?.data,
        });
        setFormErrors({ general: `Erreur de soumission : ${errorMessage}` });
        showToast(`Erreur : ${errorMessage}`, 'error');
    } finally {
        setLoading(false);
    }
  };

  // Auto-save draft periodically
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title) { // Only save if there's at least a title
        // handleSaveDraft(); // This can be enabled for auto-saving
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timer);
  }, [formData]);

  return {
    currentStep,
    formData,
    formErrors,
    loading,
    isSavingDraft,
    setFormData,
    setFormErrors,
    handleNext,
    handlePrevious,
    handleSubmit,
    handleSaveDraft,
  };
};