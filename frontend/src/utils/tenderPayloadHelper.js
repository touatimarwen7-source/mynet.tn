/**
 * @file tenderPayloadHelper.js
 * @description Contains helper functions for preparing tender API payloads.
 */

/**
 * Prepares the tender data payload for API submission.
 * @param {object} formData - The raw form data from the state.
 * @returns {object} - The formatted tender data object ready for the API.
 */
export function prepareTenderPayload(formData) {
  return {
    title: formData.title?.trim() || '',
    description: formData.description?.trim() || '',
    publication_date: formData.publication_date,
    deadline: formData.deadline,
    budget_min: formData.budget_min ? parseFloat(formData.budget_min) : 0,
    budget_max: formData.budget_max ? parseFloat(formData.budget_max) : 0,
    currency: formData.currency || 'TND',
    category: formData.category || '',
    awardLevel: formData.awardLevel || 'lot',
    offer_validity_days: formData.offer_validity_days ? parseInt(formData.offer_validity_days) : 30,
    lots: formData.lots || [],
    evaluation_criteria: formData.evaluation_criteria || {},
    requirements: formData.requirements || {},
    documents: formData.documents || [],
    additional_info: formData.additional_info || ''
  };
}