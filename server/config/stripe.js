const Stripe = require('stripe');

/**
 * Initializes and exports the Stripe Node.js SDK client.
 * Uses process.env.STRIPE_SECRET_KEY securely on the backend only.
 */
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_antigravity';

const stripe = Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16', // Standard API Version
});

module.exports = stripe;
