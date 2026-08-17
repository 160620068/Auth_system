const mongoose = require('mongoose');

/**
 * Payment Mongoose Schema:
 * Tracks payment transactions processed via Stripe (Card) or Cash / Pay Later.
 * NOTE: Sensitive credit card details (card number, CVV, expiry) are NEVER saved here.
 */
const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'inr',
      lowercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending',
    },
    stripeSessionId: {
      type: String,
      default: null,
      sparse: true,
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
      sparse: true,
    },
    idempotencyKey: {
      type: String,
      default: null,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
