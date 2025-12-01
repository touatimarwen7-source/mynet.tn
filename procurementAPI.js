import apiClient from './apiClient';

/**
 * An object containing all API functions related to procurement.
 * It uses the centralized apiClient for making requests.
 */
export const procurementAPI = {
  /**
   * Fetches a list of all available tenders, with optional filtering.
   * @param {object} params - Query parameters for filtering (e.g., { page, limit, category }).
   * @returns {Promise<AxiosResponse<any>>}
   */
  getTenders: (params) => apiClient.get('/tenders', { params }),

  /**
   * Fetches the details for a single tender.
   * @param {string} tenderId - The ID of the tender.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getTender: (tenderId) => apiClient.get(`/tenders/${tenderId}`),

  /**
   * Creates a new offer for a tender.
   * @param {FormData} formData - The form data for the offer, which can include files.
   * @returns {Promise<AxiosResponse<any>>}
   */
  createOffer: (formData) => {
    // For multipart/form-data, we let the browser set the Content-Type header
    // to ensure the boundary is set correctly.
    return apiClient.post('/offers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Fetches all offers submitted by the current supplier.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getMyOffers: () => apiClient.get('/my-offers'),

  /**
   * --- PHASE 2: Awarding & PO ---
   */

  /**
   * Fetches all submitted offers for a specific tender (for the buyer).
   * @param {string} tenderId - The ID of the tender.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getTenderOffers: (tenderId) => apiClient.get(`/tenders/${tenderId}/offers`),

  /**
   * Awards a tender to a specific offer. This will trigger PO creation on the backend.
   * @param {string} tenderId - The ID of the tender to award.
   * @param {string} winningOfferId - The ID of the winning offer.
   * @returns {Promise<AxiosResponse<any>>} - The response should contain the newly created Purchase Order.
   */
  awardTender: (tenderId, winningOfferId) => apiClient.post(`/tenders/${tenderId}/award`, { winningOfferId }),

  /**
   * Fetches the details of a specific Purchase Order.
   * @param {string} purchaseOrderId - The ID of the purchase order.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getPurchaseOrder: (purchaseOrderId) => apiClient.get(`/purchase-orders/${purchaseOrderId}`),

  /**
   * --- PHASE 2: Invoicing ---
   */

  /**
   * Creates a new invoice for a given purchase order.
   * This would be used by the supplier.
   * @param {string} purchaseOrderId - The ID of the purchase order to invoice.
   * @param {object} invoiceData - The invoice data (invoice number, dates, etc.).
   * @returns {Promise<AxiosResponse<any>>} - The response should contain the newly created invoice.
   */
  createInvoice: (purchaseOrderId, invoiceData) =>
    apiClient.post(`/purchase-orders/${purchaseOrderId}/invoices`, invoiceData),
  
  /**
   * Fetches all purchase orders received by the current supplier.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getMyPurchaseOrders: () => apiClient.get('/my-purchase-orders'),

  /**
   * --- PHASE 2: Audit Log ---
   */

  /**
   * Fetches the audit log/history for a specific tender.
   * @param {string} tenderId - The ID of the tender.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getTenderHistory: (tenderId) => apiClient.get(`/tenders/${tenderId}/audit-log`),

  /**
   * --- ADMIN: User Management ---
   */

  /**
   * Fetches a list of all users for the admin dashboard.
   * @param {object} params - Query parameters for filtering/searching (e.g., { search, role }).
   * @returns {Promise<AxiosResponse<any>>}
   */
  getUsers: (params) => apiClient.get('/admin/users', { params }),

  /**
   * Updates a user's details (e.g., role, status).
   * @param {string} userId - The ID of the user to update.
   * @param {object} userData - The data to update (e.g., { role: 'Buyer', isActive: false }).
   * @returns {Promise<AxiosResponse<any>>}
   */
  updateUser: (userId, userData) => apiClient.patch(`/admin/users/${userId}`, userData),

  /**
   * --- PHASE 2: Subscriptions & Payments ---
   */

  /**
   * Fetches the available subscription plans.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getSubscriptionPlans: () => apiClient.get('/subscriptions/plans'),

  /**
   * Creates a checkout session with the payment gateway (e.g., Stripe).
   * The backend will return a URL to redirect the user to.
   * @param {string} planId - The ID of the plan to subscribe to.
   * @returns {Promise<AxiosResponse<any>>}
   */
  createCheckoutSession: (planId) => apiClient.post('/subscriptions/create-checkout-session', { planId }),

  /**
   * --- PHASE 3: Direct Purchase ---
   */

  /**
   * Fetches a list of suppliers for direct purchase selection.
   * @param {object} params - Query parameters for searching suppliers (e.g., { search }).
   * @returns {Promise<AxiosResponse<any>>}
   */
  getSuppliers: (params) => apiClient.get('/suppliers', { params }),

  /**
   * Creates and sends a direct purchase request to a specific supplier.
   * @param {object} requestData - The direct purchase request data.
   * @returns {Promise<AxiosResponse<any>>}
   */
  createDirectPurchaseRequest: (requestData) => apiClient.post('/direct-purchase-requests', requestData),

  /**
   * --- PHASE 3: Reviews & Ratings ---
   */

  /**
   * Fetches a list of completed orders that are eligible for a review by the current user.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getReviewableOrders: () => apiClient.get('/reviews/reviewable-orders'),

  /**
   * Submits a review for a completed purchase order.
   * @param {object} reviewData - The review data (e.g., { purchaseOrderId, rating, comment }).
   * @returns {Promise<AxiosResponse<any>>}
   */
  submitReview: (reviewData) => apiClient.post('/reviews', reviewData),

  /**
   * --- PHASE 3: Offer Analysis Engine ---
   */

  /**
   * Fetches the automated analysis report for a tender's offers.
   * @param {string} tenderId - The ID of the tender.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getTenderAnalysisReport: (tenderId) => apiClient.get(`/tenders/${tenderId}/analysis-report`),

  /**
   * --- PHASE 3: Smart Alerts ---
   */

  /**
   * Fetches the current user's notification preferences.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getNotificationPreferences: () => apiClient.get('/user/notification-preferences'),

  /**
   * Updates the current user's notification preferences.
   * @param {object} preferences - The new preferences object.
   * @returns {Promise<AxiosResponse<any>>}
   */
  updateNotificationPreferences: (preferences) => apiClient.put('/user/notification-preferences', preferences),

  /**
   * Fetches the list of all available business categories for preferences.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getSystemCategories: () => apiClient.get('/system/categories'),
};