import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, RefreshCw, Home } from 'lucide-react';

const PaymentCancel = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-12 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl border border-slate-800 glass-card shadow-2xl space-y-8 relative z-10 text-center">
        
        {/* Cancel Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-400">
            <XCircle className="w-10 h-10" />
          </div>
        </div>

        {/* Title & Explanation */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Payment Cancelled
          </h1>
          <p className="text-slate-400 text-sm">
            Your payment session was cancelled. You have not been charged.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
          If you experienced an issue with your card or would like to choose a different payment method, you can try again below.
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/payment"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-500/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Link>

          <Link
            to="/home"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentCancel;
