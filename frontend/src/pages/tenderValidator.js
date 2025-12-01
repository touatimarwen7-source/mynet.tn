/**
 * @file tenderValidator.js
 * @description Contains validation logic for the tender creation form.
 */

/**
 * Validates the tender form data before submission.
 * @param {object} formData - The current state of the form data.
 * @param {number} totalCriteria - The sum of all evaluation criteria percentages.
 * @returns {{isValid: boolean, error: string|null}} - An object indicating if the form is valid and an error message if not.
 */
export function validateTender(formData, totalCriteria) {
  if (!formData.title || formData.title.trim().length < 5) {
    return { isValid: false, error: 'Le titre doit contenir au moins 5 caractères' };
  }
  if (!formData.description || formData.description.trim().length < 20) {
    return { isValid: false, error: 'La description doit contenir au moins 20 caractères' };
  }
  if (!formData.deadline) {
    return { isValid: false, error: 'La date de clôture est requise' };
  }
  const now = new Date();
  const deadlineDate = new Date(formData.deadline);
  if (deadlineDate <= now) {
    return { isValid: false, error: 'La date de clôture doit être dans le futur' };
  }
  if (totalCriteria !== 100) {
    return { isValid: false, error: `Les critères d'évaluation doivent totaliser 100% (actuellement: ${totalCriteria}%)` };
  }

  return { isValid: true, error: null };
}