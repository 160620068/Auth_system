const express = require('express');
const {
  createCheckoutSession,
  processCashPayment,
  handleStripeWebhook,
  getPaymentHistory,
  getPaymentById,
  confirmCashPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Public Webhook Endpoint (Stripe sends notifications here) ---
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// --- Protected Payment Routes (Require HTTP-Only JWT Cookie) ---
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/cash', protect, processCashPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/:id', protect, getPaymentById);
router.post('/:id/confirm-cash', protect, confirmCashPayment);

module.exports = router;
