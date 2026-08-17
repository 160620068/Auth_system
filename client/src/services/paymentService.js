import api from './api';

/**
 * Service for communicating with Backend Payment Endpoints
 */
export const createCheckoutSession = async (planId = 'premium') => {
  const response = await api.post('/payments/create-checkout-session', { planId });
  return response.data;
};

export const processCashPayment = async (planId = 'premium') => {
  const response = await api.post('/payments/cash', { planId });
  return response.data;
};

export const getPaymentHistory = async () => {
  const response = await api.get('/payments/history');
  return response.data;
};

export const getPaymentDetails = async (id, sessionId = null) => {
  const url = sessionId
    ? `/payments/${id || 'details'}?session_id=${sessionId}`
    : `/payments/${id}`;
  const response = await api.get(url);
  return response.data;
};

export const confirmCashPayment = async (paymentId) => {
  const response = await api.post(`/payments/${paymentId}/confirm-cash`);
  return response.data;
};
