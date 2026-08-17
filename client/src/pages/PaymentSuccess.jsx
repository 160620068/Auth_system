import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPaymentDetails, confirmCashPayment } from '../services/paymentService';
import { CheckCircle2, Clock, Home, History, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

const PaymentSuccess = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConfirmingCash, setIsConfirmingCash] = useState(false);

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      const paymentId = params.get('payment_id');

      try {
        setLoading(true);
        if (sessionId || paymentId) {
          const data = await getPaymentDetails(paymentId, sessionId);
          if (data && data.payment) {
            setPayment(data.payment);
          }
        }
      } catch (err) {
        console.error('Error fetching payment success details:', err);
        setError('Unable to load payment details. Please check payment history.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [location]);

  const handleConfirmCash = async () => {
    if (!payment) return;
    try {
      setIsConfirmingCash(true);
      const res = await confirmCashPayment(payment._id);
      if (res && res.payment) {
        setPayment(res.payment);
      }
    } catch (err) {
      alert('Error confirming cash payment.');
    } finally {
      setIsConfirmingCash(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950">
        <div className="flex items-center space-x-3 text-sky-400 bg-slate-900/80 px-6 py-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          <span className="font-medium text-slate-200">Verifying payment status...</span>
        </div>
      </div>
    );
  }

  const isPaid = payment ? payment.paymentStatus === 'paid' : true;
  const isCash = payment ? payment.paymentMethod === 'cash' : false;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-12 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl p-8 sm:p-10 rounded-3xl border border-slate-800 glass-card shadow-2xl space-y-8 relative z-10 text-center">
        
        {/* Status Icon */}
        <div className="flex justify-center">
          {isPaid ? (
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
              <Clock className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isPaid ? '🎉 Payment Successful!' : '💵 Cash Order Placed!'}
          </h1>
          <p className="text-slate-400 text-sm">
            Thank you, <span className="font-semibold text-slate-200">{user?.fullName || user?.username || 'Customer'}</span>.
          </p>
          {!isPaid && isCash && (
            <p className="text-xs text-amber-400/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 max-w-md mx-auto mt-2">
              Cash payment selected. Your order will be confirmed after receiving cash offline.
            </p>
          )}
        </div>

        {/* Receipt Details Box */}
        {payment && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Payment ID</span>
              <span className="font-mono text-slate-200 text-[11px]">{payment._id}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Amount Paid</span>
              <span className="font-bold text-sky-400 text-sm">₹{payment.amount}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Payment Method</span>
              <span className="font-semibold text-slate-200 uppercase">{payment.paymentMethod}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Payment Status</span>
              <span
                className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${
                  payment.paymentStatus === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {payment.paymentStatus}
              </span>
            </div>
          </div>
        )}

        {/* Admin Demo: Manual Confirm Cash Button */}
        {payment && isCash && payment.paymentStatus === 'pending' && (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
            <p className="text-[11px] text-slate-400">
              💡 <strong>Testing Mode Option:</strong> Simulate manual admin cash receipt below:
            </p>
            <button
              onClick={handleConfirmCash}
              disabled={isConfirmingCash}
              className="w-full py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              {isConfirmingCash ? 'Confirming...' : 'Mark Cash Payment as PAID'}
            </button>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/home"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>

          <Link
            to="/payment-history"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-500/20 transition-all"
          >
            <History className="w-4 h-4" />
            <span>View Payment History</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccess;
