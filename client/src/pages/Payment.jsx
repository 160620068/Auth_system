import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentCard from '../components/PaymentCard';
import { createCheckoutSession, processCashPayment } from '../services/paymentService';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, Sparkles, Check } from 'lucide-react';

const Payment = () => {
  const [selectedMethod, setSelectedMethod] = useState('card'); // 'card' | 'cash'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handlePayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      if (selectedMethod === 'card') {
        // Option 1: Process via official Stripe Checkout Session
        const data = await createCheckoutSession('premium');
        if (data && data.url) {
          // Redirect browser to Stripe Hosted Checkout URL
          window.location.href = data.url;
        } else {
          setErrorMessage('Failed to initialize Stripe checkout. Please try again.');
          setIsProcessing(false);
        }
      } else if (selectedMethod === 'cash') {
        // Option 2: Process Cash / Pay Later option (offline flow)
        const data = await processCashPayment('premium');
        if (data && data.success) {
          // Redirect to success page with payment ID
          navigate(`/payment/success?payment_id=${data.payment._id}&method=cash`);
        } else {
          setErrorMessage('Failed to process cash request. Please try again.');
          setIsProcessing(false);
        }
      }
    } catch (error) {
      console.error('Payment Submission Error:', error);
      const msg = error.response?.data?.message || 'An error occurred while processing your payment.';
      setErrorMessage(msg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-12 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secure Checkout</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Complete Your Payment
          </h1>
          <p className="text-sm text-slate-400">
            Select your preferred payment method below to activate your plan.
          </p>
        </div>

        {/* Display Error Message if present */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-xs leading-relaxed animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Select Payment Method */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Choose Payment Method
            </h3>

            {/* Option 1: Card (Stripe) */}
            <PaymentCard
              type="card"
              title="💳 Pay with Card"
              subtitle="Secure online payment processed by Stripe Checkout"
              badgeText="Instant"
              isSelected={selectedMethod === 'card'}
              onClick={() => setSelectedMethod('card')}
            />

            {/* Option 2: Cash / Pay Later */}
            <PaymentCard
              type="cash"
              title="💵 Cash / Pay Later"
              subtitle="Pay offline. Marked pending until manual confirmation"
              badgeText="Offline"
              isSelected={selectedMethod === 'cash'}
              onClick={() => setSelectedMethod('cash')}
            />

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2 text-sky-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>PCI-DSS Compliant Security</span>
              </div>
              <p className="leading-relaxed">
                Stripe securely handles all credit card details. No sensitive card numbers or CVVs are stored on our servers.
              </p>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5 p-6 rounded-3xl border border-slate-800 glass-card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
                Order Summary
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Premium Plan</span>
                  <span className="text-sm font-bold text-sky-400">₹999</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Includes full access to all features, priority email support, and system updates.
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center space-x-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-sky-400" />
                    <span>Instant access upon verification</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-sky-400" />
                    <span>Official VAT & GST Invoice</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Amount & Submit Button */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">Total Due:</span>
                <span className="text-2xl font-extrabold text-white">₹999</span>
              </div>

              <button
                type="button"
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>
                      {selectedMethod === 'card' ? 'Connecting to Stripe...' : 'Recording Order...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{selectedMethod === 'card' ? 'Pay ₹999 with Stripe' : 'Confirm Cash Order'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Payment;
