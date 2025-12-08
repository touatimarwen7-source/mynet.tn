import axiosInstance from '../services/axiosConfig';

// Invoice APIs
const createInvoice = async (invoiceData) => {
  const response = await axiosInstance.post('/procurement/invoices', invoiceData);
  return response.data;
};

const uploadInvoiceDocument = async (invoiceId, formData) => {
  const response = await axiosInstance.post(
    `/procurement/invoices/${invoiceId}/upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};

const getInvoices = async () => {
  const response = await axiosInstance.get('/procurement/invoices');
  return response.data;
};

const updateInvoiceStatus = async (invoiceId, status, paymentDate) => {
  const response = await axiosInstance.put(`/procurement/invoices/${invoiceId}/status`, {
    status,
    payment_date: paymentDate,
  });
  return response.data;
};

export const procurementAPI = {
  getTenders: (filters) => axiosInstance.get('/procurement/tenders', { params: filters }),
  getTender: (id) => axiosInstance.get(`/procurement/tenders/${id}`),
  getTenderWithOffers: (id) => axiosInstance.get(`/procurement/tenders/${id}/with-offers`),
  getTenderStatistics: (id) => axiosInstance.get(`/procurement/tenders/${id}/statistics`),
  createTender: (data) => axiosInstance.post('/procurement/tenders', data),
  updateTender: (id, data) => axiosInstance.put(`/procurement/tenders/${id}`, data),
  deleteTender: (id) => axiosInstance.delete(`/procurement/tenders/${id}`),
  publishTender: (id) => axiosInstance.post(`/procurement/tenders/${id}/publish`),
  closeTender: (id) => axiosInstance.post(`/procurement/tenders/${id}/close`),
  awardTender: (id, awards) => axiosInstance.post(`/procurement/tenders/${id}/award`, { awards }),
  getMyTenders: (filters) => axiosInstance.get('/procurement/my-tenders', { params: filters }),

  // Direct supply request helpers
  getSuppliers: () => axiosInstance.get('/direct-supply/suppliers'),
  createSupplyRequest: (data) => axiosInstance.post('/direct-supply/create-request', data),

  getOffers: (tenderId) => axiosInstance.get(`/procurement/tenders/${tenderId}/offers`),
  getOffer: (offerId) => axiosInstance.get(`/procurement/offers/${offerId}`),
  getMyOffers: () => axiosInstance.get('/procurement/my-offers'),
  createOffer: (data) => axiosInstance.post('/procurement/offers', data),
  evaluateOffer: (id, data) => axiosInstance.post(`/procurement/offers/${id}/evaluate`, data),
  selectWinner: (id) => axiosInstance.post(`/procurement/offers/${id}/select-winner`),
  rejectOffer: (id) => axiosInstance.post(`/procurement/offers/${id}/reject`),
  requestClarification: (offerId, question) =>
    axiosInstance.post(`/procurement/offers/${offerId}/clarification`, { question }),
  getClarificationRequests: () => axiosInstance.get('/procurement/clarifications/received'),
  getClarificationRequest: (clarificationId) =>
    axiosInstance.get(`/procurement/clarifications/${clarificationId}`),
  respondToClarification: (clarificationId, response) =>
    axiosInstance.post(`/procurement/clarifications/${clarificationId}/respond`, { response }),

  // Supply Request endpoints
  getSupplyRequests: (filters) =>
    axiosInstance.get('/procurement/supply-requests', { params: filters }),
  getSupplyRequest: (id) => axiosInstance.get(`/procurement/supply-requests/${id}`),
  createSupplyRequest: (data) => axiosInstance.post('/procurement/supply-requests', data),
  updateSupplyRequest: (id, data) => axiosInstance.put(`/procurement/supply-requests/${id}`, data),
  getMySupplyRequests: () => axiosInstance.get('/procurement/my-supply-requests'),

  // Purchase Orders (Buyer creates for winning suppliers)
  createPurchaseOrder: (data) => axiosInstance.post('/procurement/purchase-orders', data),
  getMyPurchaseOrders: () => axiosInstance.get('/procurement/my-purchase-orders'),
  getReceivedPurchaseOrders: () => axiosInstance.get('/procurement/received-purchase-orders'),
  getPurchaseOrder: (id) => axiosInstance.get(`/procurement/purchase-orders/${id}`),
  updatePurchaseOrderStatus: (id, status) =>
    axiosInstance.put(`/procurement/purchase-orders/${id}/status`, { status }),

  // Invoices (Supplier creates after delivery)
  createInvoice: createInvoice,
  getMyInvoices: () => axiosInstance.get('/procurement/my-invoices'),
  getReceivedInvoices: () => axiosInstance.get('/procurement/received-invoices'),
  getInvoice: (id) => axiosInstance.get(`/procurement/invoices/${id}`),
  updateInvoiceStatus: updateInvoiceStatus,
  uploadInvoiceDocument: uploadInvoiceDocument,
};