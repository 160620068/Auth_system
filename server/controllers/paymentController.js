const stripe = require('../config/stripe');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Trusted Server Catalog (Amounts are defined on backend, never trusted from client)
const PRODUCTS = {
  premium: {
    id: 'premium',
    name: 'Premium Subscription Plan',
    amount: 999, // ₹999 INR
    currency: 'inr',
    description: 'Unlock full features, unlimited access, and priority support.',
  },
};

/**
 * @desc    Create Stripe Checkout Session for Card Payment
 * @route   POST /api/payments/create-checkout-session
 * @access  Private (Authenticated User)
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { planId = 'premium' } = req.body;

    // 1. Resolve trusted product details from backend catalog
    const product = PRODUCTS[planId] || PRODUCTS.premium;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // 2. Create Order record in MongoDB with pending status
    const order = await Order.create({
      user: req.user._id,
      items: [
        {
          name: product.name,
          price: product.amount,
          quantity: 1,
        },
      ],
      totalAmount: product.amount,
      currency: product.currency,
      status: 'pending',
    });

    // 3. Create Payment record in MongoDB with pending status
    const payment = await Payment.create({
      user: req.user._id,
      order: order._id,
      amount: product.amount,
      currency: product.currency,
      paymentMethod: 'card',
      paymentStatus: 'pending',
    });

    // Link payment ID to order
    order.payment = payment._id;
    await order.save();

    // 4. Create Stripe Checkout Session (Stripe handles PCI-compliant card inputs)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.amount * 100, // Stripe expects amount in smallest currency unit (paise)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
      client_reference_id: req.user._id.toString(),
      metadata: {
        paymentId: payment._id.toString(),
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    // 5. Store Stripe Session ID on Payment document
    payment.stripeSessionId = session.id;
    await payment.save();

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize Stripe checkout session.',
    });
  }
};

/**
 * @desc    Process Cash / Pay Later Payment (Offline Flow)
 * @route   POST /api/payments/cash
 * @access  Private (Authenticated User)
 */
const processCashPayment = async (req, res) => {
  try {
    const { planId = 'premium' } = req.body;
    const product = PRODUCTS[planId] || PRODUCTS.premium;

    // 1. Create Order in MongoDB with pending status
    const order = await Order.create({
      user: req.user._id,
      items: [
        {
          name: product.name,
          price: product.amount,
          quantity: 1,
        },
      ],
      totalAmount: product.amount,
      currency: product.currency,
      status: 'pending',
    });

    // 2. Create Payment in MongoDB with cash method & pending status
    const payment = await Payment.create({
      user: req.user._id,
      order: order._id,
      amount: product.amount,
      currency: product.currency,
      paymentMethod: 'cash',
      paymentStatus: 'pending', // NOT marked paid until manually confirmed by admin
    });

    order.payment = payment._id;
    await order.save();

    return res.status(201).json({
      success: true,
      message: 'Cash payment order recorded successfully. Payment status is pending confirmation.',
      payment,
      order,
    });
  } catch (error) {
    console.error('Cash Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record cash payment request.',
    });
  }
};

/**
 * @desc    Stripe Webhook Handler to receive payment completion events securely
 * @route   POST /api/payments/webhook
 * @access  Public (Signature Verified)
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && sig) {
      // Verify signature to prevent forged requests
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Fallback for local testing without signature header
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`✅ Stripe Webhook Received: Checkout Completed for Session ${session.id}`);

    try {
      const paymentId = session.metadata ? session.metadata.paymentId : null;
      let payment;

      if (paymentId) {
        payment = await Payment.findById(paymentId);
      } else {
        payment = await Payment.findOne({ stripeSessionId: session.id });
      }

      if (payment) {
        payment.paymentStatus = 'paid';
        payment.stripePaymentIntentId = session.payment_intent;
        await payment.save();

        // Update corresponding order status
        await Order.findByIdAndUpdate(payment.order, { status: 'completed' });
        console.log(`🎉 Payment #${payment._id} updated to PAID in MongoDB.`);
      }
    } catch (error) {
      console.error('Error updating payment on webhook:', error);
    }
  }

  return res.json({ received: true });
};

/**
 * @desc    Get payment history for logged-in user
 * @route   GET /api/payments/history
 * @access  Private (Authenticated User)
 */
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('order')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error('Fetch Payment History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment history.',
    });
  }
};

/**
 * @desc    Get payment details by ID or Stripe Session ID
 * @route   GET /api/payments/:id
 * @access  Private (Authenticated User)
 */
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { session_id } = req.query;

    let payment;

    if (session_id) {
      payment = await Payment.findOne({ stripeSessionId: session_id }).populate('order');
      
      // Verification check: If Stripe completed session but webhook hasn't arrived yet, sync status directly
      if (payment && payment.paymentStatus === 'pending') {
        try {
          const session = await stripe.checkout.sessions.retrieve(session_id);
          if (session.payment_status === 'paid') {
            payment.paymentStatus = 'paid';
            payment.stripePaymentIntentId = session.payment_intent;
            await payment.save();
            await Order.findByIdAndUpdate(payment.order, { status: 'completed' });
          }
        } catch (e) {
          console.log('Stripe sync check note:', e.message);
        }
      }
    } else {
      payment = await Payment.findById(id).populate('order');
    }

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    // Security check: Ensure user owns this payment record
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this payment.',
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error('Fetch Payment Details Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment details.',
    });
  }
};

/**
 * @desc    Manual / Admin confirmation for cash payment
 * @route   POST /api/payments/:id/confirm-cash
 * @access  Private (Authenticated User)
 */
const confirmCashPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    if (payment.paymentMethod !== 'cash') {
      return res.status(400).json({
        success: false,
        message: 'Only cash payment records can be manually confirmed.',
      });
    }

    payment.paymentStatus = 'paid';
    await payment.save();

    await Order.findByIdAndUpdate(payment.order, { status: 'completed' });

    return res.status(200).json({
      success: true,
      message: 'Cash payment confirmed and marked as PAID successfully.',
      payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm cash payment.',
    });
  }
};

module.exports = {
  createCheckoutSession,
  processCashPayment,
  handleStripeWebhook,
  getPaymentHistory,
  getPaymentById,
  confirmCashPayment,
};
